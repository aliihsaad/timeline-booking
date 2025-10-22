import { supabase } from '@/integrations/supabase/client';

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceInsert {
  business_id: string;
  name: string;
  description?: string | null;
  duration: number;
  price?: number | null;
  is_active?: boolean;
}

export interface ServiceUpdate {
  name?: string;
  description?: string | null;
  duration?: number;
  price?: number | null;
  is_active?: boolean;
}

export const serviceService = {
  // Get all services for a business
  async getBusinessServices(businessId: string): Promise<{ data: Service[] | null; error: any }> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: true });

    return { data, error };
  },

  // Get active services for a business (for customer booking)
  async getActiveServices(businessId: string): Promise<{ data: Service[] | null; error: any }> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    return { data, error };
  },

  // Get a single service
  async getService(serviceId: string): Promise<{ data: Service | null; error: any }> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single();

    return { data, error };
  },

  // Create a new service
  async createService(service: ServiceInsert): Promise<{ data: Service | null; error: any }> {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();

    return { data, error };
  },

  // Update a service
  async updateService(
    serviceId: string,
    updates: ServiceUpdate
  ): Promise<{ data: Service | null; error: any }> {
    const { data, error } = await supabase
      .from('services')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', serviceId)
      .select()
      .single();

    return { data, error };
  },

  // Delete a service
  async deleteService(serviceId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);

    return { error };
  },

  // Toggle service active status
  async toggleServiceStatus(serviceId: string, isActive: boolean): Promise<{ error: any }> {
    const { error } = await supabase
      .from('services')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', serviceId);

    return { error };
  },
};
