import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Business = Database['public']['Tables']['businesses']['Row'];
type BusinessInsert = Database['public']['Tables']['businesses']['Insert'];
type BusinessUpdate = Database['public']['Tables']['businesses']['Update'];
type TimeSlot = Database['public']['Tables']['time_slots']['Row'];
type TimeSlotInsert = Database['public']['Tables']['time_slots']['Insert'];

export const businessService = {
  // Create a new business
  async createBusiness(business: BusinessInsert): Promise<{ data: Business | null; error: any }> {
    const { data, error } = await supabase
      .from('businesses')
      .insert(business)
      .select()
      .single();

    return { data, error };
  },

  // Get business by ID
  async getBusiness(businessId: string): Promise<{ data: Business | null; error: any }> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .single();

    return { data, error };
  },

  // Get business by user ID
  async getBusinessByUserId(userId: string): Promise<{ data: Business | null; error: any }> {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', userId)
      .single();

    return { data, error };
  },

  // Update business
  async updateBusiness(businessId: string, updates: BusinessUpdate): Promise<{ data: Business | null; error: any }> {
    const { data, error } = await supabase
      .from('businesses')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', businessId)
      .select()
      .single();

    return { data, error };
  },

  // Get business time slots
  async getTimeSlots(businessId: string): Promise<{ data: TimeSlot[] | null; error: any }> {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('business_id', businessId)
      .order('day_of_week')
      .order('start_time');

    return { data, error };
  },

  // Create default time slots for a business
  async createDefaultTimeSlots(businessId: string): Promise<{ error: any }> {
    const defaultSlots: TimeSlotInsert[] = [];

    // Monday to Friday, 9 AM to 5 PM
    for (let day = 1; day <= 5; day++) {
      defaultSlots.push({
        business_id: businessId,
        day_of_week: day,
        start_time: '09:00',
        end_time: '17:00',
        slot_duration: 30,
        is_available: true
      });
    }

    const { error } = await supabase
      .from('time_slots')
      .insert(defaultSlots);

    return { error };
  },

  // Update time slots
  async updateTimeSlots(businessId: string, timeSlots: TimeSlotInsert[]): Promise<{ error: any }> {
    // Delete existing time slots
    await supabase
      .from('time_slots')
      .delete()
      .eq('business_id', businessId);

    // Insert new time slots
    const { error } = await supabase
      .from('time_slots')
      .insert(timeSlots.map(slot => ({
        ...slot,
        business_id: businessId
      })));

    return { error };
  },

  // Initialize business setup after registration
  async initializeBusiness(userId: string, businessData: Omit<BusinessInsert, 'user_id'>): Promise<{ data: Business | null; error: any }> {
    // Create business
    const { data: business, error: businessError } = await this.createBusiness({
      ...businessData,
      user_id: userId
    });

    if (businessError || !business) {
      return { data: null, error: businessError };
    }

    // Create default time slots
    const { error: timeSlotsError } = await this.createDefaultTimeSlots(business.id);

    if (timeSlotsError) {
      // If time slots creation fails, we could delete the business or just log the error
      console.error('Failed to create default time slots:', timeSlotsError);
    }

    return { data: business, error: null };
  }
};