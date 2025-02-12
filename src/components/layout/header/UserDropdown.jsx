import React, { useState } from "react";
import { Menu, MenuItem, IconButton, Box } from "@mui/material";
import UserImage from "@assets/icons/user.svg";
import LogoutIcon from "@assets/icons/logout.svg";
import { useDispatch } from "react-redux";
import { deAuthenticate } from "@src/store/auth";
import { useNavigate } from "react-router-dom";
import PasswordChangeModal from "./PasswordChangeModal";
import { useTranslate } from "@src/utils/translations/useTranslate";

const UserDropdown = () => {
  const t = useTranslate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    setIsPasswordModalOpen(true);
    handleClose();
  };

  const dispatch = useDispatch();
  const nav = useNavigate();
  const handleLogout = () => {
    dispatch(deAuthenticate());
    nav("/auth/control");
  };

  return (
    <Box className="user-icon-button">
      <IconButton
        onClick={handleClick}
        size="small"
        aria-controls={open ? "user-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        disableRipple
      >
        <div className="user-avatar">
          <img src={UserImage} alt="User" />
        </div>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              minWidth: "200px",
              backgroundColor: "#F5FAFF",
              border: "1px solid #A2ADC880",
              borderRadius: "8px",
              mt: 1,
              "& .MuiList-root": {
                paddingTop: 0,
                paddingBottom: 0,
                position: "relative",
                zIndex: 2,
              },
              "& .MuiMenuItem-root": {
                fontSize: "14px",
                padding: "10px 16px",
                color: "#4B5563",
                borderBottom: "1px solid #E5E7EB",
                "&:last-child": {
                  borderBottom: "none",
                },
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
              },
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                backgroundColor: "#F5FAFF",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 1,
                borderLeft: "1px solid #A2ADC880",
                borderTop: "1px solid #A2ADC880",
              },
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleProfileClick}>{t("profile")}</MenuItem>
        <MenuItem className="logout-item" onClick={handleLogout}>
          <img src={LogoutIcon} alt="Logout" className="logout-icon" />
          <span>{t("logout")}</span>
        </MenuItem>
      </Menu>

      <PasswordChangeModal
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </Box>
  );
};

export default UserDropdown;
