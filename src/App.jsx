import { BrowserRouter, Route, Routes } from "react-router-dom";
import RoadmapGenerator from "../features/roadmap/RoadmapGenerator";
import ForgotPassword from "./auth/ForgotPassword";
import Login from "./auth/Login";
import Register from "./auth/Register";
import ResetPassword from "./auth/ResetPassword";
import VerifyEmail from "./auth/VerifyEmail";
import VerifyOtp from "./auth/VerifyOtp";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateTodo from "./pages/CreateTodo";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import StudyPlanDetail from "../features/studyPlan/StudyPlanDetails";
// import StudyPlanList from "../features/studyPlan/StudyPlanList";
import StudyPlan from "../features/studyPlan/StudyPlan";
import ProjectGenerator from "../features/projectGenerator/ProjectGenerator";
import NotesSummarizer from "../features/notesSummerizer/NotesSummarizer";
import CodeReviewer from "../features/codeReviewer/CodeReviewer";
import JobMatch from "../features/jobMatch/JobMatch";
import Quiz from "../features/quiz/Quiz";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* add profile route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning/roadmap"
          element={
            <ProtectedRoute>
              <RoadmapGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning/project-generator"
          element={
            <ProtectedRoute>
              <ProjectGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning/notes-summarizer"
          element={
            <ProtectedRoute>
              <NotesSummarizer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning/code-review"
          element={
            <ProtectedRoute>
              <CodeReviewer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning/quiz"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning/job-match"
          element={
            <ProtectedRoute>
              <JobMatch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning/study-plan"
          element={
            <ProtectedRoute>
              <StudyPlan />
              {/* <StudyPlanList /> */}
            </ProtectedRoute>
          }
        />

        <Route
          path="/learning/study-plan/:id"
          element={
            <ProtectedRoute>
              <StudyPlanDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-todo"
          element={
            <ProtectedRoute>
              <CreateTodo />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
