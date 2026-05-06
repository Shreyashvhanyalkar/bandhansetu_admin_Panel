// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import Login from "./pages/auth/login";
import Register from "./pages/auth/Register";
import Layout from "./pages/layout/Layout";
import Dashboard from "./pages/admin/Dashboard";
import ApproveReject from "./pages/admin/AproveReject";
import Reports from "./pages/admin/Reports";
import Notifications from "./pages/admin/Notifications";
import ReligionManagement from "./pages/admin/ReligionManagement";
import SubAdminManagement from "./pages/admin/SubAdminManagement";
import AdminProfile from "./pages/admin/profile";
import LocationManagement from "./pages/admin/LocationManagement";
import EducationManagement from "./pages/admin/EducationManagement";
import CurrencyManagement from "./pages/admin/CurrencyManagement";
import ProfileDetails from "./pages/admin/profileDetails"; // ← user profile view

// Uncomment as you enable these pages:
// import MaritalStatusManagement from "./pages/admin/MaritalStatusManagement";
// import IncomeManagement from "./pages/admin/IncomeManagement";
// import DietManagement from "./pages/admin/DietManagement";
// import BodySkinManagement from "./pages/admin/BodySkinManagement";
// import WorkingCategoryManagement from "./pages/admin/WorkingCategory";
// import MotherTongueManagement from "./pages/admin/MothertongueManagement";

export default function App() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>
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
        <Route
          path="/register"
          element={
            !isAuthenticated
              ? <Register />
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
          {/* navigate(`/admin/profile/${userId}`) in ApproveReject.jsx */}
          <Route path="profile/:userId" element={<ProfileDetails />} />

          {/* Admin's own profile — keep on a different path to avoid conflict */}
          <Route path="admin-profile" element={<AdminProfile />} />

          {/* Location */}
          <Route path="locations" element={<LocationManagement />} />

          {/* Religion */}
          <Route path="religion" element={<ReligionManagement />} />
          <Route path="religion/*" element={<ReligionManagement />} />

          {/* Education */}
          <Route path="education" element={<EducationManagement />} />

          {/* Sub Admins */}
          <Route path="sub-admins" element={<SubAdminManagement />} />

          {/* Currency */}
          <Route path="currency" element={<CurrencyManagement />} />

          {/* Reports & Notifications */}
          <Route path="reports/*" element={<Reports />} />
          <Route path="notifications/*" element={<Notifications />} />

          {/* Uncomment below as you enable each page: */}
          {/* <Route path="marital-status" element={<MaritalStatusManagement />} /> */}
          {/* <Route path="income"         element={<IncomeManagement />} /> */}
          {/* <Route path="diet"           element={<DietManagement />} /> */}
          {/* <Route path="body-skin"      element={<BodySkinManagement />} /> */}
          {/* <Route path="working-category" element={<WorkingCategoryManagement />} /> */}
          {/* <Route path="mothertongue"   element={<MotherTongueManagement />} /> */}
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
    </BrowserRouter>
  );
}