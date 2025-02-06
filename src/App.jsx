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
const AddQuestion = Loadable(
  lazy(() => import("@pages/admin/questions/add/AddQuestion"))
);
const EditQuestion = Loadable(
  lazy(() => import("@pages/admin/questions/edit/EditQuestion"))
);

const QuestionsGroup = Loadable(
  lazy(() => import("@pages/admin/questions-group/QuestionsGroup"))
);
const QuestionsSubGroup = Loadable(
  lazy(() => import("@pages/admin/questions-group/subgroups/QuestionsSubGroup"))
);

const UsersGroup = Loadable(
  lazy(() => import("@pages/admin/users-group/UsersGroup"))
);
const UsersSubGroup = Loadable(
  lazy(() => import("@pages/admin/users-group/subgroups/UsersSubGroup"))
);

const Users = Loadable(lazy(() => import("@pages/admin/users/Users")));
const AddUser = Loadable(lazy(() => import("@pages/admin/users/add/AddUser")));
const EditUser = Loadable(
  lazy(() => import("@pages/admin/users/edit/EditUser"))
);

const Quiz = Loadable(lazy(() => import("@pages/admin/quiz/Quiz")));

const Admins = Loadable(lazy(() => import("@pages/admin/admins/Admins")));
const AddAdmin = Loadable(
  lazy(() => import("@pages/admin/admins/add/AddAdmin"))
);
const EditAdmin = Loadable(
  lazy(() => import("@pages/admin/admins/edit/EditAdmin"))
);

const Translations = Loadable(lazy(() => import("@pages/admin/translations")));
const Languages = Loadable(
  lazy(() => import("@pages/admin/languages/Languages"))
);
const Tags = Loadable(lazy(() => import("@pages/admin/tags/Tags")));

const DifficultyLevels = Loadable(
  lazy(() => import("@pages/admin/difficulty-levels/DifficultyLevels"))
);

export default function App() {
  const { isAdmin, isUser } = usePermissions();
  return (
    <Routes>
      <Route element={<AuthGuard />}>
        {isAdmin ? (
          <Route path="/" element={<ControlLayout />}>
            <Route index element={<Questions />} />
            <Route path="add-question" element={<AddQuestion />} />
            <Route path="edit-question/:id" element={<EditQuestion />} />

            <Route path="questions-group" element={<QuestionsGroup />} />
            <Route path="questions-group/:id" element={<QuestionsSubGroup />} />

            <Route path="users-list" element={<Users />} />
            <Route path="users-list/add" element={<AddUser />} />
            <Route path="users-list/edit/:id" element={<EditUser />} />

            <Route path="users-group" element={<UsersGroup />} />
            <Route path="users-group/:id" element={<UsersSubGroup />} />

            <Route path="tags" element={<Tags />} />

            <Route path="quiz" element={<Quiz />} />

            <Route path="admins-list" element={<Admins />} />
            <Route path="admins-list/add" element={<AddAdmin />} />
            <Route path="admins-list/edit/:id" element={<EditAdmin />} />

            <Route path="translations" element={<Translations />} />
            <Route path="languages" element={<Languages />} />

            <Route path="difficulty-levels" element={<DifficultyLevels />} />
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
