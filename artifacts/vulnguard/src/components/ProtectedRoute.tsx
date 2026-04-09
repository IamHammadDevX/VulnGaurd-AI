import { ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import { AuthLoadingOverlay } from "./AuthLoadingOverlay";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute wraps pages that require authentication.
 * Shows loading spinner while auth is being checked.
 * Redirects to /login if user is not authenticated.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // Still loading auth state
  if (isLoading) {
    return <AuthLoadingOverlay />;
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    navigate("/login", { replace: true });
    return null;
  }

  // Authenticated, show content
  return <>{children}</>;
}
