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
import { Link } from "react-router-dom";
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

// ------- Deleting a Rejected Seed -------

function App() {
    // State for dialog box
  const [openNotification, setOpenNotification] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: "", body: "" });

  const notificationStyle = {
  position: "fixed",
  top: "20px",
  right: "20px",
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  minWidth: "300px",
  maxWidth: "500px",
  maxHeight: "300px",  
  overflowY: "auto",   
  zIndex: 9999,
  whiteSpace: "pre-line",
  animation: `${openNotification ? "slideInDown" : "fadeOutUp"} 0.3s ease-out`,
  transition: "opacity 0.3s ease-out",
  };
    
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
    if (newStatus == "rejected"){
      axios.delete(`/api/seeds/seed/${seedID}`, {headers: { Authorization: `Bearer ${token}` }})
    }

  } catch (error) {
    console.error("Failed to approve seed:", error);
  }
};

const [visible, setVisible] = useState(false);

const handleDismiss = () => {
  setOpenNotification(false);   // triggers fade-out animation
  setTimeout(() => setVisible(false), 300); // remove from DOM after animation ends
};

useEffect(() => {
  if (openNotification) setVisible(true); // ensure DOM is present for slide-in
}, [openNotification]);


  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);


useEffect(() => {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes slideInDown {
      0% {
        opacity: 0;
        transform: translateY(-20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeOutUp {
      0% {
        opacity: 1;
        transform: translateY(0);
      }
      100% {
        opacity: 0;
        transform: translateY(-20px);
      }
    }
  `;
  document.head.appendChild(style);
  return () => {
    document.head.removeChild(style);
  };
}, []);

  const handleNotification = (status) => {
    setOpenNotification(status);
  };

  const showNotification = (content) => {
  setDialogContent(content);
  setOpenNotification(true); // triggers slide-in
  setVisible(true);          // ensures DOM exists

  setTimeout(() => {
    setOpenNotification(false); // triggers fade-out
    setTimeout(() => setVisible(false), 300); // remove after animation
  }, 8000);
};

const newSeedNotification = (data) => {
  const content = {
    title: "A New Seed has Been Planted",
    subtitle: `${data[2]} submitted a new idea to ${data[4]}\n\n`,
    body: `Idea Name - ${data[1]}\nDescription - ${data[3]}\nMetric Score - ${data[5]}\nPriority - ${data[7]}`,
  };

  if (document.visibilityState === "hidden") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg) {
            reg.showNotification(content.title, {
              body: content.subtitle + content.body,
              actions: [
                { action: "view", title: "View" },
                { action: "approve", title: "Approve" },
              ],
              data: {
                id: data[6], 
                token: token,
              },
            });
          }
        });
      }
    });
  } else {
    showNotification(content); // pass the content object
  }
};

  const [seedID, setSeedID] = useState('');
  useEffect(() => {
  const interval = setInterval(async () => {
    try {
      const res = await fetch("/api/observer/checkStatus");
      const data = await res.json();
      console.log(data)
      if (data[0] == true ) {
        await fetch("/api/observer/reset", { method: "POST" });
        newSeedNotification(data)
        setSeedID(data[6])
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

      {visible && (
        <div
          style={{
            ...notificationStyle,
            animation: `${openNotification ? "slideInDown" : "fadeOutUp"} 0.3s ease-out`,
          }}
        >
          <div>
            <button
              onClick={handleDismiss}
              style={{
                position: "absolute",
                top: "20px",
                right: "8px",
                paddingRight: "14px", 
                paddingTop: "3px",
                background: "transparent",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
                color: "#555",
              }}
            >
              Dismiss
            </button>

            <h3>{dialogContent.title}</h3>
            {dialogContent.subtitle && <b>{dialogContent.subtitle}</b>}
            <p>{dialogContent.body}</p>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "5px", marginTop: "10px" }}>
            <Link to="/admin">
              <button onClick={() => handleDismiss()} style={styles.iconButton("#b9b9b9ff")}>View</button>
            </Link>
            <button onClick={async () => { handleSeedUpdate(seedID, "approved"); handleDismiss();}} style={styles.iconButton("#86E63C")}>
              <FaCheck />
            </button>
            <button onClick={async () => { handleSeedUpdate(seedID, "rejected"); handleDismiss();}} style={styles.iconButton("#D34D4D")}>
              <FaTimes />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
