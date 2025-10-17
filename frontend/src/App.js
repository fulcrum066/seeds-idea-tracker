import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// components
import Login from "./components/Authenticate/Login";
import Logout from "./components/Authenticate/Logout";
import Register from "./components/Authenticate/Register";
import Layout from "./components/Layout/Layout";
import RequireAuth from "./components/Authenticate/RequireAuth";
import PageNotFound from "./components/Authenticate/PageNotFound";
import Unauthorised from "./components/Authenticate/Unauthorised";
import Forbidden from "./components/Authenticate/AccessDenied";

// pages
import HomePage from "./pages/home/HomePage";
import UserHomePage from "./pages/dashboard/HomePage";
import SeedsHome from "./pages/seeds/SeedsHome";
import TaskTracking from "./pages/seeds/TaskTracking";
import AdminPanel from "./pages/admin/AdminPanel";
import UpdateAccountPrivileges from "./components/Pending/UpdateAccountPrivileges";

const ROLES = {
  employee: "employee",
  qm: "qm",
  admin: "admin",
  pending: "pending",
  salesTeam: "sales-team",
};

function App() {
  return (
    <>
      <ToastContainer />

      <Routes>
        {/* ---------- Public under shared layout ---------- */}
        <Route path="/" element={<Layout />}>
          {/* Default route = index */}
          <Route index element={<Login />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="unauthorised" element={<Unauthorised />} />
          <Route path="logout" element={<Logout />} />

          {/* Public informational pages */}
          <Route path="pending" element={<UpdateAccountPrivileges />} />
          <Route path="userHomepage" element={<UserHomePage />} />

          {/* 404 for anything unmatched under Layout */}
          <Route path="*" element={<PageNotFound />} />
        </Route>

        {/* ---------- Common auth-only area (non-pending) ---------- */}
        <Route
          element={
            <RequireAuth
              allowedRoles={[
                ROLES.employee,
                ROLES.qm,
                ROLES.salesTeam,
                ROLES.admin,
              ]}
            />
          }
        >
          <Route path="/dashboard" element={
            <div style={{ width: '100vw', height: '100vh', overflow: 'auto' }}>
              <UserHomePage />
            </div>
          } />
          <Route path="/dashboard/seed" element={<SeedsHome />} />
          <Route path="/time-tracking" element={<TaskTracking />} />
        </Route>

        {/* ---------- Admin-only ---------- */}
        <Route element={<RequireAuth allowedRoles={[ROLES.admin]} />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

        {/* ---------- Global misc ---------- */}
        <Route path="/forbidden" element={<Forbidden />} />
      </Routes>
    </>
  );
}

export default App;
