import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Mail } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { businessService } from "@/lib/business";
import { useToast } from "@/hooks/use-toast";

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      // Check if this is an email confirmation callback
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');

      if (type === 'signup' && accessToken && refreshToken) {
        // User has confirmed their email
        try {
          // Wait a moment for the auth state to update
          setTimeout(async () => {
            if (user) {
              // Check if user already has a business profile
              const { data: business, error } = await businessService.getBusinessByUserId(user.id);
              
              if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
                console.error('Error checking business profile:', error);
                setStatus('error');
                setMessage('There was an error setting up your account. Please try again or contact support.');
                return;
              }

              if (!business) {
                // Redirect to complete business setup
                setStatus('success');
                setMessage('Email confirmed! Please complete your business setup.');
                setTimeout(() => {
                  navigate('/business/setup');
                }, 2000);
              } else {
                // Business already exists, go to dashboard
                setStatus('success');
                setMessage('Email confirmed! Redirecting to your dashboard...');
                setTimeout(() => {
                  navigate('/business/dashboard');
                }, 2000);
              }
            } else {
              setStatus('error');
              setMessage('Authentication failed. Please try logging in again.');
            }
          }, 1000);
        } catch (error) {
          setStatus('error');
          setMessage('There was an error confirming your email. Please try again.');
        }
      } else {
        // Regular page visit or invalid confirmation
        setStatus('success');
        setMessage('Check your email for a confirmation link to activate your account.');
      }
    };

    handleEmailConfirmation();
  }, [searchParams, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-status flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-strong">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <CardTitle>Confirming Email...</CardTitle>
              <CardDescription>Please wait while we verify your email address</CardDescription>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="bg-gradient-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <CardTitle className="text-green-600">Email Confirmed!</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="bg-destructive text-destructive-foreground rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <CardTitle className="text-destructive">Confirmation Failed</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          {status === 'error' && (
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/business/login')}
                className="w-full"
              >
                Back to Login
              </Button>
              <p className="text-sm text-muted-foreground">
                Didn't receive an email? Check your spam folder or try signing up again.
              </p>
            </div>
          )}
          
          {status === 'success' && !searchParams.get('access_token') && (
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-4">
                <Mail className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  We've sent a confirmation email to your inbox. Click the link in the email to activate your account.
                </p>
              </div>
              <Button 
                onClick={() => navigate('/business/login')}
                variant="outline"
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmation;