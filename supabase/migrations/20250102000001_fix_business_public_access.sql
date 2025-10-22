-- Fix RLS policy to allow public access to business profiles
-- This enables QR codes and booking links to work for unauthenticated customers
--
-- PROBLEM: The original "Users can view their own business" policy blocked
-- unauthenticated customers from viewing business landing pages, causing
-- "Business not found" errors and HTTP 406 responses.
--
-- SOLUTION: Allow public read access to all businesses while keeping
-- write operations restricted to business owners only.

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view their own business" ON public.businesses;

-- Create new policy: Allow public read access to all businesses
-- This allows anyone (authenticated or not) to view business profiles
CREATE POLICY "Public can view businesses"
  ON public.businesses
  FOR SELECT
  USING (true);

-- Note: The following policies already exist and remain unchanged:
-- - "Users can insert their own business" - Restricts creation to owners
-- - "Users can update their own business" - Restricts updates to owners
-- These policies ensure only authenticated business owners can modify their data.
