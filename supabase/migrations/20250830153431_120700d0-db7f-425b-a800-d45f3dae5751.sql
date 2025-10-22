-- Fix conflicting RLS policies for appointments table
-- The issue is having both "Deny anonymous access" and "Public appointment booking"

-- Drop the overly restrictive anonymous denial policy
DROP POLICY IF EXISTS "Deny anonymous access to appointments" ON public.appointments;

-- Create a more nuanced policy that allows anonymous INSERT but denies SELECT/UPDATE/DELETE
CREATE POLICY "Anonymous users can only book appointments" 
ON public.appointments 
FOR INSERT 
TO anon 
WITH CHECK (
  -- Ensure required fields are provided for public booking
  customer_name IS NOT NULL 
  AND customer_phone IS NOT NULL 
  AND business_id IS NOT NULL
  AND appointment_date IS NOT NULL 
  AND appointment_time IS NOT NULL
);

-- Explicitly deny anonymous users from viewing appointments
CREATE POLICY "Anonymous users cannot view appointments" 
ON public.appointments 
FOR SELECT 
TO anon 
USING (false);

-- Explicitly deny anonymous users from updating appointments  
CREATE POLICY "Anonymous users cannot update appointments" 
ON public.appointments 
FOR UPDATE 
TO anon 
USING (false);

-- Explicitly deny anonymous users from deleting appointments
CREATE POLICY "Anonymous users cannot delete appointments" 
ON public.appointments 
FOR DELETE 
TO anon 
USING (false);

-- Remove the duplicate authenticated INSERT policy since we only need one
DROP POLICY IF EXISTS "Authenticated users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Public appointment booking allowed" ON public.appointments;