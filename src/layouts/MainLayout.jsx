import React from "react";
import { Outlet } from "react-router-dom";
import { Box, Toolbar, useTheme, useMediaQuery, styled } from "@mui/material";
import UserHeader from "@components/layout/user-header/UserHeader";
import useLanguage from "@hooks/useLanguage";

export default function ControlLayout() {
  // useLanguage("app");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const Main = styled("main")(({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    marginLeft: 0,
    minHeight: "100vh",
    maxWidth: "100%",
    background: "#F5FAFF",
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }));

  return (
    <Box sx={{ display: "flex" }}>
      <UserHeader />

      <Main>
        <Toolbar />
        <Outlet />
      </Main>
    </Box>
  );
}
