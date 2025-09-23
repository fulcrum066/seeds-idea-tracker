import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaCheck, FaEdit, FaTimes } from "react-icons/fa";
import authService from "../../features/auth/authService";
import {
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard,
} from "../../features/board/boardService";
import {
  getUser,
  updateUser,
} from "../../features/auth/authSlice";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BoardCreate from "../../components/BoardCreate/BoardCreate";

const AdminPanel = () => {
  const [activeSection, setActiveSection] = useState("ideas");
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const token = user?.token;

  // dialog + form state
  const [openPopup, setOpenPopup] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [boardFormData, setBoardFormData] = useState({}); // receives { projectName, weight1..7 } from BoardCreate

  // boards for dropdown 
  const [boards, setBoards] = useState([]);
  const [boardsLoading, setBoardsLoading] = useState(false);
  const [boardsError, setBoardsError] = useState("");
  const [selectedBoardId, setSelectedBoardId] = useState("");

  const [emailInput, setEmailInput] = useState("");

  const refreshBoards = async () => {
    try {
      setBoardsLoading(true);
      const list = await getBoards(token);
      const safe = Array.isArray(list) ? list : [];
      setBoards(safe);
      if (safe.length && !selectedBoardId) {
        setSelectedBoardId(safe[0]._id || safe[0].id);
      }
    } catch (e) {
      setBoardsError(e?.response?.data?.message || e.message || "Failed to load boards");
    } finally {
      setBoardsLoading(false);
    }
  };

  const handleAddUserToBoard = async (boardId) => {
    try {
      if (!emailInput) return alert("Please enter an email.");

      // fetch user ID by email
      const userData = await authService.getUserByEmail(emailInput.trim(), token);
      if (!userData || !userData._id) return alert("User not found");

      const userId = userData._id;

      const board = boards.find((b) => b._id === boardId);
      if (!board) return alert("Board not found");

      if (board.users?.includes(userId)) {
        return alert("User already in board");
      }

      const updatedUsers = [...(board.users || []), userId];

      await updateBoard(token, boardId, { ...board, users: updatedUsers });

      // Optional: update the user record if you track boards
      // await updateUser(token, { ...userData, boards: [...(userData.boards || []), boardId] });

      await refreshBoards();
      alert("User added to board!");
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Failed to add user");
    }
  };

  const handleRemoveUserFromBoard = async (boardId) => {
    try {
      if (!emailInput) return alert("Please enter an email.");

      // fetch user ID by email
      const userData = await authService.getUserByEmail(emailInput.trim(), token);
      if (!userData || !userData._id) return alert("User not found");

      const userId = userData._id;

      const board = boards.find((b) => b._id === boardId);
      if (!board) return alert("Board not found");

      if (!board.users?.includes(userId)) {
        return alert("User is not in this board");
      }

      const updatedUsers = board.users.filter((id) => id !== userId);

      await updateBoard(token, boardId, { ...board, users: updatedUsers });

      await refreshBoards();
      alert("User removed from board!");
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Failed to remove user");
    }
  };

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const list = await authService.getUser(token); // <-- uses the one you already have
        setUsers(Array.isArray(list) ? list : []);
      } catch (err) {
        setUsersError(err?.response?.data?.message || err.message || "Failed to load users");
      } finally {
        setUsersLoading(false);
      }
    };

    if (token) fetchUsers();
  }, [token]);



  useEffect(() => {
    refreshBoards();
  }, [token]);

  const handleOpenPopup = () => {
    setEditingBoard(null);
    setBoardFormData({});
    setOpenPopup(true);
  };

  const handleEditBoard = (board) => {
    setEditingBoard(board);
    setBoardFormData({
      // keep keys aligned with BoardCreate's effect output
      projectName: board?.name || "",
      weight1: board?.weight1 ?? "",
      weight2: board?.weight2 ?? "",
      weight3: board?.weight3 ?? "",
      weight4: board?.weight4 ?? "",
      weight5: board?.weight5 ?? "",
      weight6: board?.weight6 ?? "",
      weight7: board?.weight7 ?? "",
    });
    setOpenPopup(true);
  };

  const handleClosePopup = () => {
    setOpenPopup(false);
    setEditingBoard(null);
    setBoardFormData({});
  };

  const handleCreateBoard = async (payload) => {
    await createBoard(token, payload);
    await refreshBoards();
    // only if you need to refresh user profile
    dispatch(getUser());
  };

  const handleSaveFromDialog = async () => {
    const cleanName = (boardFormData.projectName || "").trim();
    if (!cleanName) {
      alert("Please enter a name for your project board.");
      return;
    }

    const payload = {
      projectName: cleanName,
      creatorName: user?._id || null,
      creatorEmail: user?.email || "",
      weight1: boardFormData.weight1 ?? "",
      weight2: boardFormData.weight2 ?? "",
      weight3: boardFormData.weight3 ?? "",
      weight4: boardFormData.weight4 ?? "",
      weight5: boardFormData.weight5 ?? "",
      weight6: boardFormData.weight6 ?? "",
      weight7: boardFormData.weight7 ?? "",
    };

    try {
      if (editingBoard) {
        const id = editingBoard._id || editingBoard.id;
        await updateBoard(token, id, payload);  // PUT
      } else {
        await handleCreateBoard(payload);       // POST
      }
      await refreshBoards();
      handleClosePopup();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Failed to save board");
    }
  };

  // ---------- styles ----------
  const tableStyle = {
    width: "100%",
    padding: "40px 20px",
    backgroundColor: "white",
    border: "2px solid black",
    borderCollapse: "collapse",
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
    color: "#ffffffff",
  };
  const tdStyle = { padding: "12px 16px", verticalAlign: "top" };
  const viewButton = {
    padding: "10px 40px",
    border: "0px",
    borderRadius: "50px",
    backgroundColor: "rgba(123, 186, 13, 0.2)",
    cursor: "pointer",
    fontSize: "14px",
    margin: "4px",
  };
  const topBarStyle = {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    backgroundColor: "#F2C776",
    borderBottom: "2px solid #523629",
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };
  const selectStyle = {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "2px solid #523629",
    backgroundColor: "white",
    fontSize: "14px",
    cursor: "pointer",
  };
  const floatingButtonStyle = {
    position: "fixed",
    left: "20px",
    bottom: "20px",
    padding: "12px 18px",
    backgroundColor: "#94B570",
    color: "white",
    border: "none",
    borderRadius: "999px",
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
    zIndex: 1100,
  };

  const inputStyle = {
    padding: "12px 16px",
    borderRadius: "8px",
    border: "2px solid #523629",
    fontSize: "14px",
    flex: 1,
    marginRight: "10px",
  };

  const addButtonStyle = {
    padding: "12px 20px",
    backgroundColor: "#5bc84a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginRight: "10px",
  };

  const removeButtonStyle = {
    padding: "12px 20px",
    backgroundColor: "#c84a4a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  };

  const renderContent = () => {
    if (activeSection === "ideas") {
      return (
        <div>
          <h2 style={{ marginBottom: "10px" }}>Manage Ideas</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={tdStyle}><b>Test Seed 1</b></td>
                <td style={tdStyle}>31/08/2025</td>
                <td style={{ ...tdStyle, color: "#EEB64E" }}><b>pending...</b></td>
                <td style={tdStyle}><button style={viewButton}>View</button></td>
                <td style={tdStyle}>
                  <button style={{ ...iconButtonStyle, backgroundColor: "#86E63C" }} aria-label="Approve"><FaCheck /></button>
                  <button style={{ ...iconButtonStyle, backgroundColor: "#EEB64E" }} aria-label="Edit"><FaEdit /></button>
                  <button style={{ ...iconButtonStyle, backgroundColor: "#D34D4D" }} aria-label="Reject"><FaTimes /></button>
                </td>
              </tr>
              <tr>
                <td style={tdStyle}><b>Test Seed 2</b></td>
                <td style={tdStyle}>01/09/2025</td>
                <td style={{ ...tdStyle, color: "#6beb45ff" }}><b>approved!</b></td>
                <td style={tdStyle}><button style={viewButton}>View</button></td>
                <td style={tdStyle}>
                  <button style={{ ...iconButtonStyle, backgroundColor: "#86E63C" }} aria-label="Approve"><FaCheck /></button>
                  <button style={{ ...iconButtonStyle, backgroundColor: "#EEB64E" }} aria-label="Edit"><FaEdit /></button>
                  <button style={{ ...iconButtonStyle, backgroundColor: "#D34D4D" }} aria-label="Reject"><FaTimes /></button>
                </td>
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
              {usersLoading ? (
                <tr><td colSpan="4">Loading...</td></tr>
              ) : usersError ? (
                <tr><td colSpan="4" style={{ color: "red" }}>{usersError}</td></tr>
              ) : selectedBoardId ? (
                // Find the board
                boards.find((b) => b._id === selectedBoardId)?.users?.map((userId) => {
                  const u = users.find((x) => x._id === userId);
                  if (!u) return null; // skip if user not found
                  return (
                    <tr key={u._id}>
                      <td>{u.firstName} {u.lastName}</td>
                      <td>{u.email}</td>
                      <td>{u.roles?.join(", ") || "User"}</td>
                      <td>
                        <button
                          style={{ ...viewButton, backgroundColor: "rgba(239, 200, 23, 0.2)" }}
                          onClick={() => console.log("Edit user:", u._id)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="4">No board selected</td></tr>
              )}
            </tbody>

          </table>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "15px",
            }}
          >

            <input
              type="email"
              placeholder="Enter user email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              style={inputStyle}
            />

            <button
              onClick={() => handleAddUserToBoard(selectedBoardId)}
              style={addButtonStyle}
            >
              Add User
            </button>

            <button
              onClick={() => handleRemoveUserFromBoard(selectedBoardId)}
              style={removeButtonStyle}
            >
              Remove User
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ backgroundColor: "#F2C776", padding: "100px", minHeight: "100vh" }}>
      {/* top of page dropdown bar */}
      <div style={topBarStyle}>
        <div style={{ fontWeight: 700, color: "#523629" }}>Admin Panel</div>
        <label style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ color: "#523629", fontWeight: 600 }}>Select Project Board:</span>
          <select
            aria-label="Select Project Board"
            style={selectStyle}
            value={selectedBoardId}
            onChange={(e) => setSelectedBoardId(e.target.value)}
          >
            <option value="">-- Select a board --</option>
            {boards.map((board) => (
              <option key={board._id} value={board._id}>
                {board.projectName}
              </option>
            ))}
          </select>

        </label>
      </div>

      {/* Brown box */}
      <div style={{ backgroundColor: "#523629", padding: "20px", borderRadius: "10px", marginTop: "16px" }}>
        <table style={tableStyle}>
          <tbody>
            <tr>
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
                    backgroundColor: activeSection === "ideas" ? "#94B570" : "#999",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Manage Ideas
                </button>
                <button
                  onClick={() => setActiveSection("users")}
                  style={{
                    display: "block",
                    padding: "10px",
                    width: "100%",
                    border: "none",
                    borderRadius: "50px",
                    backgroundColor: activeSection === "users" ? "#94B570" : "#999",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Manage Users
                </button>
              </td>
              <td style={{ ...tdStyle, width: "80%" }}>
                {boardsError ? (
                  <div style={{ color: "white" }}>Error: {boardsError}</div>
                ) : (
                  renderContent()
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Create board button */}
      <button style={floatingButtonStyle} aria-label="Create Project Board" onClick={handleOpenPopup}>
        Create Project Board
      </button>

      {/* Create/Edit dialog */}
      <Dialog open={openPopup} onClose={handleClosePopup} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingBoard ? "Edit Board" : "Create New Board"}
          <IconButton aria-label="close" onClick={handleClosePopup} sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <BoardCreate setFormData={setBoardFormData} user={user} />
        </DialogContent>

        <DialogActions>
          <Button variant="contained" color="primary" onClick={handleSaveFromDialog}>
            {editingBoard ? "Update Board" : "Save & Exit"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
