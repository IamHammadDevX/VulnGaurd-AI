import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, useEffect } from "react";
import { Home } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@workspace/replit-auth-web";
import { AuthLoadingOverlay } from "@/components/AuthLoadingOverlay";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CookieConsent } from "@/components/CookieConsent";
import { initUmami, trackPageView } from "@/lib/analytics";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Profile = lazy(() => import("@/pages/Profile"));
const Teams = lazy(() => import("@/pages/Teams"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const Contact = lazy(() => import("@/pages/Contact"));
const Support = lazy(() => import("@/pages/Support"));
const Pricing = lazy(() => import("@/pages/Pricing"));
const ApiDocs = lazy(() => import("@/pages/ApiDocs"));
const Legal = lazy(() => import("@/pages/Legal"));
const Product = lazy(() => import("@/pages/Product"));
const Features = lazy(() => import("@/pages/Features"));
const HelpCenter = lazy(() => import("@/pages/HelpCenter"));
const NotFound = lazy(() => import("@/pages/not-found"));
const Landing = lazy(() => import("@/pages/Landing"));
const DefaultHome = lazy(() => import("@/pages/Home"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRouter() {
  return (
    <Suspense fallback={<AuthLoadingOverlay />}>
      <Switch>
        <Route path="/" component={DefaultHome} />
        <Route path="/home" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        <Route path="/auth/callback" component={AuthCallback} />
        <Route path="/dashboard">
          {() => (
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/profile">
          {() => (
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/teams">
          {() => (
            <ProtectedRoute>
              <Teams />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/legal" component={Legal} />
        <Route path="/contact" component={Contact} />
        <Route path="/support" component={Support} />
        <Route path="/help-center" component={HelpCenter} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/api-docs" component={ApiDocs} />
        <Route path="/product" component={Product} />
        <Route path="/features" component={Features} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

/**
 * AppInitializer checks if auth is still loading.
 * Shows spinner if loading, otherwise renders router.
 */
function AppInitializer() {
  const { isLoading, isAuthenticated } = useAuth();

  // Show full-screen loading spinner during initial auth check
  if (isLoading) {
    return (
      <AuthLoadingOverlay
        title={isAuthenticated ? "Authenticating session" : "Loading platform"}
        subtitle={isAuthenticated ? "Verifying secure access..." : "Getting everything ready..."}
      />
    );
  }

  return <AppRouter />;
}

/**
 * Analytics wrapper that tracks page views
 */
function AnalyticsTracker() {
  const [location] = useLocation();

  useEffect(() => {
    // Initialize Umami on first mount
    initUmami();
  }, []);

  useEffect(() => {
    // Track page view on location change
    // Umami automatically tracks page views, but we track explicitly for custom events
    trackPageView(location);
  }, [location]);

  return <AppInitializer />;
}

function GlobalHomeShortcut() {
  const [location] = useLocation();
  const pathname = location.split(/[?#]/)[0];
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const isHomepage = normalizedPath === "/" || normalizedPath === "/home";

  if (isHomepage) {
    return null;
  }

  return (
    <a
      href="/home"
      className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-full border border-border bg-card/95 px-4 py-2 text-sm font-semibold text-foreground shadow-lg backdrop-blur-md transition-colors hover:bg-muted/60"
      aria-label="Back to homepage"
    >
      <Home className="h-4 w-4" />
      Home
    </a>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AnalyticsTracker />
          <GlobalHomeShortcut />
        </WouterRouter>
        <Toaster />
        <CookieConsent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
