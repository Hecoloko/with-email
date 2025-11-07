import { createClient } from '@supabase/supabase-js';

// --- 🛑 ACTION REQUIRED: ADD YOUR SUPABASE CREDENTIALS ---
// You must replace the placeholder values below with your actual Supabase project URL and Anon Key.
const supabaseUrl = 'https://zzpayvkxbsrsdrfymtjs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6cGF5dmt4YnNyc2RyZnltdGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MzU2NTgsImV4cCI6MjA3NzMxMTY1OH0.H8Bd8iayIcY28KkMHTOXGMp-tQdZmxfeCraCZGbHDVI';

if (supabaseUrl.includes('YOUR_SUPABASE_URL') || supabaseKey.includes('YOUR_SUPABASE_ANON_KEY')) {
  alert('AUTHENTICATION ERROR\n\nPlease update supabaseClient.ts with your Supabase project\'s URL and Anon Key.\n\nYou can find these in your Supabase project settings under the "API" section.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Derive the functions base URL from the project URL. This allows the client to call Supabase Edge Functions.
export const functionsUrl = `https://${new URL(supabaseUrl).hostname.split('.')[0]}.functions.supabase.co`;


/*
-- =================================================================================================
-- === ✅ ONE-TIME DATABASE SETUP SCRIPT (Definitive Fix) ===
-- =================================================================================================
--
-- DESCRIPTION:
-- This is the complete and final setup script for your database. It fixes the
-- "permission denied" error permanently by correctly configuring your database for
-- secure, multi-user functionality. It is safe to run this script multiple times.
--
-- WHAT IT DOES:
-- 1. Adds required columns ('created_by') to your tables.
-- 2. Sets the 'created_by' column to automatically fill with the logged-in user's ID.
-- 3. Grants necessary permissions to logged-in users.
-- 4. Enables Row Level Security (RLS) and creates strict ownership policies.
-- 5. Sets up the file storage buckets ('attachments', 'avatars') and their security policies.
-- 6. Adds new columns for tracking attachment metadata.
--
-- INSTRUCTIONS:
-- 1. Go to the SQL Editor in your Supabase dashboard.
-- 2. Paste this entire script and click "RUN".
--
-- =================================================================================================

-- Start a transaction
BEGIN;

-- Part 1: Schema Modifications (Idempotent)
-- Use a DO block for conditional DDL to make the script re-runnable.
DO $$
BEGIN
  -- Add 'created_by' column to 'applicants' if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='applicants' AND column_name='created_by') THEN
    ALTER TABLE public.applicants ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  -- Set default for 'created_by' to the currently logged-in user's ID. This is the core of the fix.
  ALTER TABLE public.applicants ALTER COLUMN created_by SET DEFAULT auth.uid();

  -- Add 'created_by' column to 'notes' if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='notes' AND column_name='created_by') THEN
    ALTER TABLE public.notes ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  ALTER TABLE public.notes ALTER COLUMN created_by SET DEFAULT auth.uid();

  -- Add 'created_by' column to 'tasks' if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tasks' AND column_name='created_by') THEN
    ALTER TABLE public.tasks ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  ALTER TABLE public.tasks ALTER COLUMN created_by SET DEFAULT auth.uid();

  -- Add 'created_by' column to 'attachments' if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='attachments' AND column_name='created_by') THEN
    ALTER TABLE public.attachments ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  ALTER TABLE public.attachments ALTER COLUMN created_by SET DEFAULT auth.uid();
  
  -- Add 'bucket' and 'object_path' columns to 'attachments' to store file metadata
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='attachments' AND column_name='bucket') THEN
    ALTER TABLE public.attachments ADD COLUMN bucket TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='attachments' AND column_name='object_path') THEN
    ALTER TABLE public.attachments ADD COLUMN object_path TEXT;
  END IF;
END;
$$;

-- Part 2: Granting Table Permissions
-- This ensures the 'authenticated' role (any logged-in user) can interact with the tables.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Part 3: Row Level Security (RLS)
-- Enable RLS on all tables
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Drop old policies to ensure a clean slate, making the script re-runnable
DROP POLICY IF EXISTS "Enable all access for authenticated users based on ownership" ON public.applicants;
DROP POLICY IF EXISTS "Enable all access for authenticated users based on ownership" ON public.notes;
DROP POLICY IF EXISTS "Enable all access for authenticated users based on ownership" ON public.tasks;
DROP POLICY IF EXISTS "Enable all access for authenticated users based on ownership" ON public.attachments;

-- Create new, simple ownership policies.
-- A user can see/edit/delete a record if their user ID matches the record's 'created_by' field.
CREATE POLICY "Enable all access for authenticated users based on ownership"
  ON public.applicants FOR ALL TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable all access for authenticated users based on ownership"
  ON public.notes FOR ALL TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable all access for authenticated users based on ownership"
  ON public.tasks FOR ALL TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable all access for authenticated users based on ownership"
  ON public.attachments FOR ALL TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Part 4: Storage Setup
-- Insert the private 'attachments' bucket if it doesn't exist.
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Insert the public 'avatars' bucket if it doesn't exist.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Drop old storage policies to ensure a clean slate
DROP POLICY IF EXISTS "Allow authenticated uploads to attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated downloads of own files from attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes of own files from attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated avatar uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;


-- Create new storage security policies for the 'attachments' bucket
CREATE POLICY "Allow authenticated uploads to attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow authenticated downloads of own files from attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'attachments' AND owner = auth.uid());

CREATE POLICY "Allow authenticated deletes of own files from attachments"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'attachments' AND owner = auth.uid());

-- Create new storage security policies for the 'avatars' bucket
CREATE POLICY "Allow authenticated avatar uploads"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Allow public read access to avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Commit the transaction to apply all changes
COMMIT;
-- =================================================================================================
-- === END OF DATABASE SETUP SCRIPT ===
-- =================================================================================================
*/


/*
-- =================================================================================================
-- === OPTIONAL: MIGRATE EXISTING DATA (Run this after the main script) ===
-- =================================================================================================
--
-- DESCRIPTION:
-- If you have data in your tables from before this script was run, it won't have an owner
-- and will be invisible. This script assigns all owner-less data to your user account.
--
-- INSTRUCTIONS:
-- 1. Find your User ID. Go to "Authentication" -> "Users" in your Supabase dashboard and copy the ID.
-- 2. Replace 'PASTE_YOUR_USER_ID_HERE' below with the ID you copied.
-- 3. Run these commands in the Supabase SQL Editor AFTER running the main script above.
--
-- UPDATE public.applicants SET created_by = 'PASTE_YOUR_USER_ID_HERE' WHERE created_by IS NULL;
-- UPDATE public.notes SET created_by = 'PASTE_YOUR_USER_ID_HERE' WHERE created_by IS NULL;
-- UPDATE public.tasks SET created_by = 'PASTE_YOUR_USER_ID_HERE' WHERE created_by IS NULL;
-- UPDATE public.attachments SET created_by = 'PASTE_YOUR_USER_ID_HERE' WHERE created_by IS NULL;
--
-- =================================================================================================
*/


/*
-- =================================================================================================
-- === ⚠️ QUICK FIX: DISABLE ALL SECURITY POLICIES ===
-- =================================================================================================
--
-- DESCRIPTION:
-- If you are still blocked and want to revert to the previous behavior (where any logged-in user
-- can see all data), run this script. It will disable Row Level Security on your tables.
--
-- INSTRUCTIONS:
-- 1. Go to the SQL Editor in your Supabase dashboard.
-- 2. Paste this entire script and click "RUN". The error will go away.
--
-- ALTER TABLE public.applicants DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.attachments DISABLE ROW LEVEL SECURITY;
--
-- =================================================================================================
*/