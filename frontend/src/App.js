import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

//components
import Login from "./components/Authenticate/Login";
import Logout from "./components/Authenticate/Logout";
import Register from "./components/Authenticate/Register";
import Layout from "./components/Layout/Layout";
import RequireAuth from "./components/Authenticate/RequireAuth";
import PageNotFound from "./components/Authenticate/PageNotFound";
import Unauthorised from "./components/Authenticate/Unauthorised";
import Forbidden from "./components/Authenticate/AccessDenied";
import HomePage from "./pages/home/HomePage";
//pages
import SeedsHome from "./pages/seeds/SeedsHome";

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
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* -----------------------------------Public Routes----------------------------------- */}

          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="unauthorised" element={<Unauthorised />} /> */}
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
        {/* -----------------------------------Authenticated Routes----------------------------------- */}

        {/* -------------------Multiple Routes everyone------------------- */}

        <Route
          element={
            <RequireAuth
              allowedRoles={[
                ROLES.employee,
                ROLES.qm,
                ROLES.pending,
                ROLES.salesTeam,
              ]}
            />
          }
        >
          <Route path="dashboard" element={<HomePage />} />
          <Route path="*" element={<PageNotFound />} />
          <Route path="/forbidden" element={<Forbidden />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
