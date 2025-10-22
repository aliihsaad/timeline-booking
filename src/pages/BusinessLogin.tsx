import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { businessService } from "@/lib/business";
import { useRateLimit } from "@/hooks/useRateLimit";
import { sanitizeAuthError } from "@/utils/secureError";

const BusinessLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signIn, signUp, loading } = useAuth();
  
  // Rate limiting for login attempts (max 5 attempts per 15 minutes)
  const authRateLimit = useRateLimit({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockMs: 30 * 60 * 1000, // 30 minutes block
  });

  useEffect(() => {
    if (user && !loading) {
      navigate("/business/dashboard");
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    if (authRateLimit.isBlocked()) {
      const remainingTime = authRateLimit.getRemainingTime();
      toast({
        title: "Too Many Attempts",
        description: `Please wait ${remainingTime} seconds before trying again.`,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Record the attempt
      if (!authRateLimit.recordAttempt()) {
        const remainingTime = authRateLimit.getRemainingTime();
        toast({
          title: "Rate Limit Exceeded",
          description: `Too many login attempts. Please wait ${remainingTime} seconds.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const { error } = await signIn(email, password);
      
      if (error) {
        const secureMessage = sanitizeAuthError(error);
        toast({
          title: "Login Failed",
          description: secureMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome to your business dashboard!",
        });
        navigate("/business/dashboard");
      }
    } catch (error) {
      const secureMessage = sanitizeAuthError(error);
      toast({
        title: "Error",
        description: secureMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limiting
    if (authRateLimit.isBlocked()) {
      const remainingTime = authRateLimit.getRemainingTime();
      toast({
        title: "Too Many Attempts",
        description: `Please wait ${remainingTime} seconds before trying again.`,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Record the attempt
      if (!authRateLimit.recordAttempt()) {
        const remainingTime = authRateLimit.getRemainingTime();
        toast({
          title: "Rate Limit Exceeded",
          description: `Too many signup attempts. Please wait ${remainingTime} seconds.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const { error } = await signUp(email, password);
      
      if (error) {
        const secureMessage = sanitizeAuthError(error);
        toast({
          title: "Sign Up Failed",
          description: secureMessage,
          variant: "destructive",
        });
        } else {
          toast({
            title: "Account Created",
            description: "Please check your email to verify your account.",
          });
          // Redirect to confirmation page
          navigate('/business/confirm');
        }
    } catch (error) {
      const secureMessage = sanitizeAuthError(error);
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
    <div className="min-h-screen bg-gradient-status flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="shadow-strong border-0">
          <CardHeader className="text-center">
            <img
              src="/logo.png"
              alt="TimeLine Logo"
              className="w-16 h-16 mx-auto mb-4"
            />
            <CardTitle className="text-2xl">
              {isSignUp ? "Create Business Account" : "Business Login"}
            </CardTitle>
            <CardDescription>
              {isSignUp 
                ? "Set up your TimeLine business account" 
                : "Access your TimeLine business dashboard"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    type="text"
                    placeholder="Enter your business name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your business email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={isSignUp ? "Create a password" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {isSignUp && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground">
                    I agree to the{" "}
                    <Link 
                      to="/terms" 
                      className="text-primary hover:underline"
                      target="_blank"
                    >
                      Terms and Conditions
                    </Link>
                  </Label>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || (isSignUp && !acceptTerms)}
                size="lg"
              >
                {isLoading 
                  ? (isSignUp ? "Creating Account..." : "Signing in...") 
                  : (isSignUp ? "Create Account" : "Sign In")
                }
              </Button>
            </form>
            
            {!isSignUp && (
              <div className="mt-4 text-center">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
            )}
            
            <div className="mt-6 text-center">
              <Button
                variant="link"
                className="text-sm"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp 
                  ? "Already have an account? Sign In" 
                  : "Don't have an account? Sign Up"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessLogin;