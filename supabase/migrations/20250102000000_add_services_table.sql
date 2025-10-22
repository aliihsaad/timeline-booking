-- Create services table for businesses to offer multiple services
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES public.businesses NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 30, -- Duration in minutes
  price DECIMAL(10, 2), -- Optional pricing
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add service_id to appointments table
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services;

-- Row Level Security for services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Business owners can manage their services
CREATE POLICY "Business owners can view their services"
  ON public.services
  FOR SELECT
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Business owners can create services"
  ON public.services
  FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Business owners can update their services"
  ON public.services
  FOR UPDATE
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

CREATE POLICY "Business owners can delete their services"
  ON public.services
  FOR DELETE
  USING (business_id IN (SELECT id FROM public.businesses WHERE user_id = auth.uid()));

-- Anyone can view active services for booking (public access)
CREATE POLICY "Public can view active services"
  ON public.services
  FOR SELECT
  USING (is_active = true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_services_business_id ON public.services(business_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active);
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON public.appointments(service_id);

-- Add a default "General Appointment" service for existing businesses
-- This ensures backward compatibility with existing appointments
INSERT INTO public.services (business_id, name, description, duration, is_active)
SELECT
  id,
  'General Appointment',
  'Standard appointment booking',
  30,
  true
FROM public.businesses
WHERE NOT EXISTS (
  SELECT 1 FROM public.services WHERE business_id = public.businesses.id
);
