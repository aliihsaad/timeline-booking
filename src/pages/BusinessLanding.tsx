import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Phone, Mail, Calendar } from "lucide-react";
import { businessService } from "@/lib/business";
import { appointmentService } from "@/lib/appointments";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Business = Database['public']['Tables']['businesses']['Row'];

const BusinessLanding = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayStats, setTodayStats] = useState({ today: 0, thisWeek: 0 });

  useEffect(() => {
    if (!businessId) {
      navigate('/');
      return;
    }

    const loadBusinessData = async () => {
      try {
        const { data: businessData, error: businessError } = await businessService.getBusiness(businessId);
        
        if (businessError) {
          toast({
            title: "Error",
            description: "Business not found",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        setBusiness(businessData);

        // Load appointment stats
        const { data: stats } = await appointmentService.getAppointmentStats(businessId);
        if (stats) {
          setTodayStats(stats);
        }
      } catch (error) {
        console.error('Error loading business:', error);
        toast({
          title: "Error",
          description: "Failed to load business information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadBusinessData();
  }, [businessId, navigate, toast]);

  const handleBookAppointment = () => {
    navigate(`/book?business=${businessId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-status flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading business information...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-status flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <CardTitle>Business Not Found</CardTitle>
            <CardDescription>
              The business you're looking for doesn't exist or is no longer available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-status">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-primary text-primary-foreground">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {business.name}
          </h1>
          {business.description && (
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              {business.description}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90"
              onClick={handleBookAppointment}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book Appointment
            </Button>
          </div>
        </div>
      </div>

      {/* Business Info Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <Card className="shadow-strong">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {business.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{business.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{business.email}</span>
              </div>
              {business.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{business.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card className="shadow-strong">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Business Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              {business.business_hours ? (
                <div className="space-y-2">
                  {Object.entries(business.business_hours as Record<string, any>).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize font-medium">{day}</span>
                      <span className="text-muted-foreground">
                        {hours.open && hours.close ? `${hours.open} - ${hours.close}` : 'Closed'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Monday - Friday</span>
                    <span className="text-muted-foreground">9:00 AM - 5:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Saturday - Sunday</span>
                    <span className="text-muted-foreground">Closed</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 text-center">
          <h2 className="text-3xl font-bold mb-8">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="shadow-strong">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {todayStats.thisWeek}
                </div>
                <p className="text-muted-foreground">Appointments This Week</p>
              </CardContent>
            </Card>
            <Card className="shadow-strong">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {todayStats.today}
                </div>
                <p className="text-muted-foreground">Appointments Today</p>
              </CardContent>
            </Card>
            <Card className="shadow-strong">
              <CardContent className="p-6 text-center">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Professional Service
                </Badge>
                <p className="text-muted-foreground mt-2">Quality Guaranteed</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto shadow-strong bg-gradient-subtle">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Book?</h3>
              <p className="text-muted-foreground mb-6">
                Schedule your appointment now and experience our professional service.
              </p>
              <Button size="lg" className="w-full sm:w-auto" onClick={handleBookAppointment}>
                <Calendar className="w-5 h-5 mr-2" />
                Book Your Appointment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessLanding;