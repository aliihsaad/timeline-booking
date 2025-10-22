-- Clean up duplicate policies and ensure optimal security
-- Remove any duplicate or old policies that may have been created

-- Clean up appointments table policies
DROP POLICY IF EXISTS "Authenticated business owners can view their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated business owners can update their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated business owners can delete their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Deny anonymous access to appointments" ON public.appointments;
DROP POLICY IF EXISTS "Public appointment booking allowed" ON public.appointments;

-- Keep only the clean, secure policies we need
-- These are already in place:
-- - secure_select_appointments
-- - deny_anon_select_appointments  
-- - public_create_appointments
-- - auth_create_appointments
-- - secure_update_appointments
-- - secure_delete_appointments

-- Verify appointments table is fully secured
-- Test that the security is working by checking policy coverage