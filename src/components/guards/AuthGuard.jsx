import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function AuthGuard() {
  const { isLoggedIn } = useSelector((state) => state.auth);
  const { pathname } = useLocation();
  if (!isLoggedIn) {
    return (
      <Navigate
        to={pathname.startsWith("/control") ? "/auth/control" : "/auth/login"}
        replace
      />
    );
  }

  return <Outlet />;
}
