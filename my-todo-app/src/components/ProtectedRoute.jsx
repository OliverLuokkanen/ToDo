import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "../context/userProvider.jsx";

export default function ProtectedRoute() {
  const ctx = useUser();

  // Jos ProtectedRoute on vahingossa UserProviderin ulkopuolella
  if (ctx === null) {
    console.error("ProtectedRoute used outside of UserProvider");
    return <Navigate to="/signin" replace />;
  }

  const { user } = ctx;

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // Outlet renderöi lapsireitit (esim. App)
  return <Outlet />;
}