import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "chapter" | "rushee";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground font-body">Loading…</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Redirect to correct dashboard if role doesn't match
  if (requiredRole && role && role !== requiredRole) {
    return <Navigate to={role === "chapter" ? "/dashboard" : "/rushee"} replace />;
  }

  return <>{children}</>;
}
