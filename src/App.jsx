// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Plans from "./pages/admin/Plans";
import Login from "./pages/auth/login";
import Layout from "./pages/layout/Layout";
import Dashboard from "./pages/admin/Dashboard";
import ApproveReject from "./pages/admin/AproveReject";
import Reports from "./pages/admin/Reports";
import Notifications from "./pages/admin/Notifications";
import ReligionManagement from "./pages/admin/ReligionManagement";
import SubAdminManagement from "./pages/admin/SubAdminManagement";
import AdminProfile from "./pages/admin/profile";
import LocationManagement from "./pages/admin/LocationManagement";
import ProfileDetails from "./pages/admin/profileDetails"; // ← user profile view
import GalleryPage from "./pages/admin/GalleryPage";
export function AppRoutes() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Routes>

      {/* ── Auth Routes ── */}
      <Route
        path="/login"
        element={
          !isAuthenticated
            ? <Login />
            : <Navigate to="/admin/dashboard" replace />
        }
      />


      {/* ── Protected Admin Routes ── */}
      <Route
        path="/admin"
        element={
          isAuthenticated
            ? <Layout />
            : <Navigate to="/login" replace />
        }
      >
        {/* Default redirect */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Dashboard */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* User Management */}
        <Route path="requests" element={<ApproveReject />} />

        {/* User Full Profile — navigated from ApproveReject → handleViewFullProfile */}

        <Route path="profile/:userId" element={<ProfileDetails />} />

        {/* Admin's own profile — keep on a different path to avoid conflict */}
        <Route path="admin-profile" element={<AdminProfile />} />

        {/* Gallery */}
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="gallery/:userId" element={<GalleryPage />} />

        {/* Location */}
        <Route path="locations" element={<LocationManagement />} />

        {/* Religion */}
        <Route path="religion" element={<ReligionManagement />} />
        <Route path="religion/*" element={<ReligionManagement />} />

        {/* Education */}
        {/* <Route path="education" element={<EducationManagement />} /> */}

        {/* Sub Admins */}
        <Route path="sub-admins" element={<SubAdminManagement />} />
        {/* Plans */}
        <Route path="plans" element={<Plans />} />
        {/* Currency */}
        {/* <Route path="currency" element={<CurrencyManagement />} /> */}

        {/* Reports & Notifications */}
        <Route path="reports/*" element={<Reports />} />
        <Route path="notifications/*" element={<Notifications />} />

      </Route>

      {/* ── Catch-all ── */}
      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? "/admin/dashboard" : "/login"}
            replace
          />
        }
      />

    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}