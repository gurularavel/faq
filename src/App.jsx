import { lazy } from "react";
import Loadable from "@components/loadable/Loadable";

import { Routes, Route } from "react-router-dom";
import AuthGuard from "@components/guards/AuthGuard";
import { usePermissions } from "@utils/rbac";

import AuthLayout from "@layouts/AuthLayout";
import MainLayout from "@layouts/MainLayout";
import ControlLayout from "@layouts/ControlLayout";

const Login = Loadable(lazy(() => import("@pages/auth/login/Login")));
const ControlLogin = Loadable(
  lazy(() => import("@pages/auth/control/ControlLogin"))
);

// control pages
const Questions = Loadable(
  lazy(() => import("@pages/admin/questions/Questions"))
);
const QuestionsGroup = Loadable(
  lazy(() => import("@pages/admin/questions-group/QuestionsGroup"))
);
const Users = Loadable(lazy(() => import("@pages/admin/users/Users")));
const Translations = Loadable(lazy(() => import("@pages/admin/translations")));

export default function App() {
  const { isAdmin, isUser } = usePermissions();
  return (
    <Routes>
      <Route element={<AuthGuard />}>
        {isAdmin ? (
          <Route path="/" element={<ControlLayout />}>
            <Route index element={<Questions />} />
            <Route path="questions-group" element={<QuestionsGroup />} />
            <Route path="users" element={<Users />} />
            <Route path="translations" element={<Translations />} />
          </Route>
        ) : isUser ? (
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
          </Route>
        ) : (
          <Route path="/" element={<></>} />
        )}
      </Route>

      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="control" element={<ControlLogin />} />
      </Route>
    </Routes>
  );
}
