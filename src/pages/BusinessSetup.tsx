import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Building2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { businessService } from "@/lib/business";
import { useToast } from "@/hooks/use-toast";

const BusinessSetup = () => {
  const [businessData, setBusinessData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/business/login');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await businessService.initializeBusiness(user.id, {
        name: businessData.name,
        email: businessData.email || user.email || '',
        phone: businessData.phone || null,
        address: businessData.address || null,
        description: businessData.description || null,
      });

      if (error) {
        toast({
          title: "Setup Failed",
          description: error.message || "Failed to create business profile",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Business Setup Complete!",
          description: "Your business profile has been created successfully.",
        });
        navigate('/business/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while setting up your business.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setBusinessData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-status flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/business/login")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Login
        </Button>

        <Card className="shadow-strong border-0">
          <CardHeader className="text-center">
            <div className="bg-gradient-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl">Complete Your Business Setup</CardTitle>
            <CardDescription>
              Tell us about your business to get started with TimeLine
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your business name"
                    value={businessData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Business Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="business@example.com"
                    value={businessData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+961 XX XXX XXX"
                    value={businessData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Business address"
                    value={businessData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell customers about your business and services..."
                  value={businessData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !businessData.name || !businessData.email}
                size="lg"
              >
                {isLoading ? "Setting up..." : "Complete Setup"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessSetup;