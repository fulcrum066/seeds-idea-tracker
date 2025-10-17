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
import Nav from "./pages/navigation/Nav";
import AdminPanel from "./pages/admin/AdminPanel";

import React, { useState, useEffect } from "react";

const ROLES = {
  employee: "employee",
  qm: "qm",
  admin: "admin",
  pending: "pending",
  salesTeam: "sales-team",
};

function App() {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/observer/checkStatus");
        const data = await res.json();
        if (data == true ) {
          alert("A new Idea has been Submitted. Please check Admin Panel");
          await fetch("/api/observer/reset", { method: "POST" });
          // optionally refresh seeds list here
            
        }

        else{
          console.log("no changes")
        }

      } catch (err) {
        console.error("Failed to check observer status:", err);
      }
    }, 5000); // every 5s

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* -----------------------------------Public Routes----------------------------------- */}

          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="unauthorised" element={<Unauthorised />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
        {/* -----------------------------------Authenticated Routes----------------------------------- */}

        {/* -------------------Multiple Routes everyone------------------- */}

        <Route path="/forbidden" element={<Forbidden />} />

        <Route
          element={
            <RequireAuth
              allowedRoles={[
                ROLES.employee,
                ROLES.qm,
                ROLES.pending,
                ROLES.salesTeam,
                ROLES.admin,
                "User",
                "Admin"
              ]}
            />
          }
        >
          <Route path="dashboard" element={<HomePage />} />
          <Route path="*" element={<PageNotFound />} />
          <Route path="/dashboard/seed/" element={<SeedsHome />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

      </Routes>
    </>
  );
}

export default App;
