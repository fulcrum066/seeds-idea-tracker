import React, { useState, useEffect, useCallback } from "react";
import "../../styles/HomePageStyle.css";
import { useSelector, useDispatch } from "react-redux";
import { FaCheck, FaEdit, FaTimes } from "react-icons/fa";
import authService from "../../features/auth/authService";
import TopBar from "../../components/Navigation/NavBar";
import { getBoards, createBoard, updateBoard } from "../../features/board/boardService";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BoardCreate from "../../components/BoardCreate/BoardCreate";

// ---------- Style ----------
const styles = {
  container: { backgroundColor: "#F2C776", padding: "100px", minHeight: "100vh" },
  topBar: {
    position: "sticky",
    top: 0,
    zIndex: 1000,
    backgroundColor: "#F2C776",
    borderBottom: "2px solid #523629",
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionButton: (active) => ({
    display: "block",
    padding: "10px",
    width: "100%",
    border: "none",
    borderRadius: "50px",
    backgroundColor: active ? "#94B570" : "#999",
    color: "white",
    cursor: "pointer",
    marginBottom: "10px",
  }),
  floatingButton: {
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
  },
  table: { width: "100%", padding: "40px 20px", backgroundColor: "white", border: "2px solid black", borderCollapse: "collapse" },
  th: { border: "1px", padding: "10px", backgroundColor: "#f0f0f0", textAlign: "left" },
  td: { padding: "12px 16px", verticalAlign: "top" },
  viewButton: { padding: "10px 40px", border: "0px", borderRadius: "50px", backgroundColor: "rgba(123, 186, 13, 0.2)", cursor: "pointer", fontSize: "14px", margin: "4px" },
  input: { padding: "12px 16px", borderRadius: "8px", border: "2px solid #523629", fontSize: "14px", flex: 1, marginRight: "10px" },
  addButton: { padding: "12px 20px", backgroundColor: "#5bc84a", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", marginRight: "10px" },
  removeButton: { padding: "12px 20px", backgroundColor: "#c84a4a", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" },
  iconButton: (bg) => ({ padding: "8px", marginRight: "5px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "16px", color: "#fff", backgroundColor: bg }),
};

// ---------- helpers ----------
const idOf = (x) => String(typeof x === "string" ? x : x?._id);
const toId = (x) => {
  if (!x) return "";
  if (typeof x === "string") return x;
  if (x._id) return String(x._id);
  try { return String(x); } catch { return ""; }
};
const uniq = (arr) => Array.from(new Set(arr.map(String)));

const AdminPanel = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const token = user?.token;

  // ---------- State ----------
  const [activeSection, setActiveSection] = useState("ideas");

  const [boards, setBoards] = useState([]);
  const [boardsLoading, setBoardsLoading] = useState(false);
  const [boardsError, setBoardsError] = useState("");
  const [selectedBoardId, setSelectedBoardId] = useState("");

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  const [emailInput, setEmailInput] = useState("");

  const [openPopup, setOpenPopup] = useState(false);
  const [editingBoard, setEditingBoard] = useState(null);
  const [boardFormData, setBoardFormData] = useState({});

  // ---------- Board fetching ----------
  const refreshBoards = useCallback(async () => {
    try {
      setBoardsLoading(true);
      const list = await getBoards(token);
      const safe = Array.isArray(list) ? list : [];
      setBoards(safe);
      if (safe.length && !selectedBoardId) setSelectedBoardId(safe[0]._id || safe[0].id);
    } catch (e) {
      setBoardsError(e?.response?.data?.message || e.message || "Failed to load boards");
    } finally {
      setBoardsLoading(false);
    }
  }, [token, selectedBoardId]);

  useEffect(() => { if (token) refreshBoards(); }, [token, refreshBoards]);

  // ---------- User fetching ----------
  const refreshUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const list = await authService.getUser(token); // returns ALL users (with boards)
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      setUsersError(err?.response?.data?.message || err.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  }, [token]);

  useEffect(() => { if (token) refreshUsers(); }, [token, refreshUsers]);

  // Helper: get CURRENT boards for a userId (from state; if missing, fetch once)
  const getCurrentBoardsForUser = useCallback(
    async (userId) => {
      const local = users.find((u) => String(u._id) === String(userId));
      if (local) return (local.boards || []).map(toId).filter(Boolean);

      // Fallback: one-time fresh fetch (avoid state race)
      const fresh = await authService.getUser(token);
      const match = Array.isArray(fresh) ? fresh.find((u) => String(u._id) === String(userId)) : null;
      return (match?.boards || []).map(toId).filter(Boolean);
    },
    [users, token]
  );

  // ---------- TWO-SIDED ADD ----------
  const addUserTwoSided = async (boardId) => {
    if (!emailInput) return alert("Please enter an email.");
    if (!boardId) return alert("Please select a board.");
    const email = emailInput.trim();

    try {
      // 1) Resolve user ID by email (this endpoint returns ONLY {_id})
      const light = await authService.getUserByEmail(email, token);
      const userId = idOf(light);
      if (!userId) return alert("User not found.");

      const board = boards.find((b) => idOf(b._id) === String(boardId));
      if (!board) return alert("Board not found.");

      // 2) Update BOARD.users (idempotent)
      const prevBoardUserIds = (board.users || []).map(idOf);
      if (prevBoardUserIds.includes(userId)) {
        alert("User is already on this board.");
        return;
      }
      const nextBoardUserIds = uniq([...prevBoardUserIds, userId]);
      await updateBoard(token, boardId, { ...board, users: nextBoardUserIds });

      // 3) Update USER.boards using the REAL current boards (not the light response)
      const prevUserBoards = await getCurrentBoardsForUser(userId);
      const nextUserBoards = uniq([...prevUserBoards, String(boardId)]);

      try {
        await authService.updateUser({ _id: userId, boards: nextUserBoards }, token);
      } catch (userErr) {
        // rollback board change if user update fails
        await updateBoard(token, boardId, { ...board, users: prevBoardUserIds });
        throw userErr;
      }

      await Promise.all([refreshBoards(), refreshUsers()]);
      alert("User added to board and board added to user.");
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Failed to add user.");
    }
  };

  // ---------- TWO-SIDED REMOVE ----------
  const removeUserTwoSided = async (boardId) => {
    if (!emailInput) return alert("Please enter an email.");
    if (!boardId) return alert("Please select a board.");
    const email = emailInput.trim();

    try {
      // 1) Resolve user ID by email (light response)
      const light = await authService.getUserByEmail(email, token);
      const userId = idOf(light);
      if (!userId) return alert("User not found.");

      const board = boards.find((b) => idOf(b._id) === String(boardId));
      if (!board) return alert("Board not found.");

      // 2) Update BOARD.users
      const prevBoardUserIds = (board.users || []).map(idOf);
      if (!prevBoardUserIds.includes(userId)) {
        alert("User is not currently on this board.");
        return;
      }
      const nextBoardUserIds = prevBoardUserIds.filter((id) => id !== userId);
      await updateBoard(token, boardId, { ...board, users: nextBoardUserIds });

      // 3) Update USER.boards from real current boards
      const prevUserBoards = await getCurrentBoardsForUser(userId);
      const nextUserBoards = prevUserBoards.filter((id) => id !== String(boardId));

      try {
        await authService.updateUser({ _id: userId, boards: nextUserBoards }, token);
      } catch (userErr) {
        // rollback board change if user update fails
        await updateBoard(token, boardId, { ...board, users: prevBoardUserIds });
        throw userErr;
      }

      await Promise.all([refreshBoards(), refreshUsers()]);
      alert("User removed from board and board removed from user.");
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Failed to remove user.");
    }
  };

  // ---------- Board Dialog ----------
  const handleOpenPopup = (board = null) => {
    setEditingBoard(board);
    setBoardFormData(
      board
        ? {
            projectName: board.name || "",
            weight1: board.weight1 ?? "",
            weight2: board.weight2 ?? "",
            weight3: board.weight3 ?? "",
            weight4: board.weight4 ?? "",
            weight5: board.weight5 ?? "",
            weight6: board.weight6 ?? "",
            weight7: board.weight7 ?? "",
          }
        : {}
    );
    setOpenPopup(true);
  };

  const handleSaveBoard = async () => {
    const name = (boardFormData.projectName || "").trim();
    if (!name) return alert("Please enter a name for your project board.");

    const payload = {
      projectName: name,
      creatorName: user?._id || null,
      creatorEmail: user?.email || "",
      ...boardFormData,
    };

    try {
      if (editingBoard) await updateBoard(token, editingBoard._id || editingBoard.id, payload);
      else await createBoard(token, payload);
      await refreshBoards();
      setOpenPopup(false);
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Failed to save board");
    }
  };

  // ---------- Render helpers ----------
  const renderIdeasSection = () => (
    <div>
      <h2 style={{ marginBottom: "10px" }}>Manage Ideas</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {["Test Seed 1", "Test Seed 2"].map((seed, idx) => (
            <tr key={idx}>
              <td style={styles.td}><b>{seed}</b></td>
              <td style={styles.td}>31/08/2025</td>
              <td style={{ ...styles.td, color: idx === 0 ? "#EEB64E" : "#6beb45ff" }}>
                <b>{idx === 0 ? "pending..." : "approved!"}</b>
              </td>
              <td style={styles.td}><button style={styles.viewButton}>View</button></td>
              <td style={styles.td}>
                <button style={styles.iconButton("#86E63C")}><FaCheck /></button>
                <button style={styles.iconButton("#EEB64E")}><FaEdit /></button>
                <button style={styles.iconButton("#D34D4D")}><FaTimes /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderUsersSection = () => {
    const board = boards.find((b) => String(b._id) === String(selectedBoardId));

    const rows = (board?.users || [])
      .map((entry) => {
        const u =
          typeof entry === "string"
            ? users.find((x) => String(x._id) === String(entry))
            : entry;

        if (!u) return null;
        return (
          <tr key={u._id}>
            <td>
              {(u.firstName ?? u.name?.split(" ")?.[0] ?? "")}{" "}
              {(u.lastName ?? u.name?.split(" ")?.slice(1).join(" ") ?? "")}
            </td>
            <td>{u.email}</td>
            <td>{Array.isArray(u.roles) ? u.roles.join(", ") : "User"}</td>
            <td>
              <button
                style={{ ...styles.viewButton, backgroundColor: "rgba(239,200,23,0.2)" }}
              >
                Edit
              </button>
            </td>
          </tr>
        );
      })
      .filter(Boolean);

    return (
      <div>
        <h2 style={{ marginBottom: "10px" }}>Manage Users</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {usersLoading && <tr><td colSpan="4">Loading...</td></tr>}
            {!usersLoading && usersError && (
              <tr><td colSpan="4" style={{ color: "red" }}>{usersError}</td></tr>
            )}
            {!usersLoading && !usersError && (!board || (board.users || []).length === 0) && (
              <tr><td colSpan="4">No users in this board</td></tr>
            )}
            {!usersLoading && !usersError && rows}
          </tbody>
        </table>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 15 }}>
          <input
            type="email"
            placeholder="Enter user email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            style={styles.input}
          />
          <button
            style={styles.addButton}
            onClick={() => addUserTwoSided(selectedBoardId)}
            title="Adds user to Board.users and adds board to User.boards (with rollback on error)"
          >
            Add User
          </button>
          <button
            style={styles.removeButton}
            onClick={() => removeUserTwoSided(selectedBoardId)}
            title="Removes user from Board.users and removes board from User.boards (with rollback on error)"
          >
            Remove User
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <TopBar />
      <div style={styles.container}>
        <div style={styles.topBar}>
          <div style={{ fontWeight: 700, color: "#523629" }}>Admin Panel</div>
          <label style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ color: "#523629", fontWeight: 600 }}>Select Project Board:</span>
            <select
              value={selectedBoardId}
              onChange={(e) => setSelectedBoardId(e.target.value)}
              style={{ padding: "10px 12px", borderRadius: "8px", border: "2px solid #523629" }}
            >
              {boards.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.projectName || b.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={{ backgroundColor: "#523629", padding: "20px", borderRadius: "10px", marginTop: "16px" }}>
          <table style={styles.table}>
            <tbody>
              <tr>
                <td style={{ ...styles.td, width: "20%" }}>
                  <button style={styles.sectionButton(activeSection === "ideas")} onClick={() => setActiveSection("ideas")}>
                    Manage Ideas
                  </button>
                  <button style={styles.sectionButton(activeSection === "users")} onClick={() => setActiveSection("users")}>
                    Manage Users
                  </button>
                </td>
                <td style={{ ...styles.td, width: "80%" }}>
                  {boardsError ? (
                    <div style={{ color: "white" }}>Error: {boardsError}</div>
                  ) : activeSection === "ideas" ? (
                    renderIdeasSection()
                  ) : (
                    renderUsersSection()
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <button style={styles.floatingButton} onClick={() => handleOpenPopup()}>
          Create Project Board
        </button>

        <Dialog open={openPopup} onClose={() => setOpenPopup(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingBoard ? "Edit Board" : "Create New Board"}
            <IconButton aria-label="close" onClick={() => setOpenPopup(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <BoardCreate setFormData={setBoardFormData} user={user} />
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="primary" onClick={handleSaveBoard}>
              {editingBoard ? "Update Board" : "Save & Exit"}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
};

export default AdminPanel;
