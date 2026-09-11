import { Navigate } from "react-router-dom";
import type { ReactNode} from "react";
import type { JSX } from "react/jsx-runtime";

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: ReactNode;
}

function ProtectedRoute({ isAuthenticated, children }: ProtectedRouteProps): JSX.Element {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default ProtectedRoute;