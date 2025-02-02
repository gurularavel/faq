import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, Toolbar, useTheme, useMediaQuery, styled } from "@mui/material";
import ControlHeader from "@components/layout/header/ControlHeader";
import Sidebar from "@components/layout/sidebar/Sidebar";

const drawerWidth = 280;

const Main = styled("main")(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginLeft: 0,
  minHeight: "calc(100vh - 50px)",
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

export default function ControlLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <ControlHeader
        drawerWidth={drawerWidth}
        handleDrawerToggle={handleDrawerToggle}
      />

      <Sidebar
        drawerWidth={drawerWidth}
        handleDrawerToggle={handleDrawerToggle}
        mobileOpen={mobileOpen}
      />

      <Main open={!isMobile}>
        <Toolbar />
        <Outlet />
      </Main>
    </Box>
  );
}
