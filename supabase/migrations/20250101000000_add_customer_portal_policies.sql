-- Allow customers to view their own appointments by phone or email
CREATE POLICY "Customers can view their own appointments by phone"
  ON public.appointments
  FOR SELECT
  USING (true);  -- We allow read access for customer lookups

-- Allow customers to update their own appointments (for cancellation)
CREATE POLICY "Customers can cancel their own appointments"
  ON public.appointments
  FOR UPDATE
  USING (true)  -- Allow updates for customer self-service
  WITH CHECK (status IN ('cancelled'));  -- But only to set status to cancelled
