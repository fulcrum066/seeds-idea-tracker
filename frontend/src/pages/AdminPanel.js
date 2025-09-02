import React, { useState } from "react";
import { FaCheck, FaEdit, FaTimes } from "react-icons/fa";

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState("ideas"); // default view

  const tableStyle = {
    width: "100%",
   padding: "40px 20px",
    backgroundColor: "white",
    border: "2px solid black",
  };

  const thStyle = {
    border: "1px",
    padding: "10px",
    backgroundColor: "#f0f0f0",
    textAlign: "left",
  };
  const iconButtonStyle = {
  padding: "8px",
  marginRight: "5px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "16px",
  color:"#ffffffff",
};


  const tdStyle = {

    padding: "10px",
    verticalAlign: "top",
  };

  const viewButton = {
  padding: "10px 40px",
  border: "0px",
  borderRadius: "50px",
  backgroundColor: "rgba(123, 186, 13, 0.2)",
  cursor: "pointer",
  fontSize: "14px",
};


  const renderContent = () => {
    if (activeSection === "ideas") {
      return (
        <div>
          {/* Section heading */}
          <h2 style={{ marginBottom: "10px" }}>Manage Ideas</h2>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={tdStyle}><b>Test Seed 1</b></td>
                <td style={tdStyle}>31/08/2025</td>
                <td style={{ ...tdStyle, color: "#EEB64E" }}><b>pending...</b></td>
                <td style={tdStyle}>
                  <button style={viewButton}>View</button>
                </td>
                <td style={tdStyle}>
                <button style={{ ...iconButtonStyle, backgroundColor: "#86E63C" }}><FaCheck /></button>
                <button style={{ ...iconButtonStyle, backgroundColor: "#EEB64E" }}><FaEdit /></button>
                <button style={{ ...iconButtonStyle, backgroundColor: "#D34D4D" }}><FaTimes /></button>
                </td>

              </tr>
              <tr>
                <td style={tdStyle}><b>Test Seed 2</b></td>
                <td style={tdStyle}>01/09/2025</td>
                <td style={{ ...tdStyle, color: "#6beb45ff" }}><b>approved!</b></td>
                <td style={tdStyle}>
                  <button style={viewButton}>View</button>
                </td>
                <button style={{ ...iconButtonStyle, backgroundColor: "#86E63C" }}><FaCheck /></button>
                <button style={{ ...iconButtonStyle, backgroundColor: "#EEB64E" }}><FaEdit /></button>
                <button style={{ ...iconButtonStyle, backgroundColor: "#D34D4D" }}><FaTimes /></button>
              </tr>
            </tbody>
          </table>
        </div>
      );
    } else if (activeSection === "users") {
      return (
        <div>
          {/* Section heading */}
          <h2 style={{ marginBottom: "10px" }}>Manage Users</h2>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdStyle}>John Smith</td>
                <td style={tdStyle}>johnsmith@gmail.com</td>
                <td style={tdStyle}>Admin</td>
                <td style={tdStyle}>
                   <button style={{...viewButton, backgroundColor: "rgba(239, 200, 23, 0.2)" }}>Edit</button>
                </td>
              </tr>
              <tr>
                <td style={tdStyle}>Jane Smith</td>
                <td style={tdStyle}>janesmith@yahoo.com</td>
                <td style={tdStyle}>User</td>
                <td style={tdStyle}>
                  <button style={{...viewButton, backgroundColor: "rgba(239, 200, 23, 0.2)" }}>Edit</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "15px",
            }}
          >
            <button
              style={{
                padding: "10px 20px",
                backgroundColor: "#5bc84a",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Invite User
            </button>

            <button
              style={{
                padding: "10px 20px",
                backgroundColor: "#c84a4a",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Remove User
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#F2C776",
        padding: "100px",
        minHeight: "100vh",
      }}
    >
      {/* BROWN BOX */}
      <div
        style={{
          backgroundColor: "#523629",
          padding: "20px",
          borderRadius: "10px",
          
        }}
      >
        <table style={tableStyle}>
          <tbody>
            <tr>
              {/* Section 1 (sidebar) */}
              <td style={{ ...tdStyle, width: "20%" }}>
                <button
                  onClick={() => setActiveSection("ideas")}
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    padding: "10px",
                    width: "100%",
                    border: "none",
                    borderRadius: "50px",
                    backgroundColor:
                      activeSection === "ideas" ? "#94B570" : "#999",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Ideas
                </button>
                <button
                  onClick={() => setActiveSection("users")}
                  style={{
                    display: "block",
                    padding: "10px",
                    width: "100%",
                    border: "none",
                    borderRadius: "50px",
                    backgroundColor:
                      activeSection === "users" ? "#94B570" : "#999",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Users
                </button>
              </td>

              <td style={{ ...tdStyle, width: "80%" }}>{renderContent()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
