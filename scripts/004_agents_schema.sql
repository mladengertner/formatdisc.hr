-- Agents Schema with Supabase-safe RLS policies
-- All auth.uid() now use ::uuid cast for type safety

-- Ensure auth schema exists
CREATE SCHEMA IF NOT EXISTS auth;

-- Create agents table
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('slavko-kernel', 'core-ai', 'dominor')),
  config JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'error')),
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create agent_logs table
CREATE TABLE IF NOT EXISTS public.agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT,
  latency INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'failed')),
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create xp_events table
CREATE TABLE IF NOT EXISTS public.xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  xp_amount INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add XP fields to profiles (safe - uses IF NOT EXISTS)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_id ON public.agent_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_user_id ON public.agent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_created_at ON public.agent_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_xp_events_user_id ON public.xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_created_at ON public.xp_events(created_at);

-- Enable RLS
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating to avoid conflicts
DROP POLICY IF EXISTS "Users can view own agents" ON public.agents;
DROP POLICY IF EXISTS "Users can create own agents" ON public.agents;
DROP POLICY IF EXISTS "Users can update own agents" ON public.agents;
DROP POLICY IF EXISTS "Users can delete own agents" ON public.agents;
DROP POLICY IF EXISTS "Users can view own agent logs" ON public.agent_logs;
DROP POLICY IF EXISTS "Users can create own agent logs" ON public.agent_logs;
DROP POLICY IF EXISTS "Users can view own XP events" ON public.xp_events;
DROP POLICY IF EXISTS "Users can create own XP events" ON public.xp_events;

-- RLS Policies with auth.uid()::uuid for Supabase type safety

-- RLS Policies for agents
CREATE POLICY "Users can view own agents"
  ON public.agents FOR SELECT
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can create own agents"
  ON public.agents FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own agents"
  ON public.agents FOR UPDATE
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can delete own agents"
  ON public.agents FOR DELETE
  USING (auth.uid()::uuid = user_id);

-- RLS Policies for agent_logs
CREATE POLICY "Users can view own agent logs"
  ON public.agent_logs FOR SELECT
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can create own agent logs"
  ON public.agent_logs FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);

-- RLS Policies for xp_events
CREATE POLICY "Users can view own XP events"
  ON public.xp_events FOR SELECT
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can create own XP events"
  ON public.xp_events FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);
