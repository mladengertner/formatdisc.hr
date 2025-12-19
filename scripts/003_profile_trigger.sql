-- Auto-create profile on user signup
-- SlavkoKernel™ User Management
-- SUPABASE-SAFE VERSION with proper null guards

-- ============================================
-- ENSURE AUTH SCHEMA EXISTS
-- ============================================

CREATE SCHEMA IF NOT EXISTS auth;

-- ============================================
-- PROFILE TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Added null guard to prevent errors on incomplete user data
  IF NEW.id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Create profile for new user with ON CONFLICT safety
  INSERT INTO public.profiles (id, display_name, role, subscription_tier)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', SPLIT_PART(COALESCE(NEW.email, ''), '@', 1), 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'user'),
    'free'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Log audit event (wrapped in exception handler)
  BEGIN
    INSERT INTO public.audit_logs (user_id, event_type, event_category, event_data)
    VALUES (
      NEW.id,
      'user_signup',
      'auth',
      jsonb_build_object(
        'email', COALESCE(NEW.email, 'unknown'),
        'provider', COALESCE(NEW.app_metadata ->> 'provider', 'email')
      )
    );
  EXCEPTION WHEN OTHERS THEN
    -- Silently ignore audit log errors to not break signup
    NULL;
  END;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- TRIGGER SETUP
-- ============================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger only if auth.users exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END
$$;
