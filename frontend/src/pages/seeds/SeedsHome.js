// Some setup 
import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getSeeds,
  createSeed,
  updateSeeds,
  deleteSeeds,
  modifySeed,
  toggleFavorite,
  addComment,
  deleteComment
} from "../../features/seed/seedSlice";
import { getUser } from "../../features/auth/authSlice";
import Spinner from "../../components/Spinner";
import IdeaEdit from "../../components/IdeaEdit/IdeaEdit";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

function SeedsDashboard() {
  const dispatch = useDispatch();
  const { allSeeds, isLoading } = useSelector((state) => state.seeds);
  const { user, isLoading: isUserLoading } = useSelector(
    (state) => state.auth
  );

  // Consts to maintain data used on the page
  const [selectedProject, setSelectedProject] = useState(0);
  const [ideaFormData, setIdeaFormData] = useState({});
  const [openTestPopup, setOpenTestPopup] = useState(false);
  const [editingIdea, setEditingIdea] = useState(null);
  const [openViewPopup, setOpenViewPopup] = useState(false);
  const [viewingIdea, setViewingIdea] = useState(null);
  const [isEditingInView, setIsEditingInView] = useState(false);
  const [viewFormData, setViewFormData] = useState({});
  const [newComment, setNewComment] = useState('');

  // Getting database data
  useEffect(() => {
    dispatch(getSeeds());
    dispatch(getUser());
  }, [dispatch]);


  // This will create the board dynamically so we can later add functionality to adding project boards etc
  const projects = useMemo(() => {
    let projectList = [];

    // Safety check 
    if (allSeeds && Array.isArray(allSeeds) && allSeeds.length > 0) {
      const uniqueGroups = [...new Set(allSeeds.map(seed => seed.group).filter(group => group))];
      projectList = uniqueGroups.map((group, index) => ({
        id: index,
        name: `Project ${index + 1}`,
        groupName: group
      }));
    }

    // This is so that there's always one project board can get rid of later
    while (projectList.length < 1) {
      const index = projectList.length;
      projectList.push({
        id: index,
        name: `Project ${index}`,
        groupName: `Project ${index}`
      });
    }

    return projectList;
  }, [allSeeds]);

  // Filters seeds based on selected project 
  const filteredIdeas = useMemo(() => {
    if (!allSeeds || !Array.isArray(allSeeds) || allSeeds.length === 0) {
      // In case we don't have an idea on a board this can also go if needed
      return [
        {
          id: 0,
          title: "No Ideas Yet",
          content: "Click the TEST button to add your first idea!",
        }
      ];
    }

    const selectedProjectData = projects[selectedProject];
    if (!selectedProjectData) return [];

    return allSeeds
      .filter(seed => {
        if (!seed.group) {
          return selectedProject === 0;
        }
        return seed.group === selectedProjectData.groupName;
      })
      .map(seed => {
        let cleanDescription = seed.description || "No description provided";
        let metric3Value = 'Not set';

        if (cleanDescription.includes('||METRIC3:')) {
          const parts = cleanDescription.split('||METRIC3:');
          cleanDescription = parts[0];
          metric3Value = parts[1] || 'Not set';
        }

        // This gets the database data and translates it for this page
        return {
          id: seed._id || seed.id,
          title: seed.title || "Untitled Idea", // I think there's a backend thing here idk
          content: cleanDescription,
          creator: seed.creatorEmail,
          priority: seed.priority,
          // Metric stuff, will be changed when proper metrics are sorted out
          metric1: seed.subGroup || 'Not set',
          metric2: seed.type || 'Not set',
          metric3: metric3Value,
          isFavorite: seed.isFavorite || false,
          comments: seed.comments || []
        };
      });
  }, [allSeeds, selectedProject, projects]);


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
      priority: idea.priority || 'low',
      metric1: idea.metric1 || '',
      metric2: idea.metric2 || '',
      metric3: idea.metric3 || ''
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
    if (window.confirm('Are you sure you want to delete this idea?')) {
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

  // Show spinner while data is loading idk it was already here
  if (isLoading || isUserLoading) return <Spinner />;

  // CSS section
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f1dc99',
      width: '100%',
      margin: 0,
      padding: 0
    }}>
      {/*Sidebar*/}
      <div style={{
        width: '300px',
        backgroundColor: '#f1dc99',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minHeight: '100vh'
      }}>
        {/*Header*/}
        <div>
          <h1 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#6a4026',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            SEEDS IDEA BOARD:
          </h1>

          {/*Admin panel button*/}
          <button style={{
            width: '100%',
            backgroundColor: '#6a951f',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '16px',
            cursor: 'pointer'
          }}>
            ADMIN PANEL
          </button>
        </div>

        {/*Project board outline*/}
        <div>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#6a4026',
            marginBottom: '8px',
            margin: '0 0 8px 0'
          }}>
            PROJECT BOARDS:
          </h3>

          {/*Code for project board selection buttons*/}
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project.id)}
              style={{
                width: '100%',
                // Highlight selected project with different colors
                backgroundColor: selectedProject === project.id ? '#6a951f' : '#f1dc99',
                color: selectedProject === project.id ? 'white' : '#6a4026',
                padding: '8px 12px',
                borderRadius: '6px',
                border: selectedProject === project.id ? 'none' : '1px solid #d4af37',
                fontSize: '12px',
                fontWeight: 'bold',
                marginBottom: '4px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              {project.name}
            </button>
          ))}
        </div>

        {/*Bottom section*/}
        <div style={{ marginTop: 'auto' }}>
          {/*Buttons to be expanded on later*/}
          <button style={{
            width: '100%',
            backgroundColor: '#91b472',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '8px',
            cursor: 'pointer'
          }}>
            TIME TRACKING
          </button>

          <button style={{
            width: '100%',
            backgroundColor: '#91b472',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '16px',
            cursor: 'pointer'
          }}>
            DRAFTS
          </button>

          {/*Create idea button*/}
          <Button
            variant="contained"
            color="primary"
            style={{
              backgroundColor: '#6a951f',
              width: '100%',
              fontSize: '12px',
              padding: '8px 12px'
            }}
            onClick={handleOpenTestPopup}
          >
            CREATE IDEA
          </Button>
        </div>
      </div>

      {/*Big main section*/}
      <div style={{
        flex: 1,
        backgroundColor: '#f1dc99',
        padding: '20px 60px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: 'calc(100vw - 300px)'
      }}>
        {/*Idea cards*/}
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            style={{
              backgroundColor: '#6a4026',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              position: 'relative'
            }}
          >
            {/*Idea title*/}
            <h3 style={{
              color: '#e8c352',
              fontSize: '14px',
              fontWeight: '500',
              textAlign: 'center',
              marginBottom: '12px',
              margin: '0 0 12px 0'
            }}>
              {idea.title}
            </h3>

            {/*Idea section separated by left and right*/}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '6px',
              padding: '16px',
              minHeight: '100px',
              color: '#6a4026',
              fontSize: '13px',
              lineHeight: '1.4',
              display: 'flex',
              gap: '16px'
            }}>
              {/*Left side has the data*/}
              <div style={{ flex: '1' }}>
                {/*Description field*/}
                <div style={{ marginBottom: '12px' }}>
                  <strong>Description:</strong>
                  <div style={{ marginTop: '2px' }}>{idea.content}</div>
                </div>

                {/*Priority stuff can be removed*/}
                <div style={{ marginBottom: '12px' }}>
                  <strong>Priority:</strong>
                  <div style={{
                    marginTop: '2px',
                    padding: '2px 6px',
                    backgroundColor: idea.priority === 'high' ? '#ffebee' :
                      idea.priority === 'medium' ? '#fff3e0' : '#e8f5e8',
                    borderRadius: '3px',
                    display: 'inline-block',
                    fontSize: '11px',
                    textTransform: 'capitalize'
                  }}>
                    {idea.priority || 'Low'}
                  </div>
                </div>

                {/*Idea creator field*/}
                <div style={{ marginBottom: '12px' }}>
                  <strong>Creator:</strong>
                  <div style={{ marginTop: '2px', fontSize: '11px' }}>
                    {idea.creator || 'Unknown'}
                  </div>
                </div>

                {/*Metrics again to be expanded on*/}
                <div style={{ marginBottom: '12px' }}>
                  <strong>Metric 1:</strong>
                  <div style={{ marginTop: '2px', fontSize: '11px' }}>
                    {idea.metric1 || 'Not set'}
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <strong>Metric 2:</strong>
                  <div style={{ marginTop: '2px', fontSize: '11px' }}>
                    {idea.metric2 || 'Not set'}
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <strong>Metric 3:</strong>
                  <div style={{ marginTop: '2px', fontSize: '11px' }}>
                    {idea.metric3 || 'Not set'}
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  gap: '6px'
                }}>
                  {/*Edit button*/}
                  <button
                    onClick={() => handleEditIdea(idea)}
                    style={{
                      backgroundColor: '#e8c352',
                      color: '#6a4026',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '4px 8px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
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
                  {/*Delete button*/}
                  <button
                    onClick={() => handleDeleteIdea(idea.id)}
                    style={{
                      backgroundColor: '#dc3545', // Red color for danger action
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      padding: '8px 12px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/*Right side will have file and media upload, placeholder for now*/}
              <div style={{
                flex: '0 0 200px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed #dee2e6',
                minHeight: '120px'
              }}>
                <div style={{
                  textAlign: 'center',
                  color: '#6c757d',
                  fontSize: '10px'
                }}>
                  <div style={{ marginBottom: '4px' }}></div>
                  <div><strong>Media Section</strong></div>
                  <div style={{ marginTop: '2px' }}>Images, files, or attachments will display here</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/*Dialog for popups*/}
      <Dialog
        open={openTestPopup}
        onClose={handleCloseTestPopup}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingIdea ? 'Edit Idea' : 'Create New Idea'}
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
              const cleanDescription = ideaFormData.description?.trim();
              const cleanTitle = ideaFormData.title?.trim();

              if (!cleanDescription) {
                alert("Please enter a description");
                return;
              }
              if (!cleanTitle) {
                alert("Please enter a title");
                return;
              }

              const currentProjectGroup = projects[selectedProject]?.groupName;

              // Data to be used in backend
              const seedData = {
                title: cleanTitle,
                description: cleanDescription,
                creatorName: user?._id || null,
                creatorEmail: user?.email || "",
                group: currentProjectGroup || `Project ${selectedProject}`,
                subGroup: ideaFormData.metric1 || "",
                type: ideaFormData.metric2 || "",
                priority: (ideaFormData.priority || "low").toLowerCase(),
                description: cleanDescription + (ideaFormData.metric3 ? `||METRIC3:${ideaFormData.metric3}` : ""),
              };

              if (editingIdea) {
                const updateData = {
                  ...seedData,
                  _id: editingIdea.id
                };
                dispatch(modifySeed(updateData));
                dispatch(updateSeeds());
              } else {
                handleCreateSeed(seedData);
              }

              handleCloseTestPopup();
            }}
          >
            {editingIdea ? 'Update Idea' : 'Save & Exit'}
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
  );
}

export default SeedsDashboard;