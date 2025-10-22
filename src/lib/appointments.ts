import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

export const appointmentService = {
  // Create a new appointment
  async createAppointment(appointment: AppointmentInsert): Promise<{ data: Appointment | null; error: any }> {
    // Double-check availability before inserting to prevent race conditions
    // This catches cases where someone booked between loading slots and clicking confirm
    const { data: existingAppointment } = await supabase
      .from('appointments')
      .select('id')
      .eq('business_id', appointment.business_id)
      .eq('appointment_date', appointment.appointment_date)
      .eq('appointment_time', appointment.appointment_time)
      .neq('status', 'cancelled')
      .maybeSingle();

    if (existingAppointment) {
      return {
        data: null,
        error: {
          message: 'This time slot is no longer available. Please select another time.',
          code: 'SLOT_TAKEN'
        }
      };
    }

    // Proceed with insertion
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();

    // If insertion fails due to unique constraint (database-level protection)
    if (error && error.code === '23505') {
      return {
        data: null,
        error: {
          message: 'This time slot was just booked by someone else. Please select another time.',
          code: 'SLOT_TAKEN'
        }
      };
    }

    return { data, error };
  },

  // Get appointments for a business
  async getBusinessAppointments(businessId: string, date?: string): Promise<{ data: any[] | null; error: any }> {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        services (
          id,
          name,
          description,
          duration,
          price
        )
      `)
      .eq('business_id', businessId)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (date) {
      query = query.eq('appointment_date', date);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Get a specific appointment
  async getAppointment(appointmentId: string): Promise<{ data: Appointment | null; error: any }> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    return { data, error };
  },

  // Update appointment status
  async updateAppointmentStatus(
    appointmentId: string, 
    status: Appointment['status']
  ): Promise<{ data: Appointment | null; error: any }> {
    const { data, error } = await supabase
      .from('appointments')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single();

    return { data, error };
  },

  // Delete an appointment
  async deleteAppointment(appointmentId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);

    return { error };
  },

  // Get available time slots for a date
  async getAvailableSlots(businessId: string, date: string): Promise<{ data: string[] | null; error: any }> {
    // Get business time slots for the day of week
    const dayOfWeek = new Date(date).getDay();
    
    const { data: timeSlots, error: timeSlotsError } = await supabase
      .from('time_slots')
      .select('*')
      .eq('business_id', businessId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true);

    if (timeSlotsError) {
      return { data: null, error: timeSlotsError };
    }

    // Get existing appointments for the date
    const { data: existingAppointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('business_id', businessId)
      .eq('appointment_date', date)
      .neq('status', 'cancelled');

    if (appointmentsError) {
      return { data: null, error: appointmentsError };
    }

    // Generate available slots
    const bookedTimes = existingAppointments?.map(apt => apt.appointment_time) || [];
    const availableSlots: string[] = [];

    timeSlots?.forEach(slot => {
      const start = slot.start_time;
      const end = slot.end_time;
      const duration = slot.slot_duration;

      let currentTime = start;
      while (currentTime < end) {
        if (!bookedTimes.includes(currentTime)) {
          availableSlots.push(currentTime);
        }
        
        // Add duration minutes to current time
        const [hours, minutes] = currentTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + duration;
        const newHours = Math.floor(totalMinutes / 60);
        const newMinutes = totalMinutes % 60;
        currentTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
      }
    });

    return { data: availableSlots.sort(), error: null };
  },

  // Get appointments by customer (phone or email)
  async getAppointmentsByCustomer(
    searchType: 'phone' | 'email',
    searchValue: string
  ): Promise<{ data: any[] | null; error: any }> {
    const field = searchType === 'phone' ? 'customer_phone' : 'customer_email';

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        services (
          id,
          name,
          description,
          duration,
          price
        )
      `)
      .eq(field, searchValue)
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false });

    return { data, error };
  },

  // Reschedule an appointment
  async rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newTime: string,
    businessId: string
  ): Promise<{ data: Appointment | null; error: any }> {
    // First, check if the new slot is available
    const { data: availableSlots, error: slotsError } = await this.getAvailableSlots(businessId, newDate);

    if (slotsError) {
      return { data: null, error: slotsError };
    }

    if (!availableSlots?.includes(newTime)) {
      return {
        data: null,
        error: { message: 'Selected time slot is not available' }
      };
    }

    // Update the appointment
    const { data, error } = await supabase
      .from('appointments')
      .update({
        appointment_date: newDate,
        appointment_time: newTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId)
      .select()
      .single();

    return { data, error };
  },

  // Get appointment statistics
  async getAppointmentStats(businessId: string): Promise<{
    data: {
      today: number;
      thisWeek: number;
      thisMonth: number;
      completed: number;
      cancelled: number;
    } | null;
    error: any
  }> {
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date();
    monthStart.setDate(1);

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('appointment_date, status, created_at')
      .eq('business_id', businessId);

    if (error) {
      return { data: null, error };
    }

    const stats = {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      completed: 0,
      cancelled: 0,
    };

    appointments?.forEach(apt => {
      const aptDate = new Date(apt.appointment_date);
      const createdDate = new Date(apt.created_at);

      if (apt.appointment_date === today) stats.today++;
      if (aptDate >= weekStart) stats.thisWeek++;
      if (createdDate >= monthStart) stats.thisMonth++;
      if (apt.status === 'completed') stats.completed++;
      if (apt.status === 'cancelled') stats.cancelled++;
    });

    return { data: stats, error: null };
  }
};