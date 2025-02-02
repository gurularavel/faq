import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function AuthGuard() {
  const { isLoggedIn } = useSelector((state) => state.auth);

  if (!isLoggedIn) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}
