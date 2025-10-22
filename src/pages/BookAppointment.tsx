import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, ArrowLeft, Phone, User, Clock, DollarSign, Sparkles } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { appointmentService } from "@/lib/appointments";
import { serviceService, type Service } from "@/lib/services";
import { useRateLimit } from "@/hooks/useRateLimit";
import { createSecureError } from "@/utils/secureError";

const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const businessId = searchParams.get('business');
  useEffect(() => {
    if (!businessId) {
      navigate('/');
      return;
    }
  }, [businessId, navigate]);

  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
  // Rate limiting for appointment booking (max 3 attempts per 5 minutes)
  const bookingRateLimit = useRateLimit({
    maxAttempts: 3,
    windowMs: 5 * 60 * 1000, // 5 minutes
    blockMs: 10 * 60 * 1000, // 10 minutes block
  });

  // Load services on mount
  useEffect(() => {
    if (businessId) {
      loadServices();
    }
  }, [businessId]);

  // Load available time slots when date is selected
  useEffect(() => {
    if (selectedDate && businessId) {
      loadAvailableSlots();
    }
  }, [selectedDate, businessId]);

  const loadServices = async () => {
    if (!businessId) return;

    setLoadingServices(true);
    try {
      const { data, error } = await serviceService.getActiveServices(businessId);

      if (error) {
        console.error('Error loading services:', error);
        toast({
          title: "Error",
          description: "Failed to load services",
          variant: "destructive",
        });
      } else {
        setServices(data || []);
        // Auto-select if only one service
        if (data && data.length === 1) {
          setSelectedService(data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoadingServices(false);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDate) return;
    
    setLoadingSlots(true);
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    
    try {
      const { data, error } = await appointmentService.getAvailableSlots(businessId, dateString);
      
      if (error) {
        console.error('Error loading slots:', error);
        // Fallback to default slots - don't expose internal errors
        setTimeSlots([
          '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
          '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
        ]);
      } else {
        setTimeSlots(data || []);
      }
    } catch (error) {
      console.error('Error loading slots:', error);
      // Fallback to default slots - don't expose internal errors
      setTimeSlots([
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
      ]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    if (bookingRateLimit.isBlocked()) {
      const remainingTime = bookingRateLimit.getRemainingTime();
      toast({
        title: "Too Many Attempts",
        description: `Please wait ${remainingTime} seconds before trying again.`,
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedDate || !selectedTime || !formData.name || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Record the attempt
    if (!bookingRateLimit.recordAttempt()) {
      const remainingTime = bookingRateLimit.getRemainingTime();
      toast({
        title: "Rate Limit Exceeded",
        description: `Too many booking attempts. Please wait ${remainingTime} seconds.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const appointmentData = {
        business_id: businessId,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email || null,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime,
        service_id: selectedService?.id || null,
        status: 'confirmed' as const,
      };

      const { data, error } = await appointmentService.createAppointment(appointmentData);

      if (error) {
        const secureMessage = createSecureError(
          error, 
          "Failed to book appointment. Please try again."
        );
        toast({
          title: "Booking Failed",
          description: secureMessage,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Appointment Booked!",
        description: `Confirmed for ${format(selectedDate, 'PPP')} at ${selectedTime}`,
      });

      // Navigate to status page with appointment ID
      navigate(`/status?business=${businessId}&appointment=${data?.id}`);
    } catch (error) {
      const secureMessage = createSecureError(
        error, 
        "Failed to book appointment. Please try again."
      );
      toast({
        title: "Error",
        description: secureMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-status">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link to={`/b/${businessId}`}>
            <Button variant="ghost" size="icon" className="mr-3">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center">
            <div className="bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mr-3">
              <CalendarIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Book Appointment</h1>
              <p className="text-sm text-muted-foreground">Schedule your visit</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection */}
          <Card className="shadow-medium border-0">
            <CardHeader>
              <CardTitle>Select Service</CardTitle>
              <CardDescription>
                Choose the service you'd like to book
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingServices ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading services...</p>
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No services available for booking at this time.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {services.map((service) => (
                    <Button
                      key={service.id}
                      type="button"
                      variant={selectedService?.id === service.id ? "default" : "outline"}
                      onClick={() => setSelectedService(service)}
                      className="h-auto p-4 justify-start text-left"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-4 h-4" />
                          <span className="font-semibold">{service.name}</span>
                        </div>
                        {service.description && (
                          <p className="text-sm opacity-80 mb-2">{service.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{service.duration} min</span>
                          </div>
                          {service.price && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              <span>${service.price}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calendar Selection */}
          {selectedService && (
            <Card className="shadow-medium border-0">
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>
                  Choose your preferred date
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-md border-0 shadow-soft pointer-events-auto"
                />
              </CardContent>
            </Card>
          )}

          {/* Time Selection */}
          {selectedService && selectedDate && (
            <Card className="shadow-medium border-0">
              <CardHeader>
                <CardTitle>Select Time</CardTitle>
                <CardDescription>
                  Available slots for {format(selectedDate, 'PPP')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSlots ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Loading available slots...</p>
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No available slots for this date</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        type="button"
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className="h-10"
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {time}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Customer Information */}
          {selectedService && selectedTime && (
            <Card className="shadow-medium border-0">
              <CardHeader>
                <CardTitle>Your Information</CardTitle>
                <CardDescription>
                  Required for appointment confirmation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+961 70 123 456"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    Email (Optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="h-12"
                  />
                </div>

                {/* Booking Summary */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm mb-3">Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service:</span>
                      <span className="font-medium">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{selectedService?.duration} minutes</span>
                    </div>
                    {selectedService?.price && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium">${selectedService.price}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{selectedDate && format(selectedDate, 'PPP')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  size="xl"
                  className="w-full mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? "Booking..." : "Confirm Appointment"}
                </Button>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;