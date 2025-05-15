import React, { useEffect, useState } from "react";
import {
  Menu,
  MenuItem,
  IconButton,
  Box,
  Modal,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import NotificationImg from "@assets/icons/notification.svg";
import { userPrivateApi } from "@src/utils/axios/userPrivateApi";
import { notify } from "@utils/toast/notify";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import Badge from "@mui/material/Badge";
import dayjs from "dayjs";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import DoneAllIcon from "@mui/icons-material/DoneAll";
const getNotificationIcon = (type) => {
  switch (type) {
    case "exam":
      return <AssignmentIcon sx={{ mr: 2, color: "#1976d2" }} />;
    case "faq":
      return <LiveHelpIcon sx={{ mr: 2, color: "#1976d2" }} />;
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
  const [allNotificationsModal, setAllNotificationsModal] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [faqData, setFaqData] = useState(null);
  const [pending, setPending] = useState(false);
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

  const handleAllNotificationsModalClose = () => {
    setAllNotificationsModal(false);
  };

  const getNotifications = async () => {
    try {
      const res = await userPrivateApi.get("/notifications/list");
      // Sort notifications: unseen first, then by date
      const sortedNotifications = res.data.data.sort((a, b) => {
        if (a.is_seen !== b.is_seen) {
          return a.is_seen ? 1 : -1;
        }
        return new Date(b.sent_date) - new Date(a.sent_date);
      });
      setNotifications(sortedNotifications);
    } catch (error) {
      notify(
        error.response?.data?.message || "Failed to fetch notifications",
        "error"
      );
    }
  };

  const getFaqDetails = async (item) => {
    setPending(true);
    try {
      const res = await userPrivateApi.get(`/faqs/find/${item.model_id}`);
      setFaqData(res.data.data);
      setFaqModalOpen(true);
    } catch (error) {
      if (isAxiosError(error)) {
        notify(
          error.response?.data?.message || "Failed to fetch FAQ details",
          "error"
        );
      }
    } finally {
      setPending(false);
      setModalOpen(false);
      setAllNotificationsModal(false);
    }
  };

  const handleFaqModalClose = () => {
    setFaqModalOpen(false);
    setFaqData(null);
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

  const getExamDetails = async (item) => {
    setPending(true);
    try {
      const res = await userPrivateApi.get(
        `/exams/get-exam-from-notification/${item.model_id}`
      );
      if (res.data.data.is_active) {
        nav(`/user/exams/${res.data.data.id}`);
      } else {
        nav(`/user/exams`);
      }
    } catch (error) {
      if (isAxiosError(error)) {
        nav("/user/exams");
      }
    } finally {
      setPending(false);
      setModalOpen(false);
      setAllNotificationsModal(false);
    }
  };

  const handleNotificationItem = (item) => {
    if (item.type == "exam") {
      getExamDetails(item);
    } else if (item.type == "faq") {
      getFaqDetails(item);
    }
  };

  const markAllAsSeen = async () => {
    try {
      await userPrivateApi.post("/notifications/seen-bulk", {});
      setNotifications((prev) => prev.map((n) => ({ ...n, is_seen: true })));
    } catch (error) {
      if (isAxiosError(error)) {
        notify(
          error.response?.data?.message ||
            "Failed to mark all notifications as seen",
          "error"
        );
      }
    }
  };

  const renderNotificationItem = (notification) => (
    <MenuItem
      key={notification.id}
      onClick={() => handleNotificationClick(notification)}
      sx={{
        backgroundColor: notification.is_seen
          ? "transparent"
          : "rgba(25, 118, 210, 0.08)",
        display: "flex",
        flexDirection: "row",
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
  );

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
        {notifications.some((n) => !n.is_seen) && (
          <MenuItem
            onClick={markAllAsSeen}
            sx={{
              justifyContent: "center",
              color: "#1976d2",
              fontWeight: "bold",
            }}
          >
            {t("mark_all_as_seen")}
            <DoneAllIcon sx={{ color: "#1976d2", ml: 1 }} />
          </MenuItem>
        )}
        {notifications.length === 0 ? (
          <MenuItem>No notifications</MenuItem>
        ) : (
          <>
            {notifications.slice(0, 5).map(renderNotificationItem)}
            {notifications.length > 5 && (
              <MenuItem
                onClick={() => setAllNotificationsModal(true)}
                sx={{
                  justifyContent: "center",
                  color: "#1976d2",
                  fontWeight: "bold",
                }}
              >
                {t("see_more")}
              </MenuItem>
            )}
          </>
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
          <Button
            onClick={handleModalClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "grey.500",
              minWidth: "auto",
              p: 1,
            }}
          >
            ✕
          </Button>
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
                  disabled={pending}
                  onClick={() => handleNotificationItem(selectedNotification)}
                >
                  {selectedNotification.type == "exam" ? t("start") : t("show")}
                  {pending && (
                    <CircularProgress size={14} sx={{ ml: 1 }} color="error" />
                  )}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      <Modal
        open={allNotificationsModal}
        onClose={handleAllNotificationsModalClose}
        aria-labelledby="all-notifications-modal"
        aria-describedby="all-notifications-list"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            maxHeight: "80vh",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #E5E7EB",
              position: "sticky",
              top: 0,
              bgcolor: "background.paper",
              zIndex: 1,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" component="h2">
              {t("all_notifications")}
            </Typography>
            <Button
              onClick={handleAllNotificationsModalClose}
              sx={{
                color: "grey.500",
                minWidth: "auto",
                p: 1,
              }}
            >
              ✕
            </Button>
          </Box>
          <Box sx={{ overflow: "auto", p: 2 }}>
            {notifications.map(renderNotificationItem)}
          </Box>
        </Box>
      </Modal>

      <Modal
        open={faqModalOpen}
        onClose={handleFaqModalClose}
        aria-labelledby="faq-modal"
        aria-describedby="faq-details"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            maxHeight: "80vh",
            overflow: "auto",
          }}
        >
          <Button
            onClick={handleFaqModalClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "grey.500",
              minWidth: "auto",
              p: 1,
            }}
          >
            ✕
          </Button>
          {pending ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : faqData ? (
            <>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <LiveHelpIcon sx={{ mr: 2, color: "#1976d2" }} />
                <Typography variant="h6" component="h2">
                  <div dangerouslySetInnerHTML={{ __html: faqData.question }} />
                </Typography>
              </Box>
              <Typography sx={{ mt: 2 }}>
                <div dangerouslySetInnerHTML={{ __html: faqData.answer }} />
              </Typography>
              <Typography
                variant="caption"
                display="block"
                sx={{ color: "text.secondary", mt: 4 }}
              >
                {dayjs(faqData.created_at).format("DD.MM.YYYY HH:mm")}
              </Typography>
            </>
          ) : (
            <Typography>FAQ not found</Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Notifications;
