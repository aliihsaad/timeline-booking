import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Clock, DollarSign, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { businessService } from "@/lib/business";
import { serviceService, type Service, type ServiceInsert } from "@/lib/services";

const ServiceManagement = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [businessId, setBusinessId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    price: '',
  });

  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/business/login");
    } else if (user) {
      loadBusinessAndServices();
    }
  }, [user, authLoading, navigate]);

  const loadBusinessAndServices = async () => {
    if (!user) return;

    try {
      const { data: businessData, error: businessError } = await businessService.getBusinessByUserId(user.id);

      if (businessError || !businessData) {
        navigate("/business/setup");
        return;
      }

      setBusinessId(businessData.id);

      const { data: servicesData, error: servicesError } = await serviceService.getBusinessServices(businessData.id);

      if (servicesError) {
        toast({
          title: "Error",
          description: "Failed to load services",
          variant: "destructive",
        });
      } else {
        setServices(servicesData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveService = async () => {
    if (!formData.name || formData.duration <= 0) {
      toast({
        title: "Missing Information",
        description: "Please provide a service name and valid duration",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingService) {
        // Update existing service
        const { error } = await serviceService.updateService(editingService.id, {
          name: formData.name,
          description: formData.description || null,
          duration: formData.duration,
          price: formData.price ? parseFloat(formData.price) : null,
        });

        if (error) {
          toast({
            title: "Error",
            description: "Failed to update service",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Service Updated",
          description: `${formData.name} has been updated`,
        });
      } else {
        // Create new service
        const serviceData: ServiceInsert = {
          business_id: businessId,
          name: formData.name,
          description: formData.description || null,
          duration: formData.duration,
          price: formData.price ? parseFloat(formData.price) : null,
          is_active: true,
        };

        const { error } = await serviceService.createService(serviceData);

        if (error) {
          toast({
            title: "Error",
            description: "Failed to create service",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Service Created",
          description: `${formData.name} has been added`,
        });
      }

      setShowDialog(false);
      setEditingService(null);
      setFormData({ name: '', description: '', duration: 30, price: '' });
      loadBusinessAndServices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save service",
        variant: "destructive",
      });
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      duration: service.duration,
      price: service.price?.toString() || '',
    });
    setShowDialog(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    const { error } = await serviceService.deleteService(serviceId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Service Deleted",
      description: "Service has been removed",
    });

    loadBusinessAndServices();
  };

  const handleToggleActive = async (serviceId: string, isActive: boolean) => {
    const { error } = await serviceService.toggleServiceStatus(serviceId, !isActive);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update service status",
        variant: "destructive",
      });
      return;
    }

    loadBusinessAndServices();
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/business/dashboard')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Service Management</h1>
              <p className="text-muted-foreground">
                Manage the services your business offers to customers
              </p>
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingService(null); setFormData({ name: '', description: '', duration: 30, price: '' }); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
                  <DialogDescription>
                    Define the details of your service offering
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Service Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Haircut, Massage, Consultation"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this service includes..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="15"
                        step="15"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Price (optional)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowDialog(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleSaveService} className="flex-1">
                      {editingService ? 'Update Service' : 'Create Service'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Services List */}
        {services.length === 0 ? (
          <Card className="shadow-medium">
            <CardContent className="p-12 text-center">
              <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Services Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first service to start accepting bookings
              </p>
              <Button onClick={() => setShowDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Service
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id} className="shadow-medium">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      {service.description && (
                        <CardDescription className="mt-1">{service.description}</CardDescription>
                      )}
                    </div>
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration} min</span>
                    </div>
                    {service.price && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>${service.price}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={service.is_active}
                      onCheckedChange={() => handleToggleActive(service.id, service.is_active)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {service.is_active ? 'Available for booking' : 'Hidden from customers'}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditService(service)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceManagement;
