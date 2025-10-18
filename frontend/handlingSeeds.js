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
export const refreshBoards = useCallback(async () => {
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

//console.log(boards)

// ---------- User/Board Management ----------
export const handleUserBoardUpdate = async (boardId, action) => {
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
export const handleOpenPopup = (board = null) => {
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

export const handleSaveBoard = async () => {
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
export const updateSeed = async (seedId, updateData, token) => {
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

export const handleSeedUpdate = async (seed, newStatus) => {
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
export const handleCreateSeed = async (seedData) => {
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
export const handleOpenTestPopup = () => {
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
export const { allSeeds, isLoading } = useSelector((state) => state.seeds);
export const [selectedProject, setSelectedProject] = useState(0);

// Build project list from seed groups
export const projects = useMemo(() => {
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


export const handleAddComment = (ideaId) => {
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

export const handleDeleteComment = (ideaId, commentId) => {
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

export const handleCancelEdit = () => {
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
