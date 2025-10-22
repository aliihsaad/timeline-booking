import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import BusinessLanding from "./pages/BusinessLanding";
import BookAppointment from "./pages/BookAppointment";
import StatusPage from "./pages/StatusPage";
import CustomerPortal from "./pages/CustomerPortal";
import BusinessLogin from "./pages/BusinessLogin";
import BusinessSetup from "./pages/BusinessSetup";
import EmailConfirmation from "./pages/EmailConfirmation";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessSettings from "./pages/BusinessSettings";
import ForgotPassword from "./pages/ForgotPassword";
import TermsAndConditions from "./pages/TermsAndConditions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/b/:businessId" element={<BusinessLanding />} />
              <Route path="/book" element={<BookAppointment />} />
              <Route path="/status" element={<StatusPage />} />
              <Route path="/my-appointments" element={<CustomerPortal />} />
              <Route path="/business/login" element={<BusinessLogin />} />
              <Route path="/business/setup" element={<BusinessSetup />} />
              <Route path="/business/confirm" element={<EmailConfirmation />} />
              <Route path="/business/dashboard" element={<BusinessDashboard />} />
              <Route path="/business/settings" element={<BusinessSettings />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/terms" element={<TermsAndConditions />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
