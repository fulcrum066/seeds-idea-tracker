import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
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
import UserHomePage from "./pages/dashboard/HomePage";
//pages
import SeedsHome from "./pages/seeds/SeedsHome";
import Nav from "./pages/navigation/Nav";
import AdminPanel from "./pages/admin/AdminPanel";

//service workers
import { useEffect, useState } from "react";

import { getSeeds, createSeed, updateSeeds, deleteSeeds, modifySeed, toggleFavorite, addComment, deleteComment } from "./features/seed/seedSlice";
import { FaCheck, FaEdit, FaTimes } from "react-icons/fa";
import axios from "axios";

const ROLES = {
  employee: "employee",
  qm: "qm",
  admin: "admin",
  pending: "pending",
  salesTeam: "sales-team",
};

const styles = { 
  iconButton: (bg) => ({ padding: "8px", marginRight: "5px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "16px", color: "#fff", backgroundColor: bg }),
}

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const token = user?.token;

  // ------- Updating a Seed Status ---------
  const updateSeed = async (seedID, updateData, token) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // if you use JWT
        },
      };

      const { data } = await axios.put(`/api/seeds/seed/${seedID}`, updateData, config);
      return data; // updated seed object
    } catch (error) {
      console.error("Failed to update seed:", error.response?.data || error.message);
      throw error;
    }
  };

const handleSeedUpdate = async (seedID, newStatus) => {
  try {
    const updated = await updateSeed(seedID, { status: newStatus }, token);
    console.log("Seed updated:", updated);

  } catch (error) {
    console.error("Failed to approve seed:", error);
  }
};

  // State for dialog box
  const [openNotification, setOpenNotification] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: "", body: "" });

  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  const handleNotification = (status) => {
    setOpenNotification(status);
  };

  const newSeedNotification = (data) => {
    if (document.visibilityState === "hidden") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          navigator.serviceWorker.getRegistration().then((reg) => {
            if (reg) {
              // Show native notification
              reg.showNotification(`A New Seed has Been Planted`, {
                body: `${data[2]} submitted a new idea to ${data[4]}\n\nIdea Name - ${data[1]}\nDescription - ${data[3]}\nMetric Score - ${data[5]}`,
                //icon: "/dashboard_images/Background.png",
                actions: [
                  { action: "view", title: "View" },
                  { action: "approve", title: "Approve" },
                  { action: "reject", title: "Reject" },
                ],
              });
            } else {
              console.log("Service worker not registered.");
            }
          });
        }
      });
    } else {
        // Also open dialog box in-app
        setDialogContent({
          title: `A New Seed has Been Planted`,
          body: `${data[2]} submitted a new idea to ${data[4]}\n\nIdea Name - ${data[1]}\nDescription - ${data[3]}\nMetric Score - ${data[5]}`,
        });
        setOpenNotification(true);
    }
  };

  const seedID = '';
  useEffect(() => {
  const interval = setInterval(async () => {
    try {
      const res = await fetch("/api/observer/checkStatus");
      const data = await res.json();
      console.log(data)
      if (data[0] == true ) {
        newSeedNotification(data)
        seedID = data[6]
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
          <Route path="/userHomepage" element={<UserHomePage/>} />
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
          <Route path="dashboard" element={
              <div style={{ width: '100vw', height: '100vh', overflow: 'auto' }}>
                <UserHomePage />
              </div>
            }/>
          <Route path="*" element={<PageNotFound />} />
          <Route path="/dashboard/seed/" element={<SeedsHome />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

      </Routes>

      {/* Dialog box */}
      {openNotification && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              minWidth: "300px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
              whiteSpace: "pre-line", // preserve line breaks
            }}
          >
            <h2>{dialogContent.title}</h2>
            <p>{dialogContent.body}</p>
            <table>
              <tr>
                <td>
                  <button onClick={() => handleSeedUpdate(seedID, "approved")} style={styles.iconButton("#86E63C")}><FaCheck /></button>
                  <button onClick={() => handleSeedUpdate(seedID, "rejected")} style={styles.iconButton("#D34D4D")}><FaTimes /></button>
                </td>
              </tr>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
