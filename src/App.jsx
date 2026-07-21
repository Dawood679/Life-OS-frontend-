import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './auth/Register';
import Login from './auth/Login';
import VerifyOtp from './auth/VerifyOtp';
import VerifyEmail from './auth/VerifyEmail';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import CreateTodo from './pages/CreateTodo';



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
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      {/* add profile route */}
        <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create-todo" element={<ProtectedRoute><CreateTodo /></ProtectedRoute>} />

        
      </Routes>
    </BrowserRouter>
  );
}