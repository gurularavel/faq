import React, { useEffect, useState } from "react";
import {
  Menu,
  MenuItem,
  IconButton,
  Box,
  Modal,
  Typography,
  Button,
} from "@mui/material";
import NotificationImg from "@assets/icons/notification.svg";
import { userPrivateApi } from "@src/utils/axios/userPrivateApi";
import { notify } from "@utils/toast/notify";
import AssignmentIcon from "@mui/icons-material/Assignment";
import Badge from "@mui/material/Badge";
import dayjs from "dayjs";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { Link, useNavigate } from "react-router-dom";

const getNotificationIcon = (type) => {
  switch (type) {
    case "exam":
      return <AssignmentIcon sx={{ mr: 2, color: "#1976d2" }} />;
    default:
      return <AssignmentIcon sx={{ mr: 2, color: "#1976d2" }} />;
  }
};

const Notifications = () => {
  const t = useTranslate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedNotification(null);
  };

  const getNotifications = async () => {
    try {
      const res = await userPrivateApi.get("/notifications/list");
      setNotifications(res.data.data);
    } catch (error) {
      notify(
        error.response?.data?.message || "Failed to fetch notifications",
        "error"
      );
    }
  };

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setModalOpen(true);

    if (!notification.is_seen) {
      try {
        await userPrivateApi.get(`/notifications/${notification.id}/show`);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_seen: true } : n
          )
        );
      } catch (error) {
        notify(
          error.response?.data?.message ||
            "Failed to mark notification as seen",
          "error"
        );
      }
    }
  };

  const getUnseenCount = () => {
    return notifications.filter((n) => !n.is_seen).length;
  };

  useEffect(() => {
    getNotifications();
  }, []);
  const nav = useNavigate();
  const handleNotificationItem = (item) => {
    if (item.type == "exam") {
      nav(`/user/exams/${item.id}`);
      handleModalClose();
    }
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
          <Badge badgeContent={getUnseenCount()} color="error">
            <img src={NotificationImg} alt="Notifications" />
          </Badge>
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
              minWidth: "300px",
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
        {notifications.length === 0 ? (
          <MenuItem>No notifications</MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                backgroundColor: notification.is_seen
                  ? "transparent"
                  : "rgba(25, 118, 210, 0.08)",
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 1,
                alignItems: "center",
              }}
            >
              {getNotificationIcon(notification.type)}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                  {notification.title}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {dayjs(notification.sent_date).format("DD.MM.YYYY HH:mm")}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>

      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        aria-labelledby="notification-modal"
        aria-describedby="notification-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          {selectedNotification && (
            <>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                {getNotificationIcon(selectedNotification.type)}
                <Typography variant="h6" component="h2">
                  {selectedNotification.title}
                </Typography>
              </Box>
              <Typography sx={{ mt: 2 }}>
                {selectedNotification.message}
              </Typography>
              <Box
                display={"flex"}
                alignItems={"center"}
                justifyContent={"space-between"}
                marginTop={4}
              >
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ color: "text.secondary" }}
                >
                  {dayjs(selectedNotification.sent_date).format(
                    "DD.MM.YYYY HH:mm"
                  )}
                </Typography>
                <Button
                  variant={"contained"}
                  color="error"
                  size="small"
                  onClick={() => handleNotificationItem(selectedNotification)}
                >
                  {t("open")}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Notifications;
