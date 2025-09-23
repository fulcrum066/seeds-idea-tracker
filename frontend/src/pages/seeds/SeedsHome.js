import React, { useState, useEffect, useMemo } from "react";
import TopBar from '../../components/Navigation/NavBar';
import { useSelector, useDispatch } from "react-redux";
import {
  getSeeds,
  createSeed,
  updateSeeds,
  deleteSeeds,
  modifySeed,
} from "../../features/seed/seedSlice";
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
        </div>
      </div>
    </>
  );
}

export default SeedsDashboard;
