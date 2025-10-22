import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Users, 
  Building2, 
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-status">
      {/* Hero Section */}
      <header className="relative w-full min-h-screen overflow-hidden bg-black">
        {/* Background video */}
        <video
          className="absolute inset-0 h-full w-full object-contain"
          src="https://cbvykjzlckghiyzcvsus.supabase.co/storage/v1/object/public/Hero/Untitled%20design.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />

        {/* Premium Animated Sign In Button */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <Link to="/business/login">
            <div className="group relative">
              {/* Outer glow ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-full opacity-75 group-hover:opacity-100 transition-all duration-1000 group-hover:duration-200 animate-pulse group-hover:animate-none blur-sm"></div>
              
              {/* Animated border gradient */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-spin-slow"></div>
              
              {/* Main button */}
              <button className="relative px-12 py-4 bg-gradient-to-r from-gray-900 via-black to-gray-900 rounded-full text-white font-bold text-xl tracking-wide transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-purple-500/50">
                
                {/* Inner gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full"></div>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 -top-2 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                
                {/* Button content */}
                <span className="relative flex items-center gap-3 z-10">
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-pink-400 group-hover:to-cyan-400 transition-all duration-500">
                    Sign In
                  </span>
                  <div className="transform transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-110">
                    <svg className="w-6 h-6 text-blue-400 group-hover:text-purple-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </span>
                
                {/* Floating particles effect */}
                <div className="absolute inset-0 overflow-hidden rounded-full">
                  <div className="absolute top-2 left-4 w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
                  <div className="absolute top-4 right-6 w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" style={{animationDelay: '0.3s'}}></div>
                  <div className="absolute bottom-3 left-8 w-1 h-1 bg-pink-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" style={{animationDelay: '0.6s'}}></div>
                </div>
              </button>
            </div>
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Manage Appointments
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Give your customers a professional booking experience while keeping your schedule organized
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="shadow-strong">
            <CardHeader className="text-center">
              <div className="bg-gradient-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8" />
              </div>
              <CardTitle>Online Booking</CardTitle>
              <CardDescription>
                Customers can book appointments 24/7 through your personalized business page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Real-time availability
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Automatic confirmations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Mobile-friendly interface
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-strong">
            <CardHeader className="text-center">
              <div className="bg-gradient-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <CardTitle>Time Management</CardTitle>
              <CardDescription>
                Set your business hours and appointment durations to match your schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Flexible time slots
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Custom business hours
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Appointment tracking
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-strong">
            <CardHeader className="text-center">
              <div className="bg-gradient-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>
                Keep track of all your appointments and customer information in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Customer database
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Appointment history
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Status management
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Get started in just a few simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Account</h3>
              <p className="text-muted-foreground">
                Sign up and set up your business profile with hours and services
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Share Your Link</h3>
              <p className="text-muted-foreground">
                Get your unique business page link to share with customers
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Manage Bookings</h3>
              <p className="text-muted-foreground">
                View and manage all appointments from your dashboard
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-2xl mx-auto shadow-strong bg-gradient-subtle">
          <CardContent className="p-8">
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6 text-lg">
              Join thousands of businesses using TimeLine to manage their appointments professionally
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/business/login">
                <Button size="lg" className="text-lg px-8 w-full sm:w-auto">
                  Start Your Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/my-appointments">
                <Button size="lg" variant="outline" className="text-lg px-8 w-full sm:w-auto">
                  Manage My Appointments
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;