import React, { useState, useEffect, useMemo } from "react";
import TopBar from '../../components/Navigation/NavBar';
import { useSelector, useDispatch } from "react-redux";
import { getSeeds, createSeed, updateSeeds, deleteSeeds, modifySeed, toggleFavorite, addComment, deleteComment } from "../../features/seed/seedSlice";
import { getUser } from "../../features/auth/authSlice";
import { getBoards } from "../../features/board/boardService";
import Spinner from "../../components/Spinner";
import IdeaEdit from "../../components/IdeaEdit/IdeaEdit";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Chip, } from "@mui/material";
import SeedView from "../../components/SeedView/SeedView";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { searchSeeds } from "../../features/seed/seedService";

function SeedsDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allSeeds, isLoading } = useSelector((state) => state.seeds);
  const { user, isLoading: isUserLoading } = useSelector((state) => state.auth);

  // boards state
  const [boards, setBoards] = useState([]); // all boards the user has access to
  const [activeBoard, setActiveBoard] = useState(null); // currently selected board
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardError, setBoardError] = useState("");

  // consts to maintain data used on the page
  const [selectedProject, setSelectedProject] = useState(0);
  const [ideaFormData, setIdeaFormData] = useState({});
  const [openTestPopup, setOpenTestPopup] = useState(false);
  const [editingIdea, setEditingIdea] = useState(null);
  const [openViewPopup, setOpenViewPopup] = useState(false);
  const [viewingIdea, setViewingIdea] = useState(null);
  const [isEditingInView, setIsEditingInView] = useState(false);
  const [viewFormData, setViewFormData] = useState({});
  const [newComment, setNewComment] = useState('');

  // search & sort
  const [sortOption, setSortOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = async (e) => {
    e?.preventDefault?.();
    if (!user) return;

    try {
      const { results } = await searchSeeds({
        token: user.token,
        q: searchTerm,
        boardId: activeBoard?._id,   // keeps it scoped to the active board
        limit: 200,
      });

      // Replace the board’s visible seeds with the search results (no client filtering!)
      setActiveBoard((prev) => prev ? { ...prev, seeds: results } : prev);
    } catch (err) {
      console.error("Search failed:", err?.response?.data || err.message);
    }
  };


  // getting database data
  useEffect(() => {
    dispatch(getSeeds());
    dispatch(getUser());
  }, [dispatch]);

  // Load Boards for current user
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setBoardError("");
        setBoardLoading(true);
        const token = user?.token;
        const fetched = await getBoards(token); // axios GET /api/board/board (expects array)
        const allBoards = Array.isArray(fetched) ? fetched : [];

        // Optional filtering if your backend returns all boards and you want only those user belongs to.
        // If your backend already returns only the user's boards, you can skip the filter step.
        const userBoards = allBoards.filter((b) => {
          // accomodate different shapes: admins/users may be arrays of IDs or emails
          const userId = user?._id;
          const inAdmins = Array.isArray(b.admins) && b.admins.includes(userId);
          const inUsers = Array.isArray(b.users) && b.users.includes(userId);
          const inUserBoards = Array.isArray(user?.boards) && b._id && user.boards.includes(b._id);
          return inAdmins || inUsers || inUserBoards || true; // keep `true` if you trust API to already filter; change as needed
        });

        if (alive) {
          setBoards(userBoards);
          // default active board: if previously selected project maps to a board, try to keep it, else first
          setActiveBoard(userBoards.length > 0 ? userBoards[0] : null);
        }
      } catch (e) {
        if (alive) setBoardError(e?.response?.data || String(e));
        console.error("Failed to load boards:", e);
      } finally {
        if (alive) setBoardLoading(false);
      }
    };
    if (user) load();
    return () => {
      alive = false;
    };
  }, [user]);

  //sorting helper
  const parseSortOption = (opt) => {
    switch (opt) {
      case "name_ascending": return { by: "name", order: "asc" };
      case "name_descending": return { by: "name", order: "desc" };
      case "metric_score_ascending": return { by: "metric", order: "asc" };
      case "metric_score_descending": return { by: "metric", order: "desc" };
      default: return null;
    }
  };

  const fetchSortedSeeds = async (boardId, token, opt) => {
    const params = parseSortOption(opt);
    if (!params) return; // no selection yet

    try {
      const res = await axios.get(
        `/api/board/board/${boardId}/seeds/sort`,
        {
          headers: { Authorization: `Bearer ${user?.token || token}` },
          params, // { by: 'metric'|'name', order: 'asc'|'desc' }
        }
      );

      // Put sorted seeds back into the currently active board in state
      setActiveBoard((prev) => {
        if (!prev || prev._id !== boardId) return prev; // user switched boards quickly
        return { ...prev, seeds: res.data?.seeds ?? [] };
      });
    } catch (err) {
      console.error("Sorting request failed:", err);
      alert("Could not sort ideas. Please try again.");
    }
  };

  // When user changes the dropdown
  useEffect(() => {
    if (!activeBoard?._id || !sortOption) return;
    fetchSortedSeeds(activeBoard._id, user?.token, sortOption);
  }, [sortOption, activeBoard?._id]); // re-run if active board changes

  // Optional: choose a default sort whenever a new board becomes active
  useEffect(() => {
    // Pick your default sort (or leave blank to keep natural order coming from backend)
    // e.g., default to metric descending:
    setSortOption((prev) => prev || "metric_score_descending");
  }, [activeBoard?._id]);


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

  // Use activeBoard.seeds if available, else filter Redux seeds by selected project
  const filteredIdeas = useMemo(() => {
    if (activeBoard?.seeds && Array.isArray(activeBoard.seeds)) {
      if (activeBoard.seeds.length === 0) {
        return [
          { id: 0, title: "No Ideas Yet", content: "Click the CREATE IDEA button to add your first idea!" }
        ];
      }

      return activeBoard.seeds.map((seed, index) => {
        let cleanDescription = seed.description || "No description provided";
        let metric3Value = "Not set";

        if (typeof cleanDescription === "string" && cleanDescription.includes("||METRIC3:")) {
          const parts = cleanDescription.split("||METRIC3:");
          cleanDescription = parts[0];
          metric3Value = parts[1] || "Not set";
        }

        return {
          id: seed._id || seed.id || index,
          title: seed.title || "Untitled Idea",
          content: cleanDescription,
          creator: seed.creatorEmail,
          priority: seed.priority,
          metricScore: typeof seed.metricScore === "number"
            ? Math.round(seed.metricScore) // optional rounding for a clean display
            : 0,
          metric1: seed.metric1 || "Not set",
          metric2: seed.metric2 || "Not set",
          metric3: metric3Value !== "Not set" ? metric3Value : (seed.metric3 || "Not set"),
          metric4: seed.metric4 || "Not set",
          metric5: seed.metric5 || "Not set",
          metric6: seed.metric6 || "Not set",
          metric7: seed.metric7 || "Not set",
          metric8: seed.metric8 || "Not set",
          isFavorite: seed.isFavorite || false,
          comments: seed.comments || []
        };
      });
    }

    return []; // no board selected
  }, [activeBoard]);


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
      metric3: idea.metric3 || '',
      metric4: idea.metric4 || "",
      metric5: idea.metric5 || "",
      metric6: idea.metric6 || "",
      metric7: idea.metric7 || "",
      metric8: idea.metric8 || "",
    });
    setIsEditingInView(false);
    setNewComment('');
    setOpenViewPopup(true);
  };

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
      metric3: viewFormData.metric3 || 'Not set',
      metric4: viewFormData.metric4 || 'Not set',
      metric5: viewFormData.metric5 || 'Not set',
      metric6: viewFormData.metric6 || 'Not set',
      metric7: viewFormData.metric7 || 'Not set',
      metric8: viewFormData.metric8 || 'Not set',
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
      metric3: viewingIdea.metric3 || '',
      metric4: viewingIdea.metric4 || '',
      metric5: viewingIdea.metric5 || '',
      metric6: viewingIdea.metric6 || '',
      metric7: viewingIdea.metric7 || '',
      metric8: viewingIdea.metric8 || '',
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

  // Show spinner while data is loading
  if (isLoading || isUserLoading || boardLoading) return <Spinner />;

  return (
    <>
      <TopBar />
      <div style={{ paddingTop: '60px' }}>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            backgroundImage: 'url("/dashboard_images/Background.png")',
            backgroundSize: 'cover',
            zIndex: -1,
            width: "100%",
            backgroundAttachment: "fixed",
            backgroundPosition: "center",
            margin: 0,
            padding: 0,
          }}
        >

          {/* Sidebar */}
          <div
            style={{
              width: "300px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              minHeight: "100vh",
            }}
          >
            {/* Header */}
            <div>
              <h1
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "#6a4026",
                  marginBottom: "16px",
                  margin: "0 0 16px 0",
                }}
              >
                SEEDS IDEA BOARD:
              </h1>

              {/* Admin panel button */}
              <button
                onClick={() => navigate("/admin")}
                style={{
                  width: "100%",
                  backgroundColor: "#6a951f",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  cursor: "pointer",
                }}
              >
                ADMIN PANEL
              </button>

              {/* Board summary (NEW) */}
              {boardError && (
                <div style={{ marginTop: 4 }}>
                  <Chip color="error" size="small" label="Board load error" />
                </div>
              )}
              {activeBoard && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#6a4026" }}>
                  <div>
                    <strong>Project:</strong>{" "}
                    {activeBoard.projectName || "Project Board"}
                  </div>
                  <div>
                    <strong>Admins:</strong> {activeBoard.admins?.length ?? 0} •{" "}
                    <strong>Users:</strong> {activeBoard.users?.length ?? 0}
                  </div>
                </div>
              )}
            </div>

            {/* Project boards */}
            <div>
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "#6a4026",
                  marginBottom: "8px",
                  margin: "0 0 8px 0",
                }}
              >
                PROJECT BOARDS:
              </h3>

              {boards.length === 0 && (
                <div style={{ fontSize: "12px", color: "#6a4026" }}>
                  No boards assigned to you yet.
                </div>
              )}

              {boards.map((b) => (
                <button
                  key={b._id || b.id || b.projectName}
                  onClick={() => setActiveBoard(b)}
                  style={{
                    width: "100%",
                    backgroundColor:
                      activeBoard?._id === b._id ? "#6a951f" : "#f1dc99",
                    color: activeBoard?._id === b._id ? "white" : "#6a4026",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border:
                      activeBoard?._id === b._id
                        ? "none"
                        : "1px solid #d4af37",
                    fontSize: "12px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {b.projectName || b.name || "Untitled Board"}
                </button>
              ))}
            </div>

            {/* Bottom section */}
            <div style={{ marginTop: "auto" }}>
              <button
                style={{
                  width: "100%",
                  backgroundColor: "#91b472",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: "bold",
                  marginBottom: "8px",
                  cursor: "pointer",
                }} onClick={() => navigate('/time-tracking')}
              >
                TASK TRACKING
              </button>

              <button
                style={{
                  width: "100%",
                  backgroundColor: "#91b472",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  cursor: "pointer",
                }}
              >
                DRAFTS
              </button>

              <Button
                variant="contained"
                color="primary"
                style={{
                  backgroundColor: "#6a951f",
                  width: "100%",
                  fontSize: "12px",
                  padding: "8px 12px",
                }}
                onClick={handleOpenTestPopup}
              >
                CREATE IDEA
              </Button>
            </div>
          </div>

          {/* Main area */}
          <div
            style={{
              flex: 1,
              padding: "20px 60px 20px 20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              maxWidth: "calc(100vw - 300px)",
            }}
          >
            {/* Filter & Search */}
            <div style={{ display: "flex" }}>
              <select
                style={{
                  width: "120px",
                  height: "40px",
                  borderRadius: "5px 0px 0px 5px",
                  textAlign: "center",
                  border: "1px solid black",
                }}
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="metric_score_descending">Metrics Score ↓</option>
                <option value="metric_score_ascending">Metrics Score ↑</option>
                <option value="name_descending">Name ↓</option>
                <option value="name_ascending">Name ↑</option>



              </select>

              <img
                src="/projectBoard_images/filter.png"
                style={{
                  width: "40px",
                  height: "40px",
                  border: "1px solid black",
                  borderRadius: "0px 5px 5px 0px",
                  marginRight: "20px",
                }}
                alt="filter"
              />

              {/* Search Bar */}
              <form
                onSubmit={handleSearch}
                style={{
                  width: "950vh",
                  height: "40px",
                  backgroundColor: "white",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "60px",
                  padding: "10px 20px",
                  justifyContent: "right",
                  border: "1px solid black",
                }}
              >
                <input
                  type="text"
                  placeholder="Enter Idea Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: "transparent",
                    flex: "1",
                    border: "0",
                    outline: "none",
                    padding: "24px 20px",
                    fontSize: "20px",
                    color: "black",
                  }}
                />
                <button type="submit" style={{ paddingRight: "10px" }}>
                  <img
                    src="/projectBoard_images/search.png"
                    style={{ width: "33px", height: "25px", verticalAlign: "middle", paddingRight: "5px" }}
                    alt="search"
                  />
                  Search
                </button>
              </form>
            </div>

            {/* Idea cards */}
            {filteredIdeas.map((idea) => (
              <div
                key={idea.id}
                style={{
                  backgroundColor: "#6a4026",
                  borderRadius: "24px",
                  padding: "14px 14px 18px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  margin: "0 auto",
                  width: "80%",
                  marginBottom: "12px",
                }}
              >
                {/* Title bar */}
                <h3
                  style={{
                    color: "#e8c352",
                    fontSize: "16px",
                    fontWeight: 700,
                    textAlign: "center",
                    margin: "0 0 8px 0",
                  }}
                >
                  {idea.title}
                </h3>

                {/* Inner white card */}
                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "20px",
                    padding: "14px",
                    display: "flex",
                    gap: "14px",
                    alignItems: "stretch",
                  }}
                >
                  {/* LEFT: Metric score box */}
                  <div
                    style={{
                      width: 100,
                      minWidth: 100,
                      background: "#fafafa",
                      border: "2px solid #cfcfcf",
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ fontSize: 42, fontWeight: 800, color: "#2b2b2b", lineHeight: 1 }}>
                      {idea.metricScore ?? 0}
                    </div>
                  </div>

                  {/* RIGHT: Details */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      color: "#202020",
                      fontSize: "13px",
                    }}
                  >
                    {/* Description */}
                    <div style={{ lineHeight: 1.3 }}>
                      <strong>Description: </strong>
                      {idea.content}
                    </div>

                    {/* Creator */}
                    <div style={{ fontSize: "12px", color: "#555" }}>
                      <strong>Creator: </strong>{idea.creator || "Unknown"}
                    </div>

                    {/* Priority row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 700 }}>Priority:</span>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 8,
                          border: "1px solid #d0d0d0",
                          background:
                            (idea.priority || "").toLowerCase() === "high"
                              ? "#ffebee"
                              : (idea.priority || "").toLowerCase() === "medium"
                                ? "#fff7cc"
                                : "#e8f5e8",
                          color:
                            (idea.priority || "").toLowerCase() === "high"
                              ? "#d32f2f"
                              : (idea.priority || "").toLowerCase() === "medium"
                                ? "#9a7d00"
                                : "#2e7d32",
                          fontWeight: 700,
                          fontSize: "12px",
                          minWidth: 60,
                          textAlign: "center",
                        }}
                      >
                        {(idea.priority || "Low").charAt(0).toUpperCase() +
                          (idea.priority || "low").slice(1)}
                      </span>
                    </div>

                    {/* Buttons row (separate row, right-aligned) */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "6px",
                        marginTop: "6px",
                      }}
                    >
                      <button
                        onClick={() => handleViewIdea(idea)}
                        style={{
                          backgroundColor: "#6a951f",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          padding: "3px 7px",
                          fontSize: "10px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditIdea(idea)}
                        style={{
                          backgroundColor: "#e8c352",
                          color: "#6a4026",
                          border: "none",
                          borderRadius: "3px",
                          padding: "3px 7px",
                          fontSize: "10px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteIdea(idea.id)}
                        style={{
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          padding: "3px 7px",
                          fontSize: "10px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}


          </div>

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
    </>
  );
}

export default SeedsDashboard;
