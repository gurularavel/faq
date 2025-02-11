import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useTranslate } from "@src/utils/translations/useTranslate";

import Logo from "@assets/images/logo.svg";

import QuestionIcon from "@assets/icons/menu-icons/questions.svg";
import QuestionCategoryIcon from "@assets/icons/menu-icons/questions-categories.svg";
import UsersIcon from "@assets/icons/menu-icons/users.svg";
import UserIcon from "@assets/icons/menu-icons/user.svg";
import TagIcon from "@assets/icons/menu-icons/hashtag.svg";
import QuizIcon from "@assets/icons/menu-icons/quiz.svg";

export default function Sidebar({
  drawerWidth,
  handleDrawerToggle,
  mobileOpen,
}) {
  const t = useTranslate();

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
    { path: "/control/admins-list", text: t("admins"), icon: UserIcon },
    { path: "/control/translations", text: t("translations"), icon: UserIcon },
    { path: "/control/languages", text: t("languages"), icon: UserIcon },
    {
      path: "/control/difficulty-levels",
      text: t("difficulty_levels"),
      icon: UserIcon,
    },
  ];
  const isActiveRoute = (itemPath) => {
    if (itemPath === "/control") {
      return pathname === "/control";
    }
    return pathname.startsWith(itemPath);
  };
  const drawer = (
    <Box mt={2}>
      <List>
        {menuItems.map((item, index) => (
          <ListItem
            button={"true"}
            component={Link}
            to={item.path}
            key={index}
            className={isActiveRoute(item.path) ? "active" : ""}
          >
            <ListItemIcon>
              <img src={item.icon} alt="" />
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
  return (
    <Box
      component="nav"
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
