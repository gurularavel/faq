import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "@utils/rbac";
import { Box, CircularProgress, Typography, Container } from "@mui/material";

export default function DetectLayout() {
  const navigate = useNavigate();
  const { isAdmin, isUser } = usePermissions();

  useEffect(() => {
    if (isAdmin) {
      navigate("/control");
    } else if (isUser) {
      navigate("/user");
    }
  }, [isAdmin, isUser, navigate]);

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 2,
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    </Container>
  );
}
