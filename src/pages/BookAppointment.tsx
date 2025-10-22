import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, ArrowLeft, Phone, User, Clock } from "lucide-react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { appointmentService } from "@/lib/appointments";
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

  // Load available time slots when date is selected
  useEffect(() => {
    if (selectedDate && businessId) {
      loadAvailableSlots();
    }
  }, [selectedDate, businessId]);

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
          {/* Calendar Selection */}
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

          {/* Time Selection */}
          {selectedDate && (
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
          {selectedTime && (
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