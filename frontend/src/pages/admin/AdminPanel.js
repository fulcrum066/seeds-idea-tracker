import React, { useState, useEffect, useCallback, useMemo } from "react";
import "../../styles/HomePageStyle.css";
import { useSelector, useDispatch } from "react-redux";
import { FaCheck, FaEdit, FaTimes } from "react-icons/fa";
import authService from "../../features/auth/authService";
import TopBar from "../../components/Navigation/NavBar";
import { getBoards, createBoard, updateBoard } from "../../features/board/boardService";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BoardCreate from "../../components/BoardCreate/BoardCreate";

import axios from "axios";

// ---------- Dialog Box ------
import { getSeeds, createSeed, updateSeeds, deleteSeeds, modifySeed, toggleFavorite, addComment, deleteComment } from "../../features/seed/seedSlice";
import IdeaEdit from "../../components/IdeaEdit/IdeaEdit";
import SeedView from "../../components/SeedView/SeedView";
import { useNavigate } from "react-router-dom";

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
  
  // Used by handleViewIdea and handeEditIdea Functions
  const [ideaFormData, setIdeaFormData] = useState({});
  const [openTestPopup, setOpenTestPopup] = useState(false);
  const [editingIdea, setEditingIdea] = useState(null);
  const [openViewPopup, setOpenViewPopup] = useState(false);
  const [viewingIdea, setViewingIdea] = useState(null);
  const [isEditingInView, setIsEditingInView] = useState(false);
  const [viewFormData, setViewFormData] = useState({});
  const [newComment, setNewComment] = useState('');
  const [activeBoard, setActiveBoard] = useState(null); // currently selected board
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardError, setBoardError] = useState("");

  // ---------- Board fetching ----------
  // Automatically retrieves all boards before any are loaded into the page
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

  //console.log(boards)

  // ---------- User fetching ----------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const list = await authService.getUser(token); // returns ALL users
        setUsers(Array.isArray(list) ? list : []);
      } catch (err) {
        setUsersError(err?.response?.data?.message || err.message || "Failed to load users");
      } finally {
        setUsersLoading(false);
      }
    };
    if (token) fetchUsers();
  }, [token]);

  // ---------- User/Board Management ----------
  const handleUserBoardUpdate = async (boardId, action) => {
    if (!emailInput) return alert("Please enter an email.");
    try {
      const email = emailInput.trim();
      const userData = await authService.getUserByEmail(email, token);
      if (!userData?._id) return alert("User not found");

      const userId = String(userData._id);
      const board = boards.find((b) => String(b._id) === String(boardId));
      if (!board) return alert("Board not found");

      // Normalize board.users to IDs
      const currentUserIds = (board.users || []).map((u) =>
        String(typeof u === "string" ? u : u._id)
      );

      let updatedUserIds;
      if (action === "add") {
        if (currentUserIds.includes(userId)) {
          alert("User already in board");
          return;
        }
        updatedUserIds = [...currentUserIds, userId];
      } else if (action === "remove") {
        updatedUserIds = currentUserIds.filter((id) => id !== userId);
      } else {
        return alert("Unknown action");
      }

      // 1) Update the board with pure IDs
      await updateBoard(token, boardId, { ...board, users: updatedUserIds });

      // 2) Update the user's boards as IDs
      const currentBoards = (userData.boards || []).map((id) => String(id));
      const updatedBoards =
        action === "add"
          ? [...new Set([...currentBoards, String(boardId)])]
          : currentBoards.filter((id) => String(id) !== String(boardId));

      await authService.updateUser(
        { ...userData, boards: updatedBoards, _id: userId },
        token
      );

      await refreshBoards();
      alert(`User ${action === "add" ? "added to" : "removed from"} board!`);
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Failed to update user");
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

  // ------- Updating a Seed Status ---------
  const updateSeed = async (seedId, updateData, token) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // if you use JWT
        },
      };

      const { data } = await axios.put(`/api/seeds/seed/${seedId}`, updateData, config);
      return data; // updated seed object
    } catch (error) {
      console.error("Failed to update seed:", error.response?.data || error.message);
      throw error;
    }
  };

  const handleSeedUpdate = async (seed, newStatus) => {
    try {
      const updated = await updateSeed(seed._id, { status: newStatus }, token);
      console.log("Seed updated:", updated);
      // Update boards state so UI reflects the change
      setBoards(prevBoards =>
        prevBoards.map(board =>
          board._id === selectedBoardId
            ? {
                ...board,
                seeds: board.seeds.map(s =>
                  s._id === seed._id ? updated : s
                ),
              }
            : board
        )
    );

    } catch (error) {
      console.error("Failed to approve seed:", error);
    }
  };



// Creates a new seed in the database
  const handleCreateSeed = async (seedData) => {
    const payload = activeBoard?._id ? { ...seedData, boardId: activeBoard._id } : seedData;
    let tempId = `temp-${Date.now()}`;
    if (activeBoard) {
      setActiveBoard((b) => ({
        ...b,
        seeds: [...(b?.seeds ?? []), { ...payload, _id: tempId, isFavorite: false }],
      }));
    }
    try {
      const created = await dispatch(createSeed(payload)).unwrap();

      if (activeBoard) {
        setActiveBoard((b) => ({
          ...b,
          seeds: (b?.seeds ?? []).map((s) => (s._id === tempId ? created : s)),
        }));
      }
    } catch (err) {
      if (activeBoard) {
        setActiveBoard((b) => ({
          ...b,
          seeds: (b?.seeds ?? []).filter((s) => s._id !== tempId),
        }));
      }
      console.error("Create seed failed:", err);
      alert("Could not create the idea.");
    }
  };


  // Opens the create/edit popup for new idea
  const handleOpenTestPopup = () => {
    setEditingIdea(null);
    setIdeaFormData({});
    setOpenTestPopup(true);
  };

  const handleEditIdea = (idea) => {
    setEditingIdea(idea);
    setIdeaFormData({
      title: idea.title,
      description: idea.content,
      priority: idea.priority || "low",
      metric1: idea.metric1 || "",
      metric2: idea.metric2 || "",
      metric3: idea.metric3 || "",
      metric4: idea.metric4 || "",
      metric5: idea.metric5 || "",
      metric6: idea.metric6 || "",
      metric7: idea.metric7 || "",
      metric8: idea.metric8 || "",
    });
    setOpenTestPopup(true);
  };

  const handleViewIdea = (idea) => {
    setViewingIdea(idea);
    setViewFormData({
      title: idea.title,
      description: idea.content,
      priority: idea.priority || 'low',
      metric1: idea.metric1 || '',
      metric2: idea.metric2 || '',
      metric3: idea.metric3 || ''
    });
    setIsEditingInView(false);
    setNewComment('');
    setOpenViewPopup(true);
  }; 

  //---- Diaglog Box ---- 
  const { allSeeds, isLoading } = useSelector((state) => state.seeds);
  const [selectedProject, setSelectedProject] = useState(0);

  // Build project list from seed groups
  const projects = useMemo(() => {
    let projectList = [];

    if (Array.isArray(allSeeds) && allSeeds.length > 0) {
      const uniqueGroups = [
        ...new Set(allSeeds.map((s) => s.group).filter(Boolean)),
      ];
      projectList = uniqueGroups.map((group, i) => ({
        id: i,
        name: `Project ${i + 1}`,
        groupName: group,
      }));
    }


    // Ensure at least 1 project exists
    if (projectList.length < 1) {
      projectList.push({
        id: 0,
        name: "Project 1",
        groupName: "Project 1",
      });
    }

    return projectList;
  }, [allSeeds]);

  const handleToggleFavorite = async (ideaId) => {
    if (activeBoard?.seeds?.length) {
      setActiveBoard((b) => ({
        ...b,
        seeds: b.seeds.map((s) =>
          (s._id || s.id) === ideaId ? { ...s, isFavorite: !s.isFavorite } : s
        ),
      }));
    }
    if (viewingIdea && (viewingIdea._id || viewingIdea.id) === ideaId) {
      setViewingIdea((v) => ({ ...v, isFavorite: !v.isFavorite }));
    }

    try {
      await dispatch(toggleFavorite(ideaId)).unwrap();
    } catch (err) {
      // Roll back on failure
      if (activeBoard?.seeds?.length) {
        setActiveBoard((b) => ({
          ...b,
          seeds: b.seeds.map((s) =>
            (s._id || s.id) === ideaId ? { ...s, isFavorite: !s.isFavorite } : s
          ),
        }));
      }
      if (viewingIdea && (viewingIdea._id || viewingIdea.id) === ideaId) {
        setViewingIdea((v) => ({ ...v, isFavorite: !v.isFavorite }));
      }
      console.error("Toggle favourite failed:", err);
      alert("Could not update favourite.");
    }
  };


  const handleAddComment = (ideaId) => {
    if (newComment.trim()) {
      const commentData = {
        text: newComment.trim(),
        author: user?.name || 'Anonymous',
        authorEmail: user?.email || '',
        createdAt: new Date()
      };

      // Update local state immediately
      if (viewingIdea && viewingIdea.id === ideaId) {
        setViewingIdea({
          ...viewingIdea,
          comments: [...(viewingIdea.comments || []), commentData]
        });
      }

      dispatch(addComment({ seedId: ideaId, commentData }));
      setNewComment('');
    }
  };

  const handleDeleteComment = (ideaId, commentId) => {
    // Update local state immediately
    if (viewingIdea && viewingIdea.id === ideaId) {
      setViewingIdea({
        ...viewingIdea,
        comments: viewingIdea.comments.filter(comment => comment._id !== commentId)
      });
    }

    dispatch(deleteComment({ seedId: ideaId, commentId }));
  };

  const handleEditInView = () => {
    setIsEditingInView(true);
  };

  const handleSaveInView = async () => {
    const cleanDescription = viewFormData.description?.trim();
    const cleanTitle = viewFormData.title?.trim();

    if (!cleanDescription || !cleanTitle) {
      alert("Please enter both title and description");
      return;
    }

    const currentProjectGroup = projects[selectedProject]?.groupName;

    const updateData = {
      _id: viewingIdea.id,
      title: cleanTitle,
      description: cleanDescription + (viewFormData.metric3 ? `||METRIC3:${viewFormData.metric3}` : ""),
      creatorName: user?._id || null,
      creatorEmail: user?.email || "",
      group: currentProjectGroup || `Project ${selectedProject}`,
      subGroup: viewFormData.metric1 || "",
      type: viewFormData.metric2 || "",
      priority: (viewFormData.priority || "low").toLowerCase(),
    };

    // Update the seed data
    dispatch(modifySeed(updateData));
    await dispatch(updateSeeds());

    // Update the viewing idea with the new data
    const updatedIdea = {
      ...viewingIdea,
      title: cleanTitle,
      content: cleanDescription,
      priority: viewFormData.priority || 'low',
      metric1: viewFormData.metric1 || 'Not set',
      metric2: viewFormData.metric2 || 'Not set',
      metric3: viewFormData.metric3 || 'Not set'
    };

    setViewingIdea(updatedIdea);
    setIsEditingInView(false);
  };

  const handleCancelEdit = () => {
    setViewFormData({
      title: viewingIdea.title,
      description: viewingIdea.content,
      priority: viewingIdea.priority || 'low',
      metric1: viewingIdea.metric1 || '',
      metric2: viewingIdea.metric2 || '',
      metric3: viewingIdea.metric3 || ''
    });
    setIsEditingInView(false);
  };
  
  // Deletes an idea after confirmation
  const handleDeleteIdea = async (ideaId) => {
    if (!window.confirm("Are you sure you want to delete this idea?")) return;

    const prevBoard = activeBoard;
    if (activeBoard?.seeds?.length) {
      setActiveBoard((b) => ({
        ...b,
        seeds: b.seeds.filter((s) => (s._id || s.id) !== ideaId),
      }));
    }

    if (viewingIdea && (viewingIdea._id || viewingIdea.id) === ideaId) {
      handleCloseViewPopup();
    }

    try {
      await dispatch(deleteSeeds([ideaId])).unwrap();
    } catch (err) {
      // Roll back on failure
      setActiveBoard(prevBoard);
      console.error("Delete failed:", err);
      alert("Could not delete the idea.");
    }
  };

  // Closes the create/edit dialog and resets state
  const handleCloseTestPopup = () => {
    setOpenTestPopup(false);
    setEditingIdea(null);
    setIdeaFormData({});
  };

  // Closes the view dialog and resets state
  const handleCloseViewPopup = () => {
    setOpenViewPopup(false);
    setViewingIdea(null);
    setIsEditingInView(false);
    setViewFormData({});
    setNewComment('');
  };

  // ---------- Render helpers ----------
  const renderIdeasSection = () => {
    // Find the active board based on selectedBoardId
    const activeBoard = boards.find((b) => b._id === selectedBoardId);

    // Get seeds for that board (empty array if none)
    const seedsForBoard = activeBoard?.seeds || [];
    //console.log(seedsForBoard)

    return (
      <div>
        <h2 style={{ marginBottom: "10px" }}>Manage Ideas</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {seedsForBoard.length === 0 ? (
              <tr>
                <td style={styles.td} colSpan={5}>No seeds found for this board</td>
              </tr>
            ) : (
              seedsForBoard.map((seed, idx) => (
                <tr key={seed._id || idx}>
                  <td style={styles.td}><b>{seed.title || `Untitled ${idx}`}</b></td>
                  <td style={styles.td}>
                    <b>
                      {seed.dateRecorded
                        ? new Date(seed.dateRecorded).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          })
                        : `Untitled ${idx}`}
                    </b>
                  </td>
                  <td style={{
                      ...styles.td,
                      color:
                        seed.status === "pending"
                          ? "#EEB64E"
                          : seed.status === "approved"
                          ? "#6beb45ff"
                          : seed.status === "rejected"
                          ? "#D34D4D"
                          : "#999999" // fallback color
                    }}
                  >
                    <b>{seed.status || "unknown"}</b>
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => handleViewIdea(seed)} style={styles.viewButton}>View</button>
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => handleSeedUpdate(seed, "approved")} style={styles.iconButton("#86E63C")}><FaCheck /></button>
                    <button onClick ={() => handleEditIdea(seed)} style={styles.iconButton("#EEB64E")}><FaEdit /></button>
                    <button onClick={() => handleSeedUpdate(seed, "rejected")} style={styles.iconButton("#D34D4D")}><FaTimes /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderUsersSection = () => {
    const board = boards.find((b) => b._id === selectedBoardId);

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

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
          <input
            type="email"
            placeholder="Enter user email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            style={styles.input}
          />
          <button
            style={styles.addButton}
            onClick={() => handleUserBoardUpdate(selectedBoardId, "add")}
          >
            Add User
          </button>
          <button
            style={styles.removeButton}
            onClick={() => handleUserBoardUpdate(selectedBoardId, "remove")}
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
              <option value="">-- Select a board --</option>
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

      <div>
        <div>
          {/* Dialog for popups */}
          <Dialog open={openTestPopup} onClose={handleCloseTestPopup} maxWidth="md" fullWidth>
            <DialogTitle>
              {editingIdea ? "Edit Idea" : "Create New Idea"}
              <IconButton
                aria-label="close"
                onClick={handleCloseTestPopup}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              <IdeaEdit setFormData={setIdeaFormData} user={user} />
            </DialogContent>

            <DialogActions>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  const cleanDescription = (ideaFormData.description || "").trim();
                  const cleanTitle = (ideaFormData.title || "").trim();

                  if (!cleanDescription) {
                    alert("Please enter a description");
                    return;
                  }
                  if (!cleanTitle) {
                    alert("Please enter a title");
                    return;
                  }

                  // prefer activeBoard projectName as the group, otherwise fall back to selected project group
                  const currentProjectGroup = activeBoard?.projectName || projects[selectedProject]?.groupName || `Project ${selectedProject}`;

                  // Data to be used in backend
                  const seedData = {
                    title: cleanTitle,
                    creatorName: user?._id || null,
                    creatorEmail: user?.email || "",
                    group: currentProjectGroup,
                    boardId: activeBoard?._id,
                    metric1: ideaFormData.metric1 || "",
                    metric2: ideaFormData.metric2 || "",
                    metric3: ideaFormData.metric3 || "",
                    metric4: ideaFormData.metric4 || "",
                    metric5: ideaFormData.metric5 || "",
                    metric6: ideaFormData.metric6 || "",
                    metric7: ideaFormData.metric7 || "",
                    metric8: ideaFormData.metric8 || "",
                    priority: (ideaFormData.priority || "low").toLowerCase(),
                    status: "pending",
                    description:
                      cleanDescription +
                      (ideaFormData.metric3 ? `||METRIC3:${ideaFormData.metric3}` : ""),
                  };

                  if (editingIdea) {
                    const updateData = { ...seedData, _id: editingIdea.id };
                    dispatch(modifySeed(updateData));
                    dispatch(updateSeeds());
                  } else {
                    handleCreateSeed(seedData);
                  }

                  handleCloseTestPopup();
                }}
              >
                {editingIdea ? "Update Idea" : "Save & Exit"}
              </Button>
            </DialogActions>
          </Dialog>

          {/*Dialog for viewing seed idea*/}
          <SeedView
            open={openViewPopup}
            onClose={handleCloseViewPopup}
            viewingIdea={viewingIdea}
            isEditingInView={isEditingInView}
            setIsEditingInView={setIsEditingInView}
            viewFormData={viewFormData}
            setViewFormData={setViewFormData}
            onSaveInView={handleSaveInView}
            onCancelEdit={handleCancelEdit}
            onToggleFavorite={handleToggleFavorite}
            newComment={newComment}
            setNewComment={setNewComment}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
          />
        </div>
      </div>
      <TopBar />
    </>
  );
};

export default AdminPanel;
