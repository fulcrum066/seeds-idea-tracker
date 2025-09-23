import React, { useState, useEffect, useMemo } from "react";
import TopBar from '../../components/Navigation/NavBar';
import { useSelector, useDispatch } from "react-redux";
import { getSeeds, createSeed, updateSeeds, deleteSeeds, modifySeed, toggleFavorite, addComment, deleteComment } from "../../features/seed/seedSlice";
import { getUser } from "../../features/auth/authSlice";
import { getBoards } from "../../features/board/boardService";
import Spinner from "../../components/Spinner";
import IdeaEdit from "../../components/IdeaEdit/IdeaEdit";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

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

  // Build project list from seed groups (unchanged)
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
    // Prefer activeBoard.seeds if present
    if (activeBoard?.seeds && Array.isArray(activeBoard.seeds) && activeBoard.seeds.length > 0) {
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
          metric1: seed.metric1 || "Not set",
          metric2: seed.metric2 || "Not set",
          metric3: metric3Value !== "Not set" ? metric3Value : (seed.metric3 || "Not set"),
          metric4: seed.metric4 || "Not set",
          metric5: seed.metric5 || "Not set",
          metric6: seed.metric6 || "Not set",
          metric7: seed.metric7 || "Not set",
          metric8: seed.metric8 || "Not set",
        };
      });
    }

    // Otherwise derive from Redux seeds + selected project
    if (!Array.isArray(allSeeds) || allSeeds.length === 0) {
      return [
        {
          id: 0,
          title: "No Ideas Yet",
          content: "Click the CREATE IDEA button to add your first idea!",
        },
      ];
    }

    const selectedProjectData = projects[selectedProject];
    if (!selectedProjectData) return [];

    return allSeeds
      .filter((seed) => {
        if (!seed.group) {
          return selectedProject === 0;
        }
        return seed.group === selectedProjectData.groupName;
      })
      .map((seed, index) => {
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
  }, [activeBoard, allSeeds, selectedProject, projects]);

  // Creates a new seed in the database
  const handleCreateSeed = (seedData) => {
    dispatch(createSeed(seedData));
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

  const handleToggleFavorite = (ideaId) => {
    dispatch(toggleFavorite(ideaId));
    // Update the local viewing idea state immediately
    if (viewingIdea && viewingIdea.id === ideaId) {
      setViewingIdea({
        ...viewingIdea,
        isFavorite: !viewingIdea.isFavorite
      });
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
  const handleDeleteIdea = (ideaId) => {
    if (window.confirm("Are you sure you want to delete this idea?")) {
      // your deleteSeeds expects an array of IDs
      dispatch(deleteSeeds([ideaId]));
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
                }}
              >
                TIME TRACKING
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
              >
                <option> </option>
                <option value={"name_ascending"}>Name (Ascending)</option>
                <option value={"name_descending"}>Name (Descending)</option>
                <option value={"metric_score_ascending"}>
                  Metrics Score (Ascending)
                </option>
                <option value={"metric_score_descending"}>
                  Metrics Score (Descending)
                </option>
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
                onSubmit={(e) => e.preventDefault()}
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
                  name="q"
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
                  borderRadius: "8px",
                  padding: "16px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  position: "relative",
                }}
              >
                <h3
                  style={{
                    color: "#e8c352",
                    fontSize: "14px",
                    fontWeight: "500",
                    textAlign: "center",
                    marginBottom: "12px",
                    margin: "0 0 12px 0",
                  }}
                >
                  {idea.title}
                </h3>

                <div
                  style={{
                    backgroundColor: "white",
                    borderRadius: "6px",
                    padding: "16px",
                    minHeight: "100px",
                    color: "#6a4026",
                    fontSize: "13px",
                    lineHeight: "1.4",
                    display: "flex",
                    gap: "16px",
                  }}
                >
                  {/* Left */}
                  <div style={{ flex: "1" }}>
                    {/* Description */}
                    <div style={{ marginBottom: "12px" }}>
                      <strong>Description:</strong>
                      <div style={{ marginTop: "2px" }}>{(idea.content ?? "").toString()}</div>
                    </div>

                    {/* Priority */}
                    <div style={{ marginBottom: "12px" }}>
                      <strong>Priority:</strong>
                      <div
                        style={{
                          marginTop: "2px",
                          padding: "2px 6px",
                          backgroundColor:
                            idea.priority === "high"
                              ? "#ffebee"
                              : idea.priority === "medium"
                                ? "#fff3e0"
                                : "#e8f5e8",
                          borderRadius: "3px",
                          display: "inline-block",
                          fontSize: "11px",
                          textTransform: "capitalize",
                        }}
                      >
                        {idea.priority || "Low"}
                      </div>
                    </div>

                    {/* Creator */}
                    <div style={{ marginBottom: "12px" }}>
                      <strong>Creator:</strong>
                      <div style={{ marginTop: "2px", fontSize: "11px" }}>
                        {idea.creator || "Unknown"}
                      </div>
                    </div>

                    {/* Metrics */}
                    {[
                      ["Metric 1", idea.metric1],
                      ["Metric 2", idea.metric2],
                      ["Metric 3", idea.metric3],
                      ["Metric 4", idea.metric4],
                      ["Metric 5", idea.metric5],
                      ["Metric 6", idea.metric6],
                      ["Metric 7", idea.metric7],
                      ["Metric 8", idea.metric8],
                    ].map(([label, value]) => (
                      <div key={label} style={{ marginBottom: "12px" }}>
                        <strong>{label}:</strong>
                        <div style={{ marginTop: "2px", fontSize: "11px" }}>
                          {value || "Not set"}
                        </div>
                      </div>
                    ))}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        gap: "6px",
                      }}
                    >
                      <button
                        onClick={() => handleEditIdea(idea)}
                        style={{
                          backgroundColor: "#e8c352",
                          color: "#6a4026",
                          border: "none",
                          borderRadius: "3px",
                          padding: "4px 8px",
                          fontSize: "10px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        Edit
                      </button>
                      {/*View button*/}
                      <button
                        onClick={() => handleViewIdea(idea)}
                        style={{
                          backgroundColor: '#6a951f',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          padding: '4px 8px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteIdea(idea.id)}
                        style={{
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          padding: "8px 12px",
                          fontSize: "10px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Right placeholder */}
                  <div
                    style={{
                      flex: "0 0 200px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "4px",
                      padding: "12px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px dashed #dee2e6",
                      minHeight: "120px",
                    }}
                  >
                    <div
                      style={{ textAlign: "center", color: "#6c757d", fontSize: "10px" }}
                    >
                      <div>
                        <strong>Media Section</strong>
                      </div>
                      <div style={{ marginTop: "2px" }}>
                        Images, files, or attachments will display here
                      </div>
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
          <Dialog
            open={openViewPopup}
            onClose={handleCloseViewPopup}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: '60px' }}>
              <span>View Seed Idea</span>

              {/* Add to Favorites - positioned on the right */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  gap: '6px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: viewingIdea?.isFavorite ? '#fff3cd' : 'transparent',
                  border: '1px solid ' + (viewingIdea?.isFavorite ? '#ffeaa7' : '#ddd'),
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleToggleFavorite(viewingIdea?.id)}
              >
                <span style={{
                  color: '#333',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {viewingIdea?.isFavorite ? 'Favourited' : 'Add to favourites'}
                </span>
                <span style={{
                  fontSize: '16px',
                  color: viewingIdea?.isFavorite ? '#FFD700' : '#ccc',
                  transition: 'color 0.2s ease'
                }}>
                  ★
                </span>
              </div>

              <IconButton
                aria-label="close"
                onClick={handleCloseViewPopup}
                sx={{ position: "absolute", right: 8, top: 8 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              {viewingIdea && (
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid #ccc',
                  padding: '10px',
                  width: '100%',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '4px',
                }}>


                  {/* Main content area */}
                  <div style={{
                    display: 'flex',
                    gap: '10px'
                  }}>
                    {/* Left half - form fields */}
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '10px',
                      borderRight: '1px solid #ccc',
                      justifyContent: 'center',
                    }}>
                      <h2 style={{
                        color: 'green',
                        margin: 0,
                        fontFamily: 'Comic Sans MS',
                      }}>
                        {isEditingInView ? 'Edit Seed Idea' : 'View Seed Idea'}
                      </h2>

                      <label style={{
                        color: 'black',
                        marginTop: '12px',
                        marginBottom: '8px',
                        fontSize: '16px',
                        alignSelf: 'flex-start',
                      }}>
                        Seed Title:
                      </label>
                      {isEditingInView ? (
                        <input
                          type="text"
                          value={viewFormData.title || ''}
                          onChange={(e) => setViewFormData({ ...viewFormData, title: e.target.value })}
                          style={{
                            padding: '8px',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '14px',
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: '8px',
                          width: '100%',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          fontSize: '14px',
                          backgroundColor: '#fff',
                          minHeight: '20px',
                        }}>
                          {viewingIdea.title}
                        </div>
                      )}

                      <label style={{
                        color: 'black',
                        marginTop: '12px',
                        marginBottom: '8px',
                        fontSize: '16px',
                        alignSelf: 'flex-start',
                      }}>
                        Seed Description:
                      </label>
                      {isEditingInView ? (
                        <textarea
                          value={viewFormData.description || ''}
                          onChange={(e) => setViewFormData({ ...viewFormData, description: e.target.value })}
                          style={{
                            padding: '8px',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '14px',
                            minHeight: '60px',
                            resize: 'vertical'
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: '8px',
                          width: '100%',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          fontSize: '14px',
                          backgroundColor: '#fff',
                          minHeight: '20px',
                        }}>
                          {viewingIdea.content}
                        </div>
                      )}

                      {/* Priority and Creator row */}
                      <div style={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        marginTop: '12px',
                        alignSelf: 'flex-start',
                        width: '100%'
                      }}>
                        <div style={{ flex: 1 }}>
                          <label style={{
                            color: 'black',
                            marginBottom: '4px',
                            fontSize: '16px',
                            display: 'block'
                          }}>
                            Priority:
                          </label>
                          {isEditingInView ? (
                            <select
                              value={viewFormData.priority || 'low'}
                              onChange={(e) => setViewFormData({ ...viewFormData, priority: e.target.value })}
                              style={{
                                padding: '8px',
                                width: '100%',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                fontSize: '14px',
                              }}
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                            </select>
                          ) : (
                            <div style={{
                              padding: '8px',
                              borderRadius: '4px',
                              border: '1px solid #ccc',
                              fontSize: '14px',
                              backgroundColor: '#fff',
                              textTransform: 'capitalize'
                            }}>
                              {viewingIdea.priority || 'Low'}
                            </div>
                          )}
                        </div>

                        <div style={{ flex: 1 }}>
                          <label style={{
                            color: 'black',
                            marginBottom: '4px',
                            fontSize: '16px',
                            display: 'block'
                          }}>
                            Creator:
                          </label>
                          <div style={{
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '14px',
                            backgroundColor: '#fff',
                          }}>
                            {viewingIdea.creator || 'Unknown'}
                          </div>
                        </div>
                      </div>

                      {/* Metric Data Fields */}
                      <label style={{
                        color: 'black',
                        marginTop: '12px',
                        marginBottom: '8px',
                        fontSize: '16px',
                        alignSelf: 'flex-start',
                      }}>
                        Metric Data 1:
                      </label>
                      {isEditingInView ? (
                        <input
                          type="text"
                          value={viewFormData.metric1 || ''}
                          onChange={(e) => setViewFormData({ ...viewFormData, metric1: e.target.value })}
                          style={{
                            padding: '8px',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '14px',
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: '8px',
                          width: '100%',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          fontSize: '14px',
                          backgroundColor: '#fff',
                          minHeight: '20px',
                        }}>
                          {viewingIdea.metric1 || 'Not set'}
                        </div>
                      )}

                      <label style={{
                        color: 'black',
                        marginTop: '12px',
                        marginBottom: '8px',
                        fontSize: '16px',
                        alignSelf: 'flex-start',
                      }}>
                        Metric Data 2:
                      </label>
                      {isEditingInView ? (
                        <input
                          type="text"
                          value={viewFormData.metric2 || ''}
                          onChange={(e) => setViewFormData({ ...viewFormData, metric2: e.target.value })}
                          style={{
                            padding: '8px',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '14px',
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: '8px',
                          width: '100%',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          fontSize: '14px',
                          backgroundColor: '#fff',
                          minHeight: '20px',
                        }}>
                          {viewingIdea.metric2 || 'Not set'}
                        </div>
                      )}

                      <label style={{
                        color: 'black',
                        marginTop: '12px',
                        marginBottom: '8px',
                        fontSize: '16px',
                        alignSelf: 'flex-start',
                      }}>
                        Metric Data 3:
                      </label>
                      {isEditingInView ? (
                        <input
                          type="text"
                          value={viewFormData.metric3 || ''}
                          onChange={(e) => setViewFormData({ ...viewFormData, metric3: e.target.value })}
                          style={{
                            padding: '8px',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '14px',
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: '8px',
                          width: '100%',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          fontSize: '14px',
                          backgroundColor: '#fff',
                          minHeight: '20px',
                        }}>
                          {viewingIdea.metric3 || 'Not set'}
                        </div>
                      )}

                      <label style={{
                        color: 'black',
                        marginTop: '12px',
                        marginBottom: '8px',
                        fontSize: '16px',
                        alignSelf: 'flex-start',
                      }}>
                        Metric Data 4:
                      </label>
                      {isEditingInView ? (
                        <input
                          type="text"
                          value={viewFormData.metric4 || ''}
                          onChange={(e) => setViewFormData({ ...viewFormData, metric4: e.target.value })}
                          style={{
                            padding: '8px',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '14px',
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: '8px',
                          width: '100%',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          fontSize: '14px',
                          backgroundColor: '#fff',
                          minHeight: '20px',
                        }}>
                          {viewingIdea.metric4 || 'Not set'}
                        </div>
                      )}

                      <label style={{
                        color: 'black',
                        marginTop: '12px',
                        marginBottom: '8px',
                        fontSize: '16px',
                        alignSelf: 'flex-start',
                      }}>
                        Metric Data 5:
                      </label>
                      {isEditingInView ? (
                        <input
                          type="text"
                          value={viewFormData.metric5 || ''}
                          onChange={(e) => setViewFormData({ ...viewFormData, metric5: e.target.value })}
                          style={{
                            padding: '8px',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '14px',
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: '8px',
                          width: '100%',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          fontSize: '14px',
                          backgroundColor: '#fff',
                          minHeight: '20px',
                        }}>
                          {viewingIdea.metric5 || 'Not set'}
                        </div>
                      )}

                      <label style={{
                        color: 'black',
                        marginTop: '12px',
                        marginBottom: '8px',
                        fontSize: '16px',
                        alignSelf: 'flex-start',
                      }}>
                        Metric Data 6:
                      </label>
                      {isEditingInView ? (
                        <input
                          type="text"
                          value={viewFormData.metric6 || ''}
                          onChange={(e) => setViewFormData({ ...viewFormData, metric6: e.target.value })}
                          style={{
                            padding: '8px',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '14px',
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: '8px',
                          width: '100%',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          fontSize: '14px',
                          backgroundColor: '#fff',
                          minHeight: '20px',
                        }}>
                          {viewingIdea.metric6 || 'Not set'}
                        </div>
                      )}

                      <label style={{
                        color: 'black',
                        marginTop: '12px',
                        marginBottom: '8px',
                        fontSize: '16px',
                        alignSelf: 'flex-start',
                      }}>
                        Metric Data 7:
                      </label>
                      {isEditingInView ? (
                        <input
                          type="text"
                          value={viewFormData.metric7 || ''}
                          onChange={(e) => setViewFormData({ ...viewFormData, metric7: e.target.value })}
                          style={{
                            padding: '8px',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '14px',
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: '8px',
                          width: '100%',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          fontSize: '14px',
                          backgroundColor: '#fff',
                          minHeight: '20px',
                        }}>
                          {viewingIdea.metric7 || 'Not set'}
                        </div>
                      )}

                      <label style={{
                        color: 'black',
                        marginTop: '12px',
                        marginBottom: '8px',
                        fontSize: '16px',
                        alignSelf: 'flex-start',
                      }}>
                        Metric Data 8:
                      </label>
                      {isEditingInView ? (
                        <input
                          type="text"
                          value={viewFormData.metric8 || ''}
                          onChange={(e) => setViewFormData({ ...viewFormData, metric8: e.target.value })}
                          style={{
                            padding: '8px',
                            width: '100%',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '14px',
                          }}
                        />
                      ) : (
                        <div style={{
                          padding: '8px',
                          width: '100%',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          fontSize: '14px',
                          backgroundColor: '#fff',
                          minHeight: '20px',
                        }}>
                          {viewingIdea.metric8 || 'Not set'}
                        </div>
                      )}

                      {/* Edit mode buttons */}
                      {isEditingInView && (
                        <div style={{
                          display: 'flex',
                          gap: '10px',
                          marginTop: '16px',
                          alignSelf: 'flex-start'
                        }}>
                          <button
                            onClick={handleSaveInView}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#4CAF50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '14px',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            Update
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '14px',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right half - media and comments */}
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '10px',
                      justifyContent: 'flex-start',
                    }}>
                      <h3 style={{
                        color: 'black',
                        marginTop: '12px',
                        marginBottom: '8px',
                        fontSize: '16px',
                      }}>
                        Seed Idea Media
                      </h3>
                      <div style={{
                        border: '2px dashed #aaa',
                        borderRadius: '6px',
                        padding: '20px',
                        width: '100%',
                        textAlign: 'center',
                        backgroundColor: '#fff',
                        color: '#666',
                        marginBottom: '10px'
                      }}>
                        No media uploaded for this seed
                      </div>

                      {/* Upload Media Button */}
                      <button
                        onClick={() => {
                          // Create a file input element
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*,video/*,audio/*,.pdf,.doc,.docx';
                          input.onchange = (e) => {
                            const file = e.target.files[0];
                            if (file) {
                              alert(`File "${file.name}" selected. Media storage not implemented yet.`);
                            }
                          };
                          input.click();
                        }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          width: '100%',
                          marginBottom: '20px'
                        }}
                      >
                        Upload Media
                      </button>

                      {/* Comments Section - Always visible, add only in Edit Mode */}
                      <h3 style={{
                        color: 'black',
                        marginBottom: '8px',
                        fontSize: '16px',
                        alignSelf: 'flex-start'
                      }}>
                        Comments
                      </h3>

                      {/* Comments List - Always visible */}
                      <div style={{
                        width: '100%',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        backgroundColor: '#fff',
                        marginBottom: isEditingInView ? '10px' : '0'
                      }}>
                        {viewingIdea.comments && viewingIdea.comments.length > 0 ? (
                          viewingIdea.comments.map((comment, index) => (
                            <div key={index} style={{
                              padding: '8px',
                              borderBottom: index < viewingIdea.comments.length - 1 ? '1px solid #eee' : 'none',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start'
                            }}>
                              <div style={{ flex: 1 }}>
                                <div style={{
                                  fontSize: '12px',
                                  fontWeight: 'bold',
                                  color: '#666',
                                  marginBottom: '4px'
                                }}>
                                  {comment.author} - {new Date(comment.createdAt).toLocaleDateString()}
                                </div>
                                <div style={{
                                  fontSize: '14px',
                                  color: '#333'
                                }}>
                                  {comment.text}
                                </div>
                              </div>
                              {isEditingInView && (
                                <button
                                  onClick={() => handleDeleteComment(viewingIdea.id, comment._id)}
                                  style={{
                                    backgroundColor: '#ff4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    marginLeft: '8px',
                                    minWidth: '60px'
                                  }}
                                  onMouseOver={(e) => e.target.style.backgroundColor = '#cc0000'}
                                  onMouseOut={(e) => e.target.style.backgroundColor = '#ff4444'}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          ))
                        ) : (
                          <div style={{
                            padding: '20px',
                            textAlign: 'center',
                            color: '#666',
                            fontSize: '14px'
                          }}>
                            No comments yet
                          </div>
                        )}
                      </div>

                      {/* Add Comment - Only in Edit Mode */}
                      {isEditingInView && (
                        <div style={{ width: '100%' }}>
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            style={{
                              width: '100%',
                              padding: '8px',
                              borderRadius: '4px',
                              border: '1px solid #ccc',
                              fontSize: '14px',
                              minHeight: '60px',
                              resize: 'vertical',
                              marginBottom: '8px'
                            }}
                          />
                          <button
                            onClick={() => handleAddComment(viewingIdea.id)}
                            disabled={!newComment.trim()}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: newComment.trim() ? '#4CAF50' : '#ccc',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '14px',
                              cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                              fontWeight: 'bold',
                              width: '100%'
                            }}
                          >
                            Add Comment
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>

            <DialogActions>
              {/* Edit Button - Only show when not in edit mode */}
              {!isEditingInView && (
                <Button
                  variant="contained"
                  onClick={handleEditInView}
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    marginRight: '8px'
                  }}
                >
                  Edit
                </Button>
              )}

              <Button
                variant="outlined"
                onClick={handleCloseViewPopup}
                style={{ color: '#6a4026', borderColor: '#6a4026' }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>

        </div>
      </div>
    </>
  );
}

export default SeedsDashboard;
