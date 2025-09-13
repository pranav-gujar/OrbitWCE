
import { useContext } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { AuthContext } from './AuthContext/AuthContext';
import Navbar from './components/Navbar/Navbar';
import SuperAdminRoute from './components/ProtectedRoutes/SuperAdminRoute';
import UserRoute from './components/ProtectedRoutes/UserRoute';
import ForgetPassword from './pages/Auth/ForgetPassword/ForgetPassword';
import Login from './pages/Auth/Login/Login';
import Register from './pages/Auth/Register/Register';
import ResetPassword from './pages/Auth/ResetPassword/ResetPassword';
import VerifyEmail from './pages/Auth/VerifyEmail/VerifyEmail';
import VerifyEmailOTP from './pages/Auth/VerifyOTP/VerifyEmailOTP';
import VerifyPasswordOTP from './pages/Auth/VerifyOTP/VerifyPasswordOTP';
import Dashboard from './pages/Dashboard/Dashboard';
import DeletionRequests from './pages/Events/DeletionRequests';
import Events from './pages/Events/Events';
import EventDetail from './pages/Events/EventDetail';
import SuperAdminEvents from './pages/Events/SuperAdminEvents';
import Home from './pages/Home/Home';
import Messages from './pages/Messages/Messages';
import Notifications from './pages/Notifications/Notifications';
import Profile from './pages/Profile/Profile';
import UserProfileEdit from './pages/Profile/UserProfileEdit';
import Reports from './pages/Reports/Reports';
import SuperAdminReports from './pages/Reports/SuperAdminReports';
import Permissions from './pages/SuperAdmin/Permissions';
import SuperApp from './pages/SuperAdmin/SuperApp';

// Component to normalize the path by removing extra slashes
const NormalizedRoute = ({ children }) => {
  const location = useLocation();
  
  // Check if path has double slashes
  if (location.pathname.includes('//')) {
    const normalizedPathname = location.pathname.replace(/\/+/g, '/');
    return <Navigate to={normalizedPathname} replace />;
  }
  
  return children;
};

// Protected Route component for role-based access
const ProtectedRoute = ({ roles = [], children }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified and user's role is not included, redirect to home
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // If user has required role, render the children or outlet
  return children ? children : <Outlet />;
};

// Wrapper component to handle the token parameter
const VerifyEmailWrapper = () => {
  const { token } = useParams();
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <VerifyEmail token={token} />;
};

// Wrapper component for reset password
const ResetPasswordWrapper = () => {
  const { token } = useParams();
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <ResetPassword token={token} />;
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <NormalizedRoute>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgetPassword />} />
            <Route path="/verify-email-otp" element={<VerifyEmailOTP />} />
            <Route path="/reset-password-otp" element={<VerifyPasswordOTP />} />
            <Route path="/verify-email/:token" element={<VerifyEmailWrapper />} />
            <Route path="/reset-password/:token" element={<ResetPasswordWrapper />} />
            
            {/* SuperAdmin Routes */}
            <Route path="/superadmin">
              <Route element={<SuperAdminRoute />}>
                <Route index element={<SuperApp />} />
                <Route path="events" element={<SuperAdminEvents />} />
                <Route path="deletion-requests" element={<DeletionRequests />} />
                <Route path="reports" element={<SuperAdminReports />} />
                <Route path="permissions" element={<Permissions />} />
              </Route>
            </Route>
            
            {/* Public Event Routes */}
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            
            {/* Protected User Routes - Block SuperAdmin */}
            <Route element={<UserRoute />}>
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/profile/edit" element={
                <ProtectedRoute roles={['user']}>
                  <UserProfileEdit />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/reports" element={
                <ProtectedRoute roles={['community']}>
                  <Reports />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Catch all other routes - Must be the last route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NormalizedRoute>
      </BrowserRouter>
  );
}

export default App;
