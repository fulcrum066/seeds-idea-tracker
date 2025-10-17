import React, { useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

const SettingsPanel = () => {
  const [textSize, setTextSize] = useState(16);

  const whiteBoxStyle = {
    width: "100%",
    backgroundColor: "white",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
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

  const cellStyle = {
    padding: "20px",
    textAlign: "center", 
    border: "none",
  };

  return (
    <div
      style={{
        backgroundColor: "#F2C776",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",   
        justifyContent: "center",
      }}
    >
      {/* BROWN BOX */}
      <div
        style={{
          backgroundColor: "#523629",
          padding: "20px",
          borderRadius: "10px",
          width: "80%",
          maxWidth: "800px",
        }}
      >
        {/* Title */}
        <h2 style={{ color: "white", marginBottom: "20px", textAlign: "center" }}>
          Accessibility Settings
        </h2>

        {/* WHITE BOX */}
        <div style={whiteBoxStyle}>
          <table style={tableStyle}>
            <tbody>

              <tr>
                <td style={{ ...cellStyle, width: "20%", fontWeight: "bold", fontSize: "18px" }}>
                  Text Size
                </td>
                <td style={{ ...cellStyle, width: "80%" }}>
                  <input
                    type="range"
                    min="10"
                    max="30"
                    value={textSize}
                    onChange={(e) => setTextSize(e.target.value)}
                    style={{
                      width: "250px",
                      appearance: "round",
                      height: "6px",
                      borderRadius: "5px",
                      background: "#ddd",
                      outline: "none",
                    }}
                  />

              <style>
              {`
                input[type="range"]::-webkit-slider-thumb {
                  appearance: none;
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  background: #523629;
                  cursor: pointer;
                }
                input[type="range"]::-moz-range-thumb {
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  background: #523629;
                  cursor: pointer;
                }
              `}
              </style>

                  <div>size: {textSize}px</div>
                </td>
              </tr>

              {/* Dark Mode */}
              <tr>
                <td style={{ ...cellStyle, fontWeight: "bold", fontSize: "18px" }}>
                  Dark Mode / Light Mode
                </td>
                <td style={cellStyle}>
                  <button style={{ ...iconButtonStyle, backgroundColor: "#3f3d44ff" }}><FaMoon /> Dark Mode </button>
                  <button style={{ ...iconButtonStyle, backgroundColor: "#cbcacfff" , color:"black"}}><FaSun /> Light Mode </button>
                </td>
              </tr>

            {/* Font */}
            <tr>
              <td style={{ ...cellStyle, fontWeight: "bold", fontSize: "18px" }}>
                Font
              </td>
              <td style={{ ...cellStyle }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <select style={{ padding: "5px", fontSize: "16px" }}>
                    <option value="Arial">Arial</option>
                    <option value="Verdana">Comic Sans</option>
                    <option value="Times New Roman">Times New Roman</option>
                  </select>
                </div>
              </td>
            </tr>


              {/* User Settings Heading */}
              <tr>
                <td colSpan="2" style={{ color:"white",backgroundColor:"#523629", ...cellStyle }}>
                  <h2 style={{ fontSize: "26px", fontWeight: "bold" }}>
                    User Settings
                  </h2>
                </td>
              </tr>

              {/* User Settings row */}
              <tr>
                <td style={{ ...cellStyle, fontWeight: "bold", fontSize: "18px" }}>
                  Username
                </td>
                <td style={cellStyle}>
                  Edit Username: <input></input>
                </td>
              </tr>
              {/* Password Row */}
              <tr>
                <td style={{ ...cellStyle, fontWeight: "bold", fontSize: "18px" }}>
                  Password
                </td>
                <td style={cellStyle}>
                  <div>
                    Old Password:
                    <input
                      type="password"
                      placeholder="Enter Current Password"
                    />
                  </div>
                  <div>
                    New Password:
                    <input
                      type="password"
                      placeholder="Enter New Password"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
