-- Fix RLS policy to allow public access to time slots
-- This enables customers to see available booking times
--
-- PROBLEM: The "Business owners can view their time slots" policy blocked
-- unauthenticated customers from viewing time slots, causing "No available slots"
-- error on the booking page regardless of date selected.
--
-- SOLUTION: Allow public read access to time slots so customers can see
-- available times for booking, while keeping write operations restricted
-- to business owners only.

-- Add policy: Allow public read access to time slots
-- This allows anyone (authenticated or not) to view time slots
CREATE POLICY "Public can view time slots"
  ON public.time_slots
  FOR SELECT
  USING (true);

-- Note: The following policy already exists and remains unchanged:
-- - "Business owners can manage their time slots" (line 64-66 in initial migration)
-- This policy handles INSERT, UPDATE, and DELETE operations, ensuring only
-- authenticated business owners can modify their time slots.
--
-- The combination of both policies allows:
-- - Anyone to VIEW time slots (needed for booking)
-- - Only owners to MODIFY time slots (needed for security)
