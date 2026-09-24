import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // <-- Import Toaster here

import RoadmapGenerator from "../features/roadmap/RoadmapGenerator";
import StudyPlanDetail from "../features/studyPlan/StudyPlanDetails";
import ForgotPassword from "./auth/ForgotPassword";
import Login from "./auth/Login";
import Register from "./auth/Register";
import ResetPassword from "./auth/ResetPassword";
import VerifyEmail from "./auth/VerifyEmail";
import VerifyOtp from "./auth/VerifyOtp";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
// import StudyPlanList from "../features/studyPlan/StudyPlanList";
import Chat from "../features/chats/Chat";
import CodeReviewer from "../features/codeReviewer/CodeReviewer";
import JobMatch from "../features/jobMatch/JobMatch";
import NotesSummarizer from "../features/notesSummerizer/NotesSummarizer";
import ProjectGenerator from "../features/projectGenerator/ProjectGenerator";
import Quiz from "../features/quiz/Quiz";
import ResumeAnalyzer from "../features/resumeAnalyzer/ResumeAnalyzer";
import StudyPlan from "../features/studyPlan/StudyPlan";
import Todos from "../features/todos/Todos";
import WellnessTracker from "../features/wellness/WellnessTracker";
import PrescriptionScanner from "../features/health/PrescriptionScanner";
import MedicineTracker from "../features/health/MedicineTracker";
import MedicalHistory from "../features/health/MedicalHistory";
import InterviewStudio from "../features/interview/InterviewStudio";
import JobTracker from "../features/jobTracker/JobTracker";

export default function App() {
  return (
    <BrowserRouter>
      {/* Add Toaster globally here */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            fontSize: "14px",
            borderRadius: "12px",
            background: "#333",
            color: "#fff",
          },
        }}
      />
      
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
          path="/learning/roadmap"
          element={
            <ProtectedRoute>
              <RoadmapGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning/action-plan"
          element={
            <ProtectedRoute>
              <ProjectGenerator />
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
          path="/learning/work-review"
          element={
            <ProtectedRoute>
              <CodeReviewer />
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
          path="/career/job-match"
          element={
            <ProtectedRoute>
              <JobMatch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-match"
          element={
            <ProtectedRoute>
              <JobMatch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/todos"
          element={
            <ProtectedRoute>
              <Todos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-todo"
          element={
            <ProtectedRoute>
              <Todos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning/todos"
          element={
            <ProtectedRoute>
              <Todos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/career/resume"
          element={
            <ProtectedRoute>
              <ResumeAnalyzer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/career/mock-interview"
          element={
            <ProtectedRoute>
              <InterviewStudio />
            </ProtectedRoute>
          }
        />
        <Route
          path="/career/applications"
          element={
            <ProtectedRoute>
              <JobTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/career/job-tracker"
          element={
            <ProtectedRoute>
              <JobTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning/mock-interview"
          element={
            <ProtectedRoute>
              <InterviewStudio />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning/chat"
          element={
            <ProtectedRoute>
              <Chat />
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
          path="/health/wellness"
          element={
            <ProtectedRoute>
              <WellnessTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wellness/tracker"
          element={
            <ProtectedRoute>
              <WellnessTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wellness"
          element={
            <ProtectedRoute>
              <WellnessTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/health/prescriptions"
          element={
            <ProtectedRoute>
              <PrescriptionScanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/health/medicines"
          element={
            <ProtectedRoute>
              <MedicineTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/health/history"
          element={
            <ProtectedRoute>
              <MedicalHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/health/medical-history"
          element={
            <ProtectedRoute>
              <MedicalHistory />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}