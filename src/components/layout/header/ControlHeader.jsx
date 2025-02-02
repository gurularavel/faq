import { AppBar, Box, IconButton, Toolbar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import UserDropdown from "./UserDropdown";
import { useHeader } from "@hooks/useHeader";
export default function ControlHeader({ drawerWidth, handleDrawerToggle }) {
  const { content } = useHeader();

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        bgcolor: "white",
        color: "black",
        boxShadow: "none",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { md: "none" } }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mr: 1 }}>
          {content}
        </Box>

        <UserDropdown />
      </Toolbar>
    </AppBar>
  );
}
