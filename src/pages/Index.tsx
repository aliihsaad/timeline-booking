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
      <header className="relative w-full min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
          {/* Logo */}
          <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
            <img
              src="/timeline-logo-alt.png"
              alt="TimeLine Logo"
              className="w-48 h-48 md:w-64 md:h-64 drop-shadow-2xl"
            />
          </div>

          {/* Main Heading */}
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Simplify Your
              <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Appointment Scheduling
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
              The modern booking platform that helps businesses manage appointments effortlessly while delighting customers
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Badge className="bg-white/10 backdrop-blur-sm text-white border-white/20 px-4 py-2 text-sm hover:bg-white/20 transition-colors">
              <CheckCircle className="w-4 h-4 mr-2 text-cyan-400" />
              24/7 Online Booking
            </Badge>
            <Badge className="bg-white/10 backdrop-blur-sm text-white border-white/20 px-4 py-2 text-sm hover:bg-white/20 transition-colors">
              <CheckCircle className="w-4 h-4 mr-2 text-cyan-400" />
              Real-Time Updates
            </Badge>
            <Badge className="bg-white/10 backdrop-blur-sm text-white border-white/20 px-4 py-2 text-sm hover:bg-white/20 transition-colors">
              <CheckCircle className="w-4 h-4 mr-2 text-cyan-400" />
              No Setup Fees
            </Badge>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link to="/business/login">
              <Button
                size="lg"
                className="group relative px-8 py-6 text-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <Building2 className="w-5 h-5 mr-2" />
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            <Link to="/my-appointments">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg font-semibold border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm transition-all duration-300"
              >
                <Calendar className="w-5 h-5 mr-2" />
                View My Bookings
              </Button>
            </Link>
          </div>

          {/* Trust indicator */}
          <div className="mt-16 text-center">
            <p className="text-sm text-blue-200/80 mb-3">Trusted by businesses worldwide</p>
            <div className="flex items-center justify-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 border-2 border-white/20"></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white/20"></div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 border-2 border-white/20"></div>
              </div>
              <span className="text-sm text-blue-200 ml-2">Join 1000+ businesses</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-2">
            <div className="w-1 h-2 bg-white/50 rounded-full"></div>
          </div>
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