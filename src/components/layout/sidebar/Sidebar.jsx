import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Collapse,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useTranslate } from "@src/utils/translations/useTranslate";
import { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

import Logo from "@assets/images/logo.svg";

import QuestionIcon from "@assets/icons/menu-icons/questions.svg";
import QuestionCategoryIcon from "@assets/icons/menu-icons/questions-categories.svg";
import UsersIcon from "@assets/icons/menu-icons/users.svg";
import UserIcon from "@assets/icons/menu-icons/user.svg";
import TagIcon from "@assets/icons/menu-icons/hashtag.svg";
import QuizIcon from "@assets/icons/menu-icons/quiz.svg";

import OthersIcon from "@assets/icons/menu-icons/others.svg";
import AdminIcon from "@assets/icons/menu-icons/admin.svg";
import LangIcon from "@assets/icons/menu-icons/languages.svg";
import TranslationIcon from "@assets/icons/menu-icons/translations.svg";
import DiffIcon from "@assets/icons/menu-icons/difficulties.svg";

export default function Sidebar({
  drawerWidth,
  handleDrawerToggle,
  mobileOpen,
}) {
  const t = useTranslate();
  const [openMenus, setOpenMenus] = useState({});
  const { pathname } = useLocation();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const menuItems = [
    { path: "/control", text: t("questions"), icon: QuestionIcon },
    {
      path: "/control/questions-group",
      text: t("question_group"),
      icon: QuestionCategoryIcon,
    },
    { path: "/control/users-list", text: t("users"), icon: UserIcon },
    {
      path: "/control/users-group",
      text: t("users_group"),
      icon: UsersIcon,
    },
    { path: "/control/tags", text: t("tags"), icon: TagIcon },
    { path: "/control/quiz", text: t("quiz"), icon: QuizIcon },
    {
      text: t("others"),
      icon: OthersIcon,
      children: [
        { path: "/control/admins-list", text: t("admins"), icon: AdminIcon },
        {
          path: "/control/translations",
          text: t("translations"),
          icon: TranslationIcon,
        },
        // { path: "/control/languages", text: t("languages"), icon: LangIcon },
        {
          path: "/control/difficulty-levels",
          text: t("difficulty_levels"),
          icon: DiffIcon,
        },
      ],
    },
  ];

  const isActiveRoute = (itemPath) => {
    if (itemPath === "/control") {
      return pathname === "/control";
    }
    return pathname?.startsWith(itemPath);
  };

  const handleMenuClick = (index) => {
    setOpenMenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const renderMenuItem = (item, index, level = 1) => {
    if (item.children) {
      return (
        <Box key={index}>
          <ListItem
            button
            onClick={() => handleMenuClick(index)}
            sx={{
              pl: level * 2,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <ListItemIcon>
                <img src={item.icon} alt="" />
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </Box>
            {openMenus[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItem>
          <Collapse in={openMenus[index]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child, childIndex) =>
                renderMenuItem(child, `${index}-${childIndex}`, level + 1)
              )}
            </List>
          </Collapse>
        </Box>
      );
    }

    return (
      <ListItem
        button={"true"}
        component={Link}
        to={item.path}
        key={index}
        className={isActiveRoute(item.path) ? "active" : ""}
        sx={{ pl: level * 2 }}
      >
        <ListItemIcon>
          <img src={item.icon} alt="" />
        </ListItemIcon>
        <ListItemText primary={item.text} />
      </ListItem>
    );
  };

  const drawer = (
    <Box mt={2}>
      <List>{menuItems.map((item, index) => renderMenuItem(item, index))}</List>
    </Box>
  );

  return (
    <Box
      component="nav"
      className="sidebar"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            borderRight: "1px solid #e0e0e0",
          },
        }}
      >
        <Link to={"/control"}>
          <Box
            component={"img"}
            src={Logo}
            alt="logo"
            width={"70%"}
            marginTop={2}
            marginLeft={2}
          />
        </Link>

        {drawer}
      </Drawer>
    </Box>
  );
}
