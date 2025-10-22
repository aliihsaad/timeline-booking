import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Appointment = Database['public']['Tables']['appointments']['Row'];
type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

export const appointmentService = {
  // Create a new appointment
  async createAppointment(appointment: AppointmentInsert): Promise<{ data: Appointment | null; error: any }> {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();

    return { data, error };
  },

  // Get appointments for a business
  async getBusinessAppointments(businessId: string, date?: string): Promise<{ data: Appointment[] | null; error: any }> {
    let query = supabase
      .from('appointments')
      .select('*')
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