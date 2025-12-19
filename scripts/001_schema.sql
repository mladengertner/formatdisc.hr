-- SlavkoKernel™ Enterprise Database Schema
-- FormatDisc.hr Production-Ready SaaS Platform
-- SUPABASE-SAFE VERSION with auth.uid()::uuid casts

-- Ensure auth schema exists (Supabase requirement)
CREATE SCHEMA IF NOT EXISTS auth;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USER MANAGEMENT TABLES
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  company_name TEXT,
  role TEXT DEFAULT 'user',
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
  
  -- XP System
  xp_points INTEGER DEFAULT 0,
  xp_level INTEGER DEFAULT 1,
  badges JSONB DEFAULT '[]'::JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUBSCRIPTION MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Stripe integration
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  
  -- Subscription details
  tier TEXT NOT NULL CHECK (tier IN ('starter', 'professional', 'enterprise')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AI ORCHESTRATION TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS public.ai_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Agent configuration
  name TEXT NOT NULL,
  description TEXT,
  model_name TEXT NOT NULL,
  status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'paused', 'failed', 'completed')),
  
  -- Configuration
  config JSONB DEFAULT '{}'::JSONB,
  
  -- Execution stats
  total_runs INTEGER DEFAULT 0,
  successful_runs INTEGER DEFAULT 0,
  failed_runs INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Execution details
  input_data JSONB,
  output_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  error_message TEXT,
  
  -- Performance metrics
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  tokens_used INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- METRICS & MONITORING
-- ============================================

CREATE TABLE IF NOT EXISTS public.metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Metric details
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,
  
  -- Context
  context JSONB DEFAULT '{}'::JSONB,
  
  -- Timestamp
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metrics_user_time ON public.metrics(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_type_time ON public.metrics(metric_type, recorded_at DESC);

-- ============================================
-- AUDIT LOG (Compliance)
-- ============================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  -- Event details
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  
  -- Event data
  event_data JSONB DEFAULT '{}'::JSONB,
  ip_address INET,
  user_agent TEXT,
  
  -- Cryptographic signature for audit proof
  signature TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_time ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_type_time ON public.audit_logs(event_type, created_at DESC);

-- ============================================
-- XP & GAMIFICATION
-- ============================================

CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Transaction details
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS & TRIGGERS (SECURITY DEFINER)
-- ============================================

-- Added SECURITY DEFINER and SET search_path for Supabase safety
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Added SECURITY DEFINER and SET search_path
CREATE OR REPLACE FUNCTION calculate_xp_level(xp_points INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN FLOOR(SQRT(xp_points::NUMERIC / 100.0))::INTEGER + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE
SECURITY DEFINER
SET search_path = public, auth;

-- Added SECURITY DEFINER and SET search_path
CREATE OR REPLACE FUNCTION add_xp(p_user_id UUID, p_amount INTEGER, p_reason TEXT)
RETURNS void AS $$
DECLARE
    v_new_xp INTEGER;
    v_new_level INTEGER;
BEGIN
    IF p_amount = 0 THEN
      RAISE EXCEPTION 'XP amount cannot be zero';
    END IF;
    
    INSERT INTO public.xp_transactions (user_id, amount, reason)
    VALUES (p_user_id, p_amount, p_reason);
    
    UPDATE public.profiles
    SET xp_points = xp_points + p_amount,
        xp_level = calculate_xp_level(xp_points + p_amount)
    WHERE id = p_user_id
    RETURNING xp_points, xp_level INTO v_new_xp, v_new_level;
    
    INSERT INTO public.audit_logs (user_id, event_type, event_category, event_data)
    VALUES (
        p_user_id,
        'xp_added',
        'gamification',
        jsonb_build_object(
            'amount', p_amount,
            'reason', p_reason,
            'new_xp', v_new_xp,
            'new_level', v_new_level
        )
    );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;

-- ============================================
-- ROW LEVEL SECURITY (RLS) WITH ::uuid CASTS
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;
DROP POLICY IF EXISTS "ai_agents_select_own" ON public.ai_agents;
DROP POLICY IF EXISTS "ai_agents_insert_own" ON public.ai_agents;
DROP POLICY IF EXISTS "ai_agents_update_own" ON public.ai_agents;
DROP POLICY IF EXISTS "ai_agents_delete_own" ON public.ai_agents;
DROP POLICY IF EXISTS "ai_executions_select_own" ON public.ai_executions;
DROP POLICY IF EXISTS "ai_executions_insert_own" ON public.ai_executions;
DROP POLICY IF EXISTS "metrics_select_own" ON public.metrics;
DROP POLICY IF EXISTS "audit_logs_select_own" ON public.audit_logs;
DROP POLICY IF EXISTS "xp_transactions_select_own" ON public.xp_transactions;

-- All policies now use auth.uid()::uuid for Supabase type safety

-- Profiles policies
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid()::uuid = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid()::uuid = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid()::uuid = id);

-- Subscriptions policies
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (auth.uid()::uuid = user_id);

-- AI Agents policies
CREATE POLICY "ai_agents_select_own"
  ON public.ai_agents FOR SELECT
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "ai_agents_insert_own"
  ON public.ai_agents FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "ai_agents_update_own"
  ON public.ai_agents FOR UPDATE
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "ai_agents_delete_own"
  ON public.ai_agents FOR DELETE
  USING (auth.uid()::uuid = user_id);

-- AI Executions policies
CREATE POLICY "ai_executions_select_own"
  ON public.ai_executions FOR SELECT
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "ai_executions_insert_own"
  ON public.ai_executions FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);

-- Metrics policies (allow NULL user_id for system metrics)
CREATE POLICY "metrics_select_own"
  ON public.metrics FOR SELECT
  USING (auth.uid()::uuid = user_id OR user_id IS NULL);

-- Audit logs policies (allow NULL user_id for system events)
CREATE POLICY "audit_logs_select_own"
  ON public.audit_logs FOR SELECT
  USING (auth.uid()::uuid = user_id OR user_id IS NULL);

-- XP Transactions policies
CREATE POLICY "xp_transactions_select_own"
  ON public.xp_transactions FOR SELECT
  USING (auth.uid()::uuid = user_id);

-- ============================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles(xp_points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON public.profiles(xp_level DESC);
CREATE INDEX IF NOT EXISTS idx_ai_executions_agent_status ON public.ai_executions(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_executions_user_time ON public.ai_executions(user_id, created_at DESC);

-- ============================================
-- LEADERBOARD VIEW
-- ============================================

CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  id,
  display_name,
  xp_points,
  xp_level,
  badges
FROM public.profiles
ORDER BY xp_points DESC
LIMIT 100;

-- ============================================
-- DOCUMENTATION
-- ============================================

COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users with subscription and XP data';
COMMENT ON TABLE public.subscriptions IS 'Stripe subscription management for tier-based access';
COMMENT ON TABLE public.ai_agents IS 'AI agent configurations for orchestration';
COMMENT ON TABLE public.ai_executions IS 'AI agent execution history and performance metrics';
COMMENT ON TABLE public.metrics IS 'Real-time performance metrics for dashboard';
COMMENT ON TABLE public.audit_logs IS 'Compliance-ready audit log with cryptographic signatures';
COMMENT ON TABLE public.xp_transactions IS 'Gamification XP transaction history';
