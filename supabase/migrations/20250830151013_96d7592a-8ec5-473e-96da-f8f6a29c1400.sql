-- Enable Row Level Security on all public tables to protect sensitive data
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;