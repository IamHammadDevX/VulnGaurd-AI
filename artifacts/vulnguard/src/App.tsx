import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@workspace/replit-auth-web";
import { AuthLoadingOverlay } from "@/components/AuthLoadingOverlay";
import { ProtectedRoute } from "@/components/ProtectedRoute";
// Home is DefaultHome
// DefaultHome imported below
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Teams from "@/pages/Teams";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import AuthCallback from "@/pages/AuthCallback";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Contact from "@/pages/Contact";
import Support from "@/pages/Support";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import DefaultHome from "@/pages/Home";

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
    <Switch>
      <Route path="/" component={DefaultHome} />
      <Route path="/home" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
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
      <Route path="/contact" component={Contact} />
      <Route path="/support" component={Support} />
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * AppInitializer checks if auth is still loading.
 * Shows spinner if loading, otherwise renders router.
 */
function AppInitializer() {
  const { isLoading } = useAuth();

  // Show full-screen loading spinner during initial auth check
  if (isLoading) {
    return <AuthLoadingOverlay />;
  }

  return <AppRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppInitializer />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
