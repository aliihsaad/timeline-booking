-- Fix customer data exposure security issue
-- The existing policies need to be more explicit about authentication

-- First, check current policies and improve them
-- Drop existing policies to recreate with better security
DROP POLICY IF EXISTS "Business owners can view their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Business owners can update their appointments" ON public.appointments;

-- Create secure SELECT policy that explicitly requires authentication
-- and ensures only business owners can view their appointments
CREATE POLICY "secure_select_appointments" 
ON public.appointments 
FOR SELECT 
TO authenticated 
USING (
  business_id IN (
    SELECT b.id 
    FROM public.businesses b 
    WHERE b.user_id = auth.uid()
  )
);

-- Explicitly deny all access to anonymous users for viewing appointments
CREATE POLICY "deny_anon_select_appointments" 
ON public.appointments 
FOR SELECT 
TO anon 
USING (false);

-- Allow public appointment creation (essential for business functionality)
-- but with validation to prevent abuse
CREATE POLICY "public_create_appointments" 
ON public.appointments 
FOR INSERT 
TO anon 
WITH CHECK (
  -- Ensure required fields are provided for valid appointments
  customer_name IS NOT NULL 
  AND customer_phone IS NOT NULL 
  AND business_id IS NOT NULL
  AND appointment_date IS NOT NULL 
  AND appointment_time IS NOT NULL
);

-- Allow authenticated users to create appointments too
CREATE POLICY "auth_create_appointments" 
ON public.appointments 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Secure UPDATE policy for business owners only
CREATE POLICY "secure_update_appointments" 
ON public.appointments 
FOR UPDATE 
TO authenticated 
USING (
  business_id IN (
    SELECT b.id 
    FROM public.businesses b 
    WHERE b.user_id = auth.uid()
  )
);

-- Add DELETE policy for business owners (currently missing)
CREATE POLICY "secure_delete_appointments" 
ON public.appointments 
FOR DELETE 
TO authenticated 
USING (
  business_id IN (
    SELECT b.id 
    FROM public.businesses b 
    WHERE b.user_id = auth.uid()
  )
);