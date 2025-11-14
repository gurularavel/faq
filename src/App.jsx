import { lazy } from "react";
import Loadable from "@components/loadable/Loadable";

import { Routes, Route } from "react-router-dom";
import AuthGuard from "@components/guards/AuthGuard";
import { usePermissions } from "@utils/rbac";

import AuthLayout from "@layouts/AuthLayout";
import MainLayout from "@layouts/MainLayout";
import ControlLayout from "@layouts/ControlLayout";
import DetectLayout from "./layouts/DetectLayout";
import NotificationSettings from "./pages/admin/notifications/NotificationSettings";

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
const ShowQuestion = Loadable(
  lazy(() => import("@pages/admin/questions/show/ShowQuestion"))
);
const ImportQuestions = Loadable(
  lazy(() => import("@pages/admin/questions/import/ImportQuestions"))
);

const QuestionsGroup = Loadable(
  lazy(() => import("@pages/admin/questions-group/QuestionsGroup"))
);
const QuestionsSubGroup = Loadable(
  lazy(() => import("@pages/admin/questions-group/subgroups/QuestionsSubGroup"))
);
const ShowSubGroup = Loadable(
  lazy(() => import("@pages/admin/questions-group/subgroups/show/ShowSubGroup"))
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
const ShowUser = Loadable(
  lazy(() => import("@pages/admin/users/show/ShowUser"))
);

const Quiz = Loadable(lazy(() => import("@pages/admin/quiz/Quiz")));
const QuizQuestions = Loadable(
  lazy(() => import("@pages/admin/quiz/questions/Questions"))
);
const QuizQuestionsAdd = Loadable(
  lazy(() => import("@pages/admin/quiz/questions/add/AddQuestion"))
);
const QuizQuestionsEdit = Loadable(
  lazy(() => import("@pages/admin/quiz/questions/edit/EditQuestion"))
);

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

const PdfExport = Loadable(
  lazy(() => import("@pages/admin/pdf-export/PdfExport"))
);

// reports pages
const TopStatistics = Loadable(
  lazy(() => import("@pages/admin/reports/TopStatistics"))
);
const TimeSeries = Loadable(
  lazy(() => import("@pages/admin/reports/TimeSeries"))
);

// user's pages
const Dashboard = Loadable(
  lazy(() => import("@pages/user/dashboard/Dashboard"))
);
const Exams = Loadable(lazy(() => import("@pages/user/exam/Exams")));
const StartExam = Loadable(
  lazy(() => import("@pages/user/exam/start/StartExam"))
);
const ExamFinished = Loadable(
  lazy(() => import("@pages/user/exam/finished/ExamFinished"))
);
const Exports = Loadable(
  lazy(() => import("@pages/user/exports/Exports"))
);
export default function App() {
  const { isAdmin, isUser } = usePermissions();
  return (
    <Routes>
      <Route element={<AuthGuard />}>
        {isAdmin ? (
          <Route path="/control" element={<ControlLayout />}>
            <Route index element={<Questions />} />
            <Route path="add-question" element={<AddQuestion />} />
            <Route path="import-question" element={<ImportQuestions />} />
            <Route path="edit-question/:id" element={<EditQuestion />} />
            <Route path="show-question/:id" element={<ShowQuestion />} />

            <Route path="questions-group" element={<QuestionsGroup />} />
            <Route path="questions-group/:id" element={<QuestionsSubGroup />} />
            <Route path="questions-group/:parentId/show/:id" element={<ShowSubGroup />} />

            <Route path="users-list" element={<Users />} />
            <Route path="users-list/add" element={<AddUser />} />
            <Route path="users-list/edit/:id" element={<EditUser />} />
            <Route path="users-list/show/:id" element={<ShowUser />} />

            <Route path="users-group" element={<UsersGroup />} />
            <Route path="users-group/:id" element={<UsersSubGroup />} />

            <Route path="tags" element={<Tags />} />

            <Route path="quiz" element={<Quiz />} />
            <Route path="quiz/:quizId" element={<QuizQuestions />} />
            <Route path="quiz/:quizId/add" element={<QuizQuestionsAdd />} />
            <Route
              path="quiz/:quizId/edit/:id"
              element={<QuizQuestionsEdit />}
            />

            <Route path="admins-list" element={<Admins />} />
            <Route path="admins-list/add" element={<AddAdmin />} />
            <Route path="admins-list/edit/:id" element={<EditAdmin />} />

            <Route path="translations" element={<Translations />} />
            <Route path="languages" element={<Languages />} />

            <Route path="difficulty-levels" element={<DifficultyLevels />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="pdf-export" element={<PdfExport />} />

            <Route path="reports/top-statistics" element={<TopStatistics />} />
            <Route path="reports/time-series" element={<TimeSeries />} />
          </Route>
        ) : isUser ? (
          <Route path="/user" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="exams" element={<Exams />} />
            <Route path="exams/:id" element={<StartExam />} />
            <Route path="exams/:id/finished" element={<ExamFinished />} />
            <Route path="exports" element={<Exports />} />
          </Route>
        ) : (
          <Route path="/" element={<></>} />
        )}

        <Route path="/*" element={<DetectLayout />} />
      </Route>

      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="control" element={<ControlLogin />} />
      </Route>
    </Routes>
  );
}
