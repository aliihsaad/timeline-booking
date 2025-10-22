# Fix: CustomerPortal UI & Double-Booking Prevention

## Problems Fixed

### Problem 1: Overlapping Calendars ✅
**Issue:** Calendars rendering on top of each other in CustomerPortal reschedule dialog.

**Fixed:**
- Reduced dialog width from `max-w-2xl` to `max-w-lg`
- Added scrolling with `max-h-[90vh] overflow-y-auto`
- Wrapped calendar in centered flex container
- Better mobile responsiveness

### Problem 2: Double-Booking ⚠️ CRITICAL
**Issue:** Same time slot can be booked multiple times by different customers.

**Fixed with 3-layer protection:**
1. **Database unique constraint** - Prevents duplicates at DB level
2. **Pre-insert availability check** - Catches race conditions
3. **Error code 23505 handling** - Friendly error message

---

## 🚀 Apply Fixes

### Fix 1: Calendar UI (Already Applied in Code) ✅

The UI fixes are already applied in the codebase:
- `src/pages/CustomerPortal.tsx` - Dialog sizing and calendar centering
- No migration needed
- Will be live after git push + Vercel deploy

---

### Fix 2: Double-Booking Prevention (Requires Migration) ⚠️

**You MUST apply this migration in Supabase:**

#### Step 1: Check for Existing Duplicates (Important!)

Before applying the migration, check if you already have duplicate bookings:

1. **Go to Supabase Dashboard → SQL Editor**
2. **Run this query to find duplicates:**
   ```sql
   SELECT
     business_id,
     appointment_date,
     appointment_time,
     COUNT(*) as duplicate_count,
     string_agg(id::text, ', ') as appointment_ids
   FROM public.appointments
   WHERE status != 'cancelled'
   GROUP BY business_id, appointment_date, appointment_time
   HAVING COUNT(*) > 1
   ORDER BY appointment_date, appointment_time;
   ```

3. **If query returns NO rows:** ✅ Great! Proceed to Step 2
4. **If query returns rows:** ⚠️ You have duplicates. See "Cleanup Duplicates" section below

---

#### Step 2: Apply the Migration

Once you've confirmed no duplicates (or cleaned them up):

1. **Go to Supabase Dashboard → SQL Editor**
2. **Click "+ New query"**
3. **Copy and paste this SQL:**
   ```sql
   -- Prevent double-booking by adding unique constraint
   CREATE UNIQUE INDEX unique_business_datetime_slot
     ON public.appointments (business_id, appointment_date, appointment_time)
     WHERE status != 'cancelled';

   COMMENT ON INDEX unique_business_datetime_slot IS
     'Prevents double-booking: ensures a business cannot have multiple active appointments at the same date and time. Cancelled appointments are excluded to allow rebooking.';
   ```

4. **Click "Run"**
5. **Should see:** "Success. No rows returned"

---

#### Step 3: Verify Migration

Check that the index was created:

1. **In SQL Editor, run:**
   ```sql
   SELECT
     indexname,
     indexdef
   FROM pg_indexes
   WHERE tablename = 'appointments'
     AND indexname = 'unique_business_datetime_slot';
   ```

2. **Should return 1 row** showing the index definition

---

### Cleanup Duplicates (If Step 1 Found Any)

If you have existing duplicate bookings, you need to clean them up before applying the migration:

#### Option A: Cancel Older Duplicates (Recommended)

```sql
-- Mark older duplicate appointments as cancelled
-- Keeps the newest appointment, cancels older ones
WITH duplicates AS (
  SELECT
    id,
    business_id,
    appointment_date,
    appointment_time,
    ROW_NUMBER() OVER (
      PARTITION BY business_id, appointment_date, appointment_time
      ORDER BY created_at DESC
    ) as row_num
  FROM public.appointments
  WHERE status != 'cancelled'
)
UPDATE public.appointments
SET
  status = 'cancelled',
  notes = COALESCE(notes || ' | ', '') || 'Auto-cancelled: duplicate booking'
FROM duplicates
WHERE appointments.id = duplicates.id
  AND duplicates.row_num > 1;
```

**This keeps the most recent booking and cancels older ones.**

#### Option B: Review Manually

1. Use the query from Step 1 to get duplicate IDs
2. Check each appointment in Supabase dashboard
3. Decide which to keep and which to cancel
4. Update manually through the UI or SQL

---

## ✅ Testing After Fix

### Test 1: Calendar UI
1. Go to CustomerPortal page
2. Search for your appointments
3. Click "Reschedule" on any appointment
4. ✅ Calendar should be centered, not overlapping
5. ✅ Dialog should fit nicely on screen
6. ✅ Should work on mobile too

---

### Test 2: Double-Booking Prevention

**Test A: Sequential Booking**
1. Go to booking page
2. Select service, date, time slot (e.g., 2:00 PM)
3. Complete booking → ✅ Should succeed
4. Try booking same slot again
5. ❌ Should show "No available slots" (2:00 PM removed from list)

**Test B: Simultaneous Booking (Race Condition)**
1. Open booking page in TWO different browsers/incognito tabs
2. In BOTH tabs: select same service, same date, same time
3. Click "Confirm" in first tab → ✅ Should succeed
4. Click "Confirm" in second tab (within seconds) → ❌ Should fail
5. Error should say: "This time slot is no longer available"

**Test C: Database Check**
```sql
-- Verify no duplicates exist
SELECT
  business_id,
  appointment_date,
  appointment_time,
  COUNT(*)
FROM public.appointments
WHERE status != 'cancelled'
GROUP BY business_id, appointment_date, appointment_time
HAVING COUNT(*) > 1;
```
✅ Should return 0 rows

---

## 🔒 How It Works

### 3-Layer Protection

**Layer 1: Client-Side Filtering**
- `getAvailableSlots()` filters out booked times
- Users don't see already-booked slots
- Fast UX, prevents most attempts

**Layer 2: Pre-Insert Check** (NEW)
```typescript
// Before inserting, check if slot was just booked
const existingAppointment = await checkIfSlotTaken(...)
if (existingAppointment) {
  return error: "Slot taken"
}
```
- Catches race conditions
- User gets friendly error message
- No database error

**Layer 3: Database Unique Index** (NEW)
```sql
CREATE UNIQUE INDEX ... WHERE status != 'cancelled'
```
- Final safety net
- Even if two requests arrive at exact same time
- Database rejects duplicate
- Error code 23505 caught and handled

**All 3 layers work together** for bulletproof double-booking prevention.

---

## 📊 Technical Details

### Database Index

**Type:** Partial Unique Index

**Why Partial?**
- Only applies to non-cancelled appointments
- Cancelled slots CAN be rebooked
- Historical data preserved

**Performance:**
- Indexed columns: `business_id`, `appointment_date`, `appointment_time`
- Fast lookups
- Minimal overhead

### Error Codes

| Code | Source | Meaning |
|------|--------|---------|
| `SLOT_TAKEN` | Pre-insert check | Someone booked between page load and submit |
| `23505` | PostgreSQL | Unique constraint violation |

Both are handled gracefully with user-friendly messages.

---

## 🆘 Troubleshooting

### Issue: Migration fails with "duplicate key value violates unique constraint"

**Cause:** You already have duplicate bookings in the database.

**Solution:**
1. Run the duplicate detection query (Step 1 above)
2. Clean up duplicates (Option A or B)
3. Re-run the migration

---

### Issue: Can still book duplicates after migration

**Possible causes:**
1. Migration not applied → Check Step 3 verification
2. Status is 'cancelled' → Check your test data
3. Using old code → Clear browser cache, hard refresh

**Debug:**
```sql
-- Check if index exists
SELECT indexname FROM pg_indexes
WHERE tablename = 'appointments'
  AND indexname = 'unique_business_datetime_slot';
```

---

### Issue: Users getting "slot taken" error but slot appears available

**Cause:** Page wasn't refreshed after someone else booked.

**Expected Behavior:** This is correct! The error prevents double-booking.

**Improvement:** Could add real-time slot updates (future feature).

---

## 📝 Summary

**Calendar UI:**
- ✅ Fixed in code (CustomerPortal.tsx)
- ✅ Deployed automatically with next push

**Double-Booking:**
- ⚠️ Requires manual migration in Supabase
- ✅ 3-layer protection (client + server + database)
- ⚠️ Critical for production use

**Next Steps:**
1. Apply the SQL migration in Supabase
2. Test both scenarios above
3. Deploy to Vercel (code already updated)

---

**Ready for production!** 🚀

_Generated with [Claude Code](https://claude.com/claude-code)_
