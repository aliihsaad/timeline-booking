import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Calendar, Users, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { appointmentService } from "@/lib/appointments";

const StatusPage = () => {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get('business') || 'demo';
  const queueId = searchParams.get('q');
  const appointmentId = searchParams.get('appointment');
  
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load real appointment data
  useEffect(() => {
    const loadStatus = async () => {
      if (appointmentId) {
        try {
          const { data, error } = await appointmentService.getAppointment(appointmentId);
          
          if (error || !data) {
            console.error('Error loading appointment:', error);
            setStatus(null);
          } else {
            setStatus({
              type: 'appointment',
              id: data.id,
              name: data.customer_name,
              phone: data.customer_phone,
              email: data.customer_email,
              date: new Date(data.appointment_date),
              time: data.appointment_time,
              status: data.status,
              notes: data.notes,
              bookedAt: new Date(data.created_at)
            });
          }
        } catch (error) {
          console.error('Error loading appointment:', error);
          setStatus(null);
        }
      } else {
        // No appointment ID provided
        setStatus(null);
      }
      
      setIsLoading(false);
    };

    if (appointmentId) {
      loadStatus();
    } else {
      // Simulate loading for cases where there's no appointment ID
      setTimeout(() => {
        setStatus(null);
        setIsLoading(false);
      }, 1000);
    }
  }, [appointmentId]);

  const refreshStatus = async () => {
    if (!appointmentId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await appointmentService.getAppointment(appointmentId);
      
      if (error || !data) {
        console.error('Error refreshing appointment:', error);
      } else {
        setStatus({
          type: 'appointment',
          id: data.id,
          name: data.customer_name,
          phone: data.customer_phone,
          email: data.customer_email,
          date: new Date(data.appointment_date),
          time: data.appointment_time,
          status: data.status,
          notes: data.notes,
          bookedAt: new Date(data.created_at)
        });
      }
    } catch (error) {
      console.error('Error refreshing appointment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-status flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading status...</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-gradient-status">
        <div className="container mx-auto px-4 py-6 max-w-md">
          <div className="flex items-center mb-6">
            <Link to={`/b/${businessId}`}>
              <Button variant="ghost" size="icon" className="mr-3">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Status Not Found</h1>
          </div>
          
          <Card className="shadow-medium border-0">
            <CardContent className="pt-6 text-center">
              <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No active queue or appointment found.
              </p>
              <Link to={`/b/${businessId}`}>
                <Button variant="default" className="w-full">
                  Return to Services
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;

    switch (status.status) {
      case 'confirmed':
        return <Badge variant="secondary" className="bg-accent/20 text-accent">Confirmed</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-queue-complete/20 text-queue-complete">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'no_show':
        return <Badge variant="secondary" className="bg-destructive/20 text-destructive">No Show</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-status">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to={`/b/${businessId}`}>
              <Button variant="ghost" size="icon" className="mr-3">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Status</h1>
              <p className="text-sm text-muted-foreground">Live Updates</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={refreshStatus}
            disabled={isLoading}
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Status Card */}
        <Card className="shadow-medium border-0 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Appointment</CardTitle>
                    <CardDescription>Hello, {status.name}</CardDescription>
                  </div>
                </div>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">
                  {status.time}
                </div>
                <div className="text-muted-foreground">
                  {new Date(status.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              {status.status === 'confirmed' && (
                <div className="bg-accent/10 rounded-lg p-4 text-center">
                  <CheckCircle className="w-6 h-6 text-accent mx-auto mb-2" />
                  <p className="text-sm text-accent font-medium">
                    Your appointment is confirmed
                  </p>
                </div>
              )}

              {status.status === 'completed' && (
                <div className="bg-queue-complete/10 rounded-lg p-4 text-center">
                  <CheckCircle className="w-6 h-6 text-queue-complete mx-auto mb-2" />
                  <p className="text-sm text-queue-complete font-medium">
                    Appointment completed
                  </p>
                </div>
              )}

              {status.status === 'cancelled' && (
                <div className="bg-destructive/10 rounded-lg p-4 text-center">
                  <XCircle className="w-6 h-6 text-destructive mx-auto mb-2" />
                  <p className="text-sm text-destructive font-medium">
                    Appointment cancelled
                  </p>
                </div>
              )}

              {status.notes && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                  <p className="text-sm">{status.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          {status.status === 'confirmed' && (
            <Button variant="outline" size="lg" className="w-full">
              Reschedule Appointment
            </Button>
          )}
          
          <Link to={`/b/${businessId}`}>
            <Button variant="ghost" size="lg" className="w-full">
              Back to Services
            </Button>
          </Link>
        </div>

        {/* Info */}
        <div className="text-center mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Status updates automatically every 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatusPage;