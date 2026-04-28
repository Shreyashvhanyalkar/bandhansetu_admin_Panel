import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Login from "./pages/auth/login";
import Register from "./pages/auth/Register";
import Layout from "./pages/layout/Layout";
import Dashboard from "./pages/admin/Dashboard";  // Add this import
import ApproveReject from "./pages/admin/AproveReject";
import Reports from "./pages/admin/Reports";
import Notifications from "./pages/admin/Notifications";
import ReligionManagement from "./pages/admin/ReligionManagement";
import SubAdminManagement from "./pages/admin/SubAdminManagement";
import AdminProfile from './pages/admin/profile';
import LocationManagement from "./pages/admin/LocationManagement";
export default function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ? <Login /> : <Navigate to="/admin/dashboard" replace />
          }
        />
        <Route
          path="/register"
          element={
            !isAuthenticated ? <Register /> : <Navigate to="/admin/dashboard" replace />
          }
        />
        <Route path="/admin" element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
  
  <Route path="dashboard" element={<Dashboard />} />
  <Route path="/admin/religion/*" element={<ReligionManagement />} />
  <Route path="requests" element={<ApproveReject />} />
  <Route path="locations" element={<LocationManagement />} />
  <Route path="religion" element={<ReligionManagement />} />
  <Route path="sub-admins" element={<SubAdminManagement />} />
  <Route path="/admin/profile" element={<AdminProfile />} />

  {/* ✅ FIXED */}
  <Route path="reports/*" element={<Reports />} />
<Route path="notifications/*" element={<Notifications />} />

  <Route index element={<Navigate to="dashboard" replace />} />
</Route>
        <Route
          path="*"
          element={
            <Navigate to={isAuthenticated ? "/admin/dashboard" : "/login"} replace />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}