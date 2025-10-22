-- Prevent double-booking by adding unique constraint
-- This ensures a business cannot have two appointments at the same date and time
--
-- CRITICAL BUG FIX: Without this constraint, customers can book the same time slot
-- multiple times, causing scheduling conflicts and poor customer experience.
--
-- IMPORTANT: This migration will fail if duplicate bookings already exist.
-- If you get an error, you need to clean up duplicates first using:
--
-- -- Find duplicates:
-- SELECT business_id, appointment_date, appointment_time, COUNT(*)
-- FROM public.appointments
-- WHERE status != 'cancelled'
-- GROUP BY business_id, appointment_date, appointment_time
-- HAVING COUNT(*) > 1;
--
-- -- Then manually resolve or cancel duplicates

-- Add unique constraint to prevent double bookings
-- Only considers non-cancelled appointments (cancelled slots can be rebooked)
CREATE UNIQUE INDEX unique_business_datetime_slot
  ON public.appointments (business_id, appointment_date, appointment_time)
  WHERE status != 'cancelled';

-- Note: We use a partial unique index (with WHERE clause) instead of a constraint
-- because cancelled appointments should not block the same time slot.
-- This allows:
-- - Cancelling and rebooking the same slot
-- - Multiple cancelled appointments at the same time (historical data)
-- While preventing:
-- - Two active appointments at the same time

-- Add a comment to the index for documentation
COMMENT ON INDEX unique_business_datetime_slot IS
  'Prevents double-booking: ensures a business cannot have multiple active appointments at the same date and time. Cancelled appointments are excluded to allow rebooking.';
