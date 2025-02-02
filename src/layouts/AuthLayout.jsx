import { Box, Card, Container } from "@mui/material";
import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import Logo from "@assets/images/logo.svg";
export default function AuthLayout() {
  const { isLoggedIn } = useSelector((state) => state.auth);

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return (
    <Box className="login-container">
      <Box className={"auth-logo"}>
        <img src={Logo} alt="FAQ support" />
      </Box>
      <Container>
        <Card className="auth-card">
          <Outlet />
        </Card>
      </Container>
    </Box>
  );
}
