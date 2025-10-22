import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar as CalendarIcon, Clock, User, Mail, Phone, Search, XCircle, RefreshCw, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { appointmentService } from "@/lib/appointments";
import { format, addDays } from "date-fns";
import type { Database } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";

type Appointment = Database['public']['Tables']['appointments']['Row'];

const CustomerPortal = () => {
  const [searchType, setSearchType] = useState<'phone' | 'email'>('phone');
  const [searchValue, setSearchValue] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchValue.trim()) {
      toast({
        title: "Missing Information",
        description: `Please enter your ${searchType}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const { data, error } = await appointmentService.getAppointmentsByCustomer(
        searchType,
        searchValue.trim()
      );

      if (error) {
        toast({
          title: "Error",
          description: "Failed to find appointments",
          variant: "destructive",
        });
        setAppointments([]);
        return;
      }

      setAppointments(data || []);

      if (!data || data.length === 0) {
        toast({
          title: "No Appointments Found",
          description: `We couldn't find any appointments with that ${searchType}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search for appointments",
        variant: "destructive",
      });
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await appointmentService.updateAppointmentStatus(appointmentId, 'cancelled');

      if (error) {
        toast({
          title: "Error",
          description: "Failed to cancel appointment",
          variant: "destructive",
        });
        return;
      }

      setAppointments(prev =>
        prev.map(apt =>
          apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
        )
      );

      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    }
  };

  const handleOpenReschedule = (appointment: Appointment) => {
    setReschedulingAppointment(appointment);
    setSelectedDate(undefined);
    setSelectedTime('');
    setAvailableSlots([]);
    setShowRescheduleDialog(true);
  };

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime('');

    if (!date || !reschedulingAppointment) return;

    setLoadingSlots(true);
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      const { data: slots, error } = await appointmentService.getAvailableSlots(
        reschedulingAppointment.business_id,
        dateString
      );

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load available time slots",
          variant: "destructive",
        });
        setAvailableSlots([]);
        return;
      }

      setAvailableSlots(slots || []);

      if (!slots || slots.length === 0) {
        toast({
          title: "No Slots Available",
          description: "No time slots available for this date. Please choose another date.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load time slots",
        variant: "destructive",
      });
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!reschedulingAppointment || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time",
        variant: "destructive",
      });
      return;
    }

    setRescheduling(true);
    try {
      const newDateString = format(selectedDate, 'yyyy-MM-dd');
      const { data, error } = await appointmentService.rescheduleAppointment(
        reschedulingAppointment.id,
        newDateString,
        selectedTime,
        reschedulingAppointment.business_id
      );

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to reschedule appointment",
          variant: "destructive",
        });
        return;
      }

      // Update the appointment in the list
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === reschedulingAppointment.id
            ? { ...apt, appointment_date: newDateString, appointment_time: selectedTime }
            : apt
        )
      );

      toast({
        title: "Appointment Rescheduled",
        description: `Your appointment has been moved to ${format(selectedDate, 'MMMM do, yyyy')} at ${selectedTime}`,
      });

      setShowRescheduleDialog(false);
      setReschedulingAppointment(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reschedule appointment",
        variant: "destructive",
      });
    } finally {
      setRescheduling(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'no_show':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const canCancelAppointment = (appointment: Appointment) => {
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const now = new Date();
    const hoursDifference = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    return appointment.status === 'confirmed' && hoursDifference > 24;
  };

  return (
    <div className="min-h-screen bg-gradient-status">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Manage Your Appointments</h1>
            <p className="text-muted-foreground">
              View, reschedule, or cancel your upcoming appointments
            </p>
          </div>
        </div>

        {/* Search Form */}
        <Card className="shadow-strong border-0 mb-8">
          <CardHeader>
            <CardTitle>Find Your Appointments</CardTitle>
            <CardDescription>
              Enter your phone number or email to view your bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  variant={searchType === 'phone' ? 'default' : 'outline'}
                  onClick={() => setSearchType('phone')}
                  className="flex-1"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Phone
                </Button>
                <Button
                  type="button"
                  variant={searchType === 'email' ? 'default' : 'outline'}
                  onClick={() => setSearchType('email')}
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search">
                  {searchType === 'phone' ? 'Phone Number' : 'Email Address'}
                </Label>
                <Input
                  id="search"
                  type={searchType === 'phone' ? 'tel' : 'email'}
                  placeholder={searchType === 'phone' ? '+961 70 123 456' : 'your.email@example.com'}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="h-12"
                  required
                />
              </div>

              <Button type="submit" className="w-full h-12" disabled={loading}>
                <Search className="w-4 h-4 mr-2" />
                {loading ? 'Searching...' : 'Find My Appointments'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Appointments List */}
        {searched && (
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <Card className="shadow-medium border-0">
                <CardContent className="p-12 text-center">
                  <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Appointments Found</h3>
                  <p className="text-muted-foreground">
                    We couldn't find any appointments with that {searchType}.
                    Please check your information and try again.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <h2 className="text-2xl font-bold">Your Appointments ({appointments.length})</h2>
                {appointments.map((appointment) => (
                  <Card key={appointment.id} className="shadow-medium border-0">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status || 'confirmed'}
                            </Badge>
                            {appointment.appointment_date >= new Date().toISOString().split('T')[0] && (
                              <Badge variant="outline">Upcoming</Badge>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{appointment.customer_name}</span>
                            </div>

                            {(appointment as any).services && (
                              <div className="flex items-center gap-2 text-sm">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="font-medium text-primary">{(appointment as any).services.name}</span>
                                {(appointment as any).services.duration && (
                                  <span className="text-muted-foreground">({(appointment as any).services.duration} min)</span>
                                )}
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{format(new Date(appointment.appointment_date), 'EEEE, MMMM do, yyyy')}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{appointment.appointment_time}</span>
                            </div>

                            {appointment.notes && (
                              <p className="text-sm text-muted-foreground mt-2">
                                Note: {appointment.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 min-w-[200px]">
                          {canCancelAppointment(appointment) ? (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => handleOpenReschedule(appointment)}
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reschedule
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleCancelAppointment(appointment.id)}
                                className="w-full"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel Appointment
                              </Button>
                            </>
                          ) : (
                            <div className="text-sm text-muted-foreground text-center p-2 bg-muted rounded">
                              {appointment.status === 'cancelled'
                                ? 'This appointment was cancelled'
                                : appointment.status === 'completed'
                                ? 'This appointment is completed'
                                : 'Cannot cancel within 24 hours'
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}

        {/* Reschedule Dialog */}
        <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Reschedule Appointment</DialogTitle>
              <DialogDescription>
                Select a new date and time for your appointment
              </DialogDescription>
            </DialogHeader>

            {reschedulingAppointment && (
              <div className="space-y-6">
                {/* Current Appointment Info */}
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="text-sm space-y-1">
                      <p className="font-semibold">Current Appointment:</p>
                      <p>{format(new Date(reschedulingAppointment.appointment_date), 'EEEE, MMMM do, yyyy')}</p>
                      <p>Time: {reschedulingAppointment.appointment_time}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* New Date Selection */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Select New Date</Label>
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        disabled={(date) => date < addDays(new Date(), 1)}
                        className="rounded-md border"
                      />
                    </div>
                  </div>

                  {/* Time Slot Selection */}
                  {selectedDate && (
                    <div>
                      <Label className="text-base font-semibold mb-3 block">
                        Select New Time
                        {selectedDate && (
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            for {format(selectedDate, 'MMMM do, yyyy')}
                          </span>
                        )}
                      </Label>

                      {loadingSlots ? (
                        <div className="flex items-center justify-center p-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1">
                          {availableSlots.map((slot) => (
                            <Button
                              key={slot}
                              variant={selectedTime === slot ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedTime(slot)}
                              className="h-10"
                            >
                              {slot}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-8 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            No available time slots for this date
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* New Appointment Summary */}
                  {selectedDate && selectedTime && (
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm">
                          <ArrowRight className="w-4 h-4 text-primary" />
                          <div>
                            <p className="font-semibold">New Appointment:</p>
                            <p>{format(selectedDate, 'EEEE, MMMM do, yyyy')} at {selectedTime}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowRescheduleDialog(false)}
                    className="flex-1"
                    disabled={rescheduling}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmReschedule}
                    className="flex-1"
                    disabled={!selectedDate || !selectedTime || rescheduling}
                  >
                    {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CustomerPortal;
