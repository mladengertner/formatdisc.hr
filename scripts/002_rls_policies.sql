-- Row Level Security (RLS) Policies
-- SlavkoKernel™ Enterprise Security Layer
-- SUPABASE-SAFE VERSION with auth.uid()::uuid casts and null guards

-- Note: This script is now OPTIONAL since 001_schema.sql includes all RLS policies
-- Run this only if you need to reset/recreate RLS policies

-- ============================================
-- ENSURE AUTH SCHEMA EXISTS
-- ============================================

CREATE SCHEMA IF NOT EXISTS auth;

-- ============================================
-- PROFILES TABLE
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Added null guard and ::uuid cast
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid()::uuid = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid()::uuid = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid()::uuid = id);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscriptions_select_own" ON public.subscriptions;

-- Added null guard and ::uuid cast
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid()::uuid = user_id);

-- ============================================
-- AI AGENTS TABLE
-- ============================================

ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_agents_select_own" ON public.ai_agents;
DROP POLICY IF EXISTS "ai_agents_insert_own" ON public.ai_agents;
DROP POLICY IF EXISTS "ai_agents_update_own" ON public.ai_agents;
DROP POLICY IF EXISTS "ai_agents_delete_own" ON public.ai_agents;

-- Added null guard and ::uuid cast
CREATE POLICY "ai_agents_select_own"
  ON public.ai_agents FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid()::uuid = user_id);

CREATE POLICY "ai_agents_insert_own"
  ON public.ai_agents FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid()::uuid = user_id);

CREATE POLICY "ai_agents_update_own"
  ON public.ai_agents FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid()::uuid = user_id);

CREATE POLICY "ai_agents_delete_own"
  ON public.ai_agents FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid()::uuid = user_id);

-- ============================================
-- AI EXECUTIONS TABLE
-- ============================================

ALTER TABLE public.ai_executions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_executions_select_own" ON public.ai_executions;
DROP POLICY IF EXISTS "ai_executions_insert_own" ON public.ai_executions;

-- Added null guard and ::uuid cast
CREATE POLICY "ai_executions_select_own"
  ON public.ai_executions FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid()::uuid = user_id);

CREATE POLICY "ai_executions_insert_own"
  ON public.ai_executions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid()::uuid = user_id);

-- ============================================
-- METRICS TABLE
-- ============================================

ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "metrics_select_own" ON public.metrics;

-- Added null guard - allow NULL user_id for system metrics
CREATE POLICY "metrics_select_own"
  ON public.metrics FOR SELECT
  USING (user_id IS NULL OR (auth.uid() IS NOT NULL AND auth.uid()::uuid = user_id));

-- ============================================
-- AUDIT LOGS TABLE
-- ============================================

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_select_own" ON public.audit_logs;

-- Added null guard - allow NULL user_id for system events
CREATE POLICY "audit_logs_select_own"
  ON public.audit_logs FOR SELECT
  USING (user_id IS NULL OR (auth.uid() IS NOT NULL AND auth.uid()::uuid = user_id));

-- ============================================
-- XP TRANSACTIONS TABLE
-- ============================================

ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "xp_transactions_select_own" ON public.xp_transactions;

-- Added null guard and ::uuid cast
CREATE POLICY "xp_transactions_select_own"
  ON public.xp_transactions FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid()::uuid = user_id);
