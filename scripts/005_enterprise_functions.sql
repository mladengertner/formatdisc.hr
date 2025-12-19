-- ============================================================
-- FORMATDISC.HR - ENTERPRISE SQL FUNCTIONS
-- ============================================================
-- Version: 1.0.0
-- Description: Stripe webhook handler, audit signatures, 
--              rate-limiting, and automated cleanup
-- Author: FORMATDISC Team
-- ============================================================

-- Ensure auth schema exists
CREATE SCHEMA IF NOT EXISTS auth;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. STRIPE WEBHOOK HANDLER
-- ============================================================

-- Create webhook events table for idempotency
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/update
CREATE POLICY "webhook_events_service_only"
ON public.webhook_events
USING (false);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_webhook_events_stripe_id ON public.webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON public.webhook_events(processed);

-- Stripe webhook handler function
CREATE OR REPLACE FUNCTION public.process_stripe_webhook(
    p_stripe_event_id TEXT,
    p_event_type TEXT,
    p_payload JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
    v_customer_id TEXT;
    v_subscription_id TEXT;
    v_user_id UUID;
    v_tier TEXT;
    v_status TEXT;
    v_already_processed BOOLEAN;
BEGIN
    -- Check idempotency
    SELECT processed INTO v_already_processed
    FROM public.webhook_events
    WHERE stripe_event_id = p_stripe_event_id;

    IF v_already_processed THEN
        RETURN TRUE; -- Already processed
    END IF;

    -- Insert webhook event
    INSERT INTO public.webhook_events (stripe_event_id, event_type, payload)
    VALUES (p_stripe_event_id, p_event_type, p_payload)
    ON CONFLICT (stripe_event_id) DO NOTHING;

    -- Process subscription events
    IF p_event_type IN ('customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted') THEN
        v_customer_id := p_payload->'data'->'object'->>'customer';
        v_subscription_id := p_payload->'data'->'object'->>'id';
        v_status := p_payload->'data'->'object'->>'status';
        
        -- Extract tier from metadata or plan nickname
        v_tier := COALESCE(
            p_payload->'data'->'object'->'metadata'->>'tier',
            CASE p_payload->'data'->'object'->'items'->'data'->0->'plan'->>'nickname'
                WHEN 'Starter' THEN 'starter'
                WHEN 'Professional' THEN 'professional'
                WHEN 'Enterprise' THEN 'enterprise'
                ELSE 'free'
            END
        );

        -- Get user_id from stripe_customers table
        SELECT user_id INTO v_user_id
        FROM public.stripe_customers
        WHERE stripe_customer_id = v_customer_id;

        IF v_user_id IS NOT NULL THEN
            -- Upsert subscription
            INSERT INTO public.subscriptions (
                user_id,
                stripe_customer_id,
                stripe_subscription_id,
                tier,
                status,
                current_period_start,
                current_period_end
            ) VALUES (
                v_user_id,
                v_customer_id,
                v_subscription_id,
                v_tier,
                v_status,
                to_timestamp((p_payload->'data'->'object'->>'current_period_start')::bigint),
                to_timestamp((p_payload->'data'->'object'->>'current_period_end')::bigint)
            )
            ON CONFLICT (stripe_subscription_id) DO UPDATE SET
                tier = EXCLUDED.tier,
                status = EXCLUDED.status,
                current_period_start = EXCLUDED.current_period_start,
                current_period_end = EXCLUDED.current_period_end,
                updated_at = NOW();

            -- Update user profile tier
            UPDATE public.profiles
            SET subscription_tier = v_tier
            WHERE id = v_user_id;
        END IF;
    END IF;

    -- Mark as processed
    UPDATE public.webhook_events
    SET processed = TRUE, processed_at = NOW()
    WHERE stripe_event_id = p_stripe_event_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

-- ============================================================
-- 2. AUDIT LOG WITH CRYPTOGRAPHIC SIGNATURE
-- ============================================================

-- Generate HMAC-SHA256 signature for audit logs
CREATE OR REPLACE FUNCTION public.generate_audit_signature(
    p_user_id UUID,
    p_event_type TEXT,
    p_event_data JSONB,
    p_timestamp TIMESTAMPTZ
)
RETURNS TEXT AS $$
DECLARE
    v_message TEXT;
    v_secret TEXT;
    v_signature TEXT;
BEGIN
    -- Get secret from environment or use default (in production, use Supabase Vault)
    v_secret := current_setting('app.audit_secret', true);
    IF v_secret IS NULL THEN
        v_secret := 'default-audit-secret-change-in-production';
    END IF;

    -- Create message to sign
    v_message := p_user_id::TEXT || '|' || p_event_type || '|' || p_event_data::TEXT || '|' || p_timestamp::TEXT;
    
    -- Generate HMAC-SHA256 signature
    v_signature := encode(hmac(v_message, v_secret, 'sha256'), 'hex');
    
    RETURN v_signature;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

-- Enhanced audit log function with signature
CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_event_category TEXT,
    p_event_data JSONB,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_signature TEXT;
    v_audit_id UUID;
BEGIN
    -- Generate signature
    v_signature := public.generate_audit_signature(
        p_user_id,
        p_event_type,
        p_event_data,
        NOW()
    );

    -- Insert audit log
    INSERT INTO public.audit_logs (
        user_id,
        event_type,
        event_category,
        event_data,
        ip_address,
        user_agent,
        signature,
        created_at
    ) VALUES (
        p_user_id,
        p_event_type,
        p_event_category,
        p_event_data,
        p_ip_address,
        p_user_agent,
        v_signature,
        NOW()
    )
    RETURNING id INTO v_audit_id;

    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

-- ============================================================
-- 3. RATE LIMITING FOR AI AGENTS
-- ============================================================

-- Check if user has exceeded rate limit
CREATE OR REPLACE FUNCTION public.check_ai_rate_limit(
    p_user_id UUID,
    p_time_window INTERVAL DEFAULT '1 hour'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_request_count INTEGER;
    v_limit INTEGER;
    v_subscription_tier TEXT;
BEGIN
    -- Get user subscription tier
    SELECT subscription_tier INTO v_subscription_tier
    FROM public.profiles
    WHERE id = p_user_id;

    -- Set limits based on tier
    v_limit := CASE v_subscription_tier
        WHEN 'enterprise' THEN 1000
        WHEN 'professional' THEN 500
        WHEN 'starter' THEN 250
        ELSE 100 -- free tier
    END;

    -- Count requests in time window
    SELECT COUNT(*) INTO v_request_count
    FROM public.agent_logs
    WHERE user_id = p_user_id
    AND created_at > NOW() - p_time_window;

    RETURN v_request_count < v_limit;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

-- Record AI execution with rate limiting
CREATE OR REPLACE FUNCTION public.record_ai_execution(
    p_agent_id UUID,
    p_user_id UUID,
    p_prompt TEXT,
    p_response TEXT DEFAULT NULL,
    p_status TEXT DEFAULT 'completed',
    p_error TEXT DEFAULT NULL,
    p_latency INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_execution_id UUID;
    v_rate_limit_ok BOOLEAN;
    v_xp_reward INTEGER;
BEGIN
    -- Check rate limit
    v_rate_limit_ok := public.check_ai_rate_limit(p_user_id);
    
    IF NOT v_rate_limit_ok THEN
        RAISE EXCEPTION 'Rate limit exceeded for user %', p_user_id
            USING ERRCODE = '42501'; -- insufficient_privilege
    END IF;

    -- Insert execution record
    INSERT INTO public.agent_logs (
        agent_id,
        user_id,
        prompt,
        response,
        status,
        error,
        latency,
        created_at
    ) VALUES (
        p_agent_id,
        p_user_id,
        p_prompt,
        p_response,
        p_status,
        p_error,
        p_latency,
        NOW()
    ) RETURNING id INTO v_execution_id;

    -- Calculate XP reward
    v_xp_reward := CASE
        WHEN p_status = 'completed' THEN 10
        ELSE 5
    END;

    -- Bonus XP for fast execution (< 1 second)
    IF p_latency IS NOT NULL AND p_latency < 1000 THEN
        v_xp_reward := v_xp_reward + 5;
    END IF;

    -- Award XP
    INSERT INTO public.xp_events (user_id, event_type, xp_amount, metadata)
    VALUES (
        p_user_id,
        'agent_execution',
        v_xp_reward,
        jsonb_build_object(
            'agent_id', p_agent_id,
            'execution_id', v_execution_id,
            'latency', p_latency,
            'status', p_status
        )
    );

    -- Update user total XP
    UPDATE public.profiles
    SET total_xp = total_xp + v_xp_reward
    WHERE id = p_user_id;

    RETURN v_execution_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

-- ============================================================
-- 4. AUTOMATED CLEANUP OF OLD DATA
-- ============================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS TABLE(
    audit_deleted BIGINT,
    metrics_deleted BIGINT,
    executions_deleted BIGINT,
    webhooks_deleted BIGINT
) AS $$
DECLARE
    v_audit_retention INTERVAL := '90 days';
    v_metrics_retention INTERVAL := '30 days';
    v_executions_retention INTERVAL := '365 days';
    v_webhooks_retention INTERVAL := '30 days';
    v_audit_count BIGINT;
    v_metrics_count BIGINT;
    v_executions_count BIGINT;
    v_webhooks_count BIGINT;
BEGIN
    -- Cleanup old audit logs
    DELETE FROM public.audit_logs 
    WHERE created_at < NOW() - v_audit_retention;
    GET DIAGNOSTICS v_audit_count = ROW_COUNT;

    -- Cleanup old metrics
    DELETE FROM public.metrics 
    WHERE recorded_at < NOW() - v_metrics_retention;
    GET DIAGNOSTICS v_metrics_count = ROW_COUNT;

    -- Cleanup old agent executions
    DELETE FROM public.agent_logs 
    WHERE created_at < NOW() - v_executions_retention;
    GET DIAGNOSTICS v_executions_count = ROW_COUNT;

    -- Cleanup old processed webhooks
    DELETE FROM public.webhook_events 
    WHERE processed = TRUE 
    AND created_at < NOW() - v_webhooks_retention;
    GET DIAGNOSTICS v_webhooks_count = ROW_COUNT;

    -- Log cleanup event
    INSERT INTO public.audit_logs (
        event_type,
        event_category,
        event_data,
        created_at
    ) VALUES (
        'data_cleanup',
        'system',
        jsonb_build_object(
            'audit_deleted', v_audit_count,
            'metrics_deleted', v_metrics_count,
            'executions_deleted', v_executions_count,
            'webhooks_deleted', v_webhooks_count
        ),
        NOW()
    );

    RETURN QUERY SELECT v_audit_count, v_metrics_count, v_executions_count, v_webhooks_count;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

-- ============================================================
-- GRANTS
-- ============================================================

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.check_ai_rate_limit(UUID, INTERVAL) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_ai_execution(UUID, UUID, TEXT, TEXT, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event(UUID, TEXT, TEXT, JSONB, INET, TEXT) TO authenticated;

-- Grant execute on webhook handler to service role only
GRANT EXECUTE ON FUNCTION public.process_stripe_webhook(TEXT, TEXT, JSONB) TO service_role;

-- Grant execute on cleanup to service role only (for cron)
GRANT EXECUTE ON FUNCTION public.cleanup_old_data() TO service_role;

-- ============================================================
-- COMMENTS
-- ============================================================

COMMENT ON FUNCTION public.process_stripe_webhook IS 'Processes Stripe webhook events with idempotency';
COMMENT ON FUNCTION public.generate_audit_signature IS 'Generates HMAC-SHA256 signature for audit logs';
COMMENT ON FUNCTION public.log_audit_event IS 'Logs audit event with cryptographic signature';
COMMENT ON FUNCTION public.check_ai_rate_limit IS 'Checks if user has exceeded AI agent rate limit';
COMMENT ON FUNCTION public.record_ai_execution IS 'Records AI agent execution with rate limiting and XP rewards';
COMMENT ON FUNCTION public.cleanup_old_data IS 'Automated cleanup of old audit logs, metrics, and executions';
