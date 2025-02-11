import { AppBar, Box, IconButton, Toolbar } from "@mui/material";
import UserDropdown from "./UserDropdown";
import Logo from "@assets/images/logo.svg";
import Notifications from "./Notifications";
export default function UserHeader() {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: "100%",
        bgcolor: "white",
        color: "black",
        boxShadow: "none",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Toolbar>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          width={"100%"}
          alignItems={"center"}
        >
          <Box width={{ xs: 140, md: 220 }}>
            <img src={Logo} alt="logo" style={{ width: "100%" }} />
          </Box>
          <Box display={"flex"} alignItems={"center"}>
            <Notifications />
            <UserDropdown />
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
