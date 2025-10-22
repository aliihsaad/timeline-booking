-- Clean up duplicate policies and create a secure, minimal policy set for appointments table

-- Remove all existing policies to start fresh
DROP POLICY IF EXISTS "Anonymous users can only book appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anonymous users cannot delete appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anonymous users cannot update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anonymous users cannot view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated business owners can delete their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated business owners can update their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated business owners can view their appointments" ON public.appointments;
DROP POLICY IF EXISTS "auth_create_appointments" ON public.appointments;
DROP POLICY IF EXISTS "deny_anon_select_appointments" ON public.appointments;
DROP POLICY IF EXISTS "public_create_appointments" ON public.appointments;
DROP POLICY IF EXISTS "secure_delete_appointments" ON public.appointments;
DROP POLICY IF EXISTS "secure_select_appointments" ON public.appointments;
DROP POLICY IF EXISTS "secure_update_appointments" ON public.appointments;

-- Create minimal, secure policy set

-- 1. CRITICAL SECURITY: Only authenticated business owners can view customer data
CREATE POLICY "business_owners_view_appointments" 
ON public.appointments 
FOR SELECT 
TO authenticated 
USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE user_id = auth.uid()
  )
);

-- 2. Allow public appointment booking (essential for business functionality)
CREATE POLICY "public_appointment_booking" 
ON public.appointments 
FOR INSERT 
TO anon, authenticated 
WITH CHECK (
  customer_name IS NOT NULL 
  AND customer_phone IS NOT NULL 
  AND business_id IS NOT NULL
  AND appointment_date IS NOT NULL 
  AND appointment_time IS NOT NULL
);

-- 3. Only business owners can update their appointments
CREATE POLICY "business_owners_update_appointments" 
ON public.appointments 
FOR UPDATE 
TO authenticated 
USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE user_id = auth.uid()
  )
);

-- 4. Only business owners can delete their appointments
CREATE POLICY "business_owners_delete_appointments" 
ON public.appointments 
FOR DELETE 
TO authenticated 
USING (
  business_id IN (
    SELECT id FROM public.businesses WHERE user_id = auth.uid()
  )
);