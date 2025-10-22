import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { 
  Building2, 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  QrCode,
  Clock,
  UserCheck,
  CalendarDays,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Plus,
  CalendarIcon,
  Eye,
  TrendingUp,
  Star,
  Crown,
  Sparkles,
  Download,
  Copy,
  Share2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { businessService } from "@/lib/business";
import { appointmentService } from "@/lib/appointments";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Database } from "@/integrations/supabase/types";

type Mode = "queue" | "appointments" | "both";
type Business = Database['public']['Tables']['businesses']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'];
type TimeSlot = Database['public']['Tables']['time_slots']['Row'];

const BusinessDashboard = () => {
  const [activeMode, setActiveMode] = useState<Mode>("appointments");
  const [business, setBusiness] = useState<Business | null>(null);
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    completed: 0,
    cancelled: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendarDialog, setShowCalendarDialog] = useState(false);
  const [showAddAppointmentDialog, setShowAddAppointmentDialog] = useState(false);
  const [showAllAppointmentsDialog, setShowAllAppointmentsDialog] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  });
  
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/business/login");
      } else {
        loadBusinessData();
        loadTimeSlots();
      }
    }
  }, [user, authLoading, navigate]);

  const loadBusinessData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data: businessData, error: businessError } = await businessService.getBusinessByUserId(user.id);
      
      if (businessError && businessError.code !== 'PGRST116') {
        console.error('Error loading business:', businessError);
        toast({
          title: "Error",
          description: "Failed to load business data",
          variant: "destructive",
        });
        return;
      }

      if (!businessData) {
        navigate("/business/setup");
        return;
      }

      setBusiness(businessData);

      const { data: statsData, error: statsError } = await appointmentService.getAppointmentStats(businessData.id);
      
      if (statsError) {
        console.error('Error loading stats:', statsError);
      } else {
        setStats(statsData || { today: 0, thisWeek: 0, thisMonth: 0, completed: 0, cancelled: 0 });
      }

      const today = new Date().toISOString().split('T')[0];
      const { data: todayAppointmentsData, error: todayError } = await appointmentService.getBusinessAppointments(businessData.id, today);
      
      if (todayError) {
        console.error('Error loading today appointments:', todayError);
      } else {
        setTodayAppointments(todayAppointmentsData || []);
      }

      const { data: allAppointmentsData, error: allError } = await appointmentService.getBusinessAppointments(businessData.id);
      
      if (allError) {
        console.error('Error loading all appointments:', allError);
      } else {
        setAllAppointments(allAppointmentsData || []);
      }

    } catch (error) {
      console.error('Error in loadBusinessData:', error);
      toast({
        title: "Error",
        description: "Failed to load business data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTimeSlots = async () => {
    if (!user) return;
    
    try {
      const { data: businessData } = await businessService.getBusinessByUserId(user.id);
      if (businessData) {
        const { data: slotsData } = await businessService.getTimeSlots(businessData.id);
        setTimeSlots(slotsData || []);
      }
    } catch (error) {
      console.error('Error loading time slots:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/business/login';
    } catch (error) {
      console.error('Error signing out:', error);
      window.location.href = '/business/login';
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: Appointment['status']) => {
    try {
      const { error } = await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to update appointment status",
          variant: "destructive",
        });
        return;
      }

      setTodayAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );

      setAllAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );

      loadBusinessData();

      toast({
        title: "Status Updated",
        description: `Appointment marked as ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  const handleAddAppointment = async () => {
    if (!business || !newAppointment.customer_name || !newAppointment.customer_phone || 
        !newAppointment.appointment_date || !newAppointment.appointment_time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const appointmentData = {
        business_id: business.id,
        customer_name: newAppointment.customer_name,
        customer_phone: newAppointment.customer_phone,
        customer_email: newAppointment.customer_email || null,
        appointment_date: newAppointment.appointment_date,
        appointment_time: newAppointment.appointment_time,
        status: 'confirmed' as const,
        notes: newAppointment.notes || null
      };

      const { error } = await appointmentService.createAppointment(appointmentData);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to create appointment",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Appointment Created",
        description: `Appointment scheduled for ${newAppointment.customer_name}`,
      });

      setNewAppointment({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        appointment_date: '',
        appointment_time: '',
        notes: ''
      });

      setShowAddAppointmentDialog(false);
      loadBusinessData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      });
    }
  };

  const generateQRCode = async () => {
    if (!business) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1080;
      canvas.height = 1080;

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const QRCode = await import('qrcode');
      const qrData = `${window.location.origin}/b/${business.id}`;

      const qrDataURL = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      const qrImage = new Image();
      qrImage.onload = () => {
        const qrSize = 400;
        const qrX = (canvas.width - qrSize) / 2;
        const qrY = (canvas.height - qrSize) / 2 + 50;

        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetY = 10;
        
        const cornerRadius = 20;
        const qrBgSize = qrSize + 40;
        const qrBgX = qrX - 20;
        const qrBgY = qrY - 20;
        
        ctx.beginPath();
        ctx.moveTo(qrBgX + cornerRadius, qrBgY);
        ctx.lineTo(qrBgX + qrBgSize - cornerRadius, qrBgY);
        ctx.quadraticCurveTo(qrBgX + qrBgSize, qrBgY, qrBgX + qrBgSize, qrBgY + cornerRadius);
        ctx.lineTo(qrBgX + qrBgSize, qrBgY + qrBgSize - cornerRadius);
        ctx.quadraticCurveTo(qrBgX + qrBgSize, qrBgY + qrBgSize, qrBgX + qrBgSize - cornerRadius, qrBgY + qrBgSize);
        ctx.lineTo(qrBgX + cornerRadius, qrBgY + qrBgSize);
        ctx.quadraticCurveTo(qrBgX, qrBgY + qrBgSize, qrBgX, qrBgY + qrBgSize - cornerRadius);
        ctx.lineTo(qrBgX, qrBgY + cornerRadius);
        ctx.quadraticCurveTo(qrBgX, qrBgY, qrBgX + cornerRadius, qrBgY);
        ctx.closePath();
        ctx.fill();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(business.name, canvas.width / 2, 150);

        ctx.fillStyle = '#475569';
        ctx.font = '48px system-ui, -apple-system, sans-serif';
        ctx.fillText('Scan to Book an Appointment', canvas.width / 2, qrY + qrSize + 100);

        ctx.fillStyle = '#64748b';
        ctx.font = '36px system-ui, -apple-system, sans-serif';
        ctx.fillText(window.location.hostname, canvas.width / 2, canvas.height - 80);

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${business.name.toLowerCase().replace(/\s+/g, '-')}-qr-code.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            toast({
              title: "QR Code Downloaded",
              description: "Ready to share on social media!",
            });
          }
        }, 'image/png');
      };

      qrImage.src = qrDataURL;

    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const copyBookingLink = () => {
    const bookingUrl = `${window.location.origin}/b/${business.id}`;
    navigator.clipboard.writeText(bookingUrl);
    toast({
      title: "Link Copied",
      description: "Booking link copied to clipboard",
    });
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading your premium dashboard...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Business not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Premium Header with Glass Effect */}
      <div className="sticky top-0 z-50">
        <div className="glass border-b">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src="/logo.png"
                    alt="TimeLine Logo"
                    className="w-12 h-12 rounded-2xl shadow-luxury"
                  />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-accent rounded-full flex items-center justify-center">
                    <Crown className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="font-bold text-xl gradient-text">{business.name}</h1>
                  <p className="text-sm text-muted-foreground font-medium">Premium Business Suite</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Premium Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass border-0 shadow-luxury group hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Today's Appointments</p>
                  <p className="text-3xl font-bold gradient-text">{stats.today}</p>
                </div>
                <div className="bg-gradient-accent text-white rounded-xl w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CalendarDays className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-green-500 font-medium">+12%</span>
                <span className="text-muted-foreground ml-1">from yesterday</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-luxury group hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">This Week</p>
                  <p className="text-3xl font-bold gradient-text">{stats.thisWeek}</p>
                </div>
                <div className="bg-gradient-primary text-white rounded-xl w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-blue-500 font-medium">+8%</span>
                <span className="text-muted-foreground ml-1">from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-luxury group hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
                  <p className="text-3xl font-bold gradient-text">{stats.completed}</p>
                </div>
                <div className="bg-green-500 text-white rounded-xl w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <Star className="w-4 h-4 text-yellow-500 mr-2" />
                <span className="text-yellow-500 font-medium">98%</span>
                <span className="text-muted-foreground ml-1">satisfaction rate</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-luxury group hover:shadow-glow transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Clients</p>
                  <p className="text-3xl font-bold gradient-text">{stats.thisMonth}</p>
                </div>
                <div className="bg-gradient-accent text-white rounded-xl w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <Sparkles className="w-4 h-4 text-purple-500 mr-2" />
                <span className="text-purple-500 font-medium">Premium</span>
                <span className="text-muted-foreground ml-1">experience</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Premium Action Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Today's Schedule - Enhanced */}
          <Card className="lg:col-span-2 glass border-0 shadow-luxury">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-primary text-white rounded-xl w-10 h-10 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Today's Schedule</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {format(new Date(), 'EEEE, MMMM do, yyyy')}
                    </CardDescription>
                  </div>
                </div>
                <Dialog open={showAddAppointmentDialog} onOpenChange={setShowAddAppointmentDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-primary text-white border-0 shadow-medium hover:shadow-strong transition-all">
                      <Plus className="w-4 h-4 mr-2" />
                      New Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Appointment</DialogTitle>
                      <DialogDescription>
                        Manually book an appointment for a customer
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="customer_name">Customer Name *</Label>
                          <Input
                            id="customer_name"
                            value={newAppointment.customer_name}
                            onChange={(e) => setNewAppointment(prev => ({ ...prev, customer_name: e.target.value }))}
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customer_phone">Phone *</Label>
                          <Input
                            id="customer_phone"
                            value={newAppointment.customer_phone}
                            onChange={(e) => setNewAppointment(prev => ({ ...prev, customer_phone: e.target.value }))}
                            placeholder="+961 XX XXX XXX"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customer_email">Email (Optional)</Label>
                        <Input
                          id="customer_email"
                          type="email"
                          value={newAppointment.customer_email}
                          onChange={(e) => setNewAppointment(prev => ({ ...prev, customer_email: e.target.value }))}
                          placeholder="john@example.com"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Date *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {newAppointment.appointment_date 
                                  ? format(new Date(newAppointment.appointment_date), "PPP")
                                  : "Pick a date"
                                }
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={newAppointment.appointment_date ? new Date(newAppointment.appointment_date) : undefined}
                                onSelect={(date) => 
                                  setNewAppointment(prev => ({ 
                                    ...prev, 
                                    appointment_date: date ? format(date, 'yyyy-MM-dd') : '' 
                                  }))
                                }
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="appointment_time">Time *</Label>
                          <Input
                            id="appointment_time"
                            type="time"
                            value={newAppointment.appointment_time}
                            onChange={(e) => setNewAppointment(prev => ({ ...prev, appointment_time: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          value={newAppointment.notes}
                          onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Any special requests or notes..."
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setShowAddAppointmentDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={handleAddAppointment}
                        >
                          Create Appointment
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gradient-secondary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <CalendarDays className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">No appointments scheduled for today</p>
                    <p className="text-sm text-muted-foreground mt-1">Your calendar is clear and ready for new bookings</p>
                  </div>
                ) : (
                  todayAppointments.map((appointment) => (
                    <div 
                      key={appointment.id} 
                      className="glass p-4 rounded-xl border transition-all hover:shadow-medium group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-gradient-accent text-white rounded-lg w-12 h-12 flex items-center justify-center">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-base">{appointment.customer_name}</h4>
                            {(appointment as any).services && (
                              <p className="text-sm text-primary font-medium">{(appointment as any).services.name}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {appointment.appointment_time}
                              </span>
                              {appointment.customer_phone && (
                                <span>{appointment.customer_phone}</span>
                              )}
                            </div>
                            {appointment.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{appointment.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={appointment.status === 'completed' ? 'default' : 'secondary'}
                            className="font-medium"
                          >
                            {appointment.status}
                          </Badge>
                          <div className="flex gap-1">
                            {appointment.status === 'confirmed' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Premium QR Code & Sharing */}
          <Card className="glass border-0 shadow-luxury">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-accent text-white rounded-xl w-10 h-10 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Business QR Code</CardTitle>
                  <CardDescription>Share your booking link with customers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white p-4 rounded-2xl shadow-medium border">
                <QRCodeSVG
                  value={`${window.location.origin}/b/${business.id}`}
                  size={160}
                  level="M"
                  includeMargin={true}
                  className="mx-auto"
                />
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={generateQRCode} 
                  className="w-full bg-gradient-primary text-white border-0 shadow-medium hover:shadow-strong transition-all"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR Code
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={copyBookingLink}
                  className="w-full border-primary/20 hover:bg-primary/5"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Booking Link
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `Book with ${business.name}`,
                        text: `Schedule your appointment with ${business.name}`,
                        url: `${window.location.origin}/b/${business.id}`
                      });
                    }
                  }}
                  className="w-full border-accent/20 hover:bg-accent/5"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Link
                </Button>
              </div>
              
              <div className="text-center pt-2">
                <p className="text-xs text-muted-foreground">
                  Customers can scan this QR code to book appointments instantly
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Appointments Dialog */}
        <Dialog open={showAllAppointmentsDialog} onOpenChange={setShowAllAppointmentsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold gradient-text">All Appointments</DialogTitle>
              <DialogDescription>
                View and manage all your bookings across all dates
              </DialogDescription>
            </DialogHeader>
            
            <div className="overflow-y-auto max-h-[60vh] space-y-4 pr-2">
              {allAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gradient-secondary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <CalendarDays className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">No appointments found</p>
                  <p className="text-sm text-muted-foreground mt-1">Start booking appointments to see them here</p>
                </div>
              ) : (
                allAppointments.map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className="glass p-4 rounded-xl border transition-all hover:shadow-medium group pointer-events-auto"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-gradient-accent text-white rounded-lg w-12 h-12 flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-base">{appointment.customer_name}</h4>
                          {(appointment as any).services && (
                            <p className="text-sm text-primary font-medium">{(appointment as any).services.name}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {appointment.appointment_time}
                            </span>
                            {appointment.customer_phone && (
                              <span>{appointment.customer_phone}</span>
                            )}
                          </div>
                          {appointment.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{appointment.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={appointment.status === 'completed' ? 'default' : 'secondary'}
                          className="font-medium"
                        >
                          {appointment.status}
                        </Badge>
                        <div className="flex gap-1">
                          {appointment.status === 'confirmed' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 pointer-events-auto"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 pointer-events-auto"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Premium Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass border-0 shadow-luxury hover-glow cursor-pointer" onClick={() => navigate('/business/services')}>
            <CardContent className="p-8 text-center">
              <div className="bg-gradient-accent text-white rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2 gradient-text">Manage Services</h3>
              <p className="text-muted-foreground text-sm">Add and edit service offerings</p>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-luxury hover-glow cursor-pointer" onClick={() => setShowCalendarDialog(true)}>
            <CardContent className="p-8 text-center">
              <div className="bg-gradient-primary text-white rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2 gradient-text">Manage Calendar</h3>
              <p className="text-muted-foreground text-sm">Configure business hours</p>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-luxury hover-glow cursor-pointer" onClick={() => setShowAllAppointmentsDialog(true)}>
            <CardContent className="p-8 text-center">
              <div className="bg-gradient-accent text-white rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2 gradient-text">All Appointments</h3>
              <p className="text-muted-foreground text-sm">View all bookings</p>
            </CardContent>
          </Card>

          <Card className="glass border-0 shadow-luxury hover-glow cursor-pointer" onClick={() => navigate('/business/settings')}>
            <CardContent className="p-8 text-center">
              <div className="bg-gradient-primary text-white rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg mb-2 gradient-text">Business Settings</h3>
              <p className="text-muted-foreground text-sm">Update profile</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;