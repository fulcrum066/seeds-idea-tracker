// Some setup 
import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getSeeds,
  createSeed,
  updateSeeds,
  deleteSeeds,
  modifySeed
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
import { useNavigate } from "react-router-dom";

function SeedsDashboard() {
  const dispatch = useDispatch(); 
  const navigate = useNavigate();
  const { allSeeds, isLoading } = useSelector((state) => state.seeds); 
  const { user, isLoading: isUserLoading } = useSelector(
    (state) => state.auth
  ); 

  // Consts to maintain data used on the page
  const [selectedProject, setSelectedProject] = useState(0); 
  const [ideaFormData, setIdeaFormData] = useState({}); 
  const [openTestPopup, setOpenTestPopup] = useState(false); 
  const [editingIdea, setEditingIdea] = useState(null); 

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
        name: `Project ${index+1}`, 
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
          content: "Click the CREATE IDEA button to add your first idea!",
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
          // Map existing database fields to business metrics (temporary until backend is updated)
          estimatedIncreaseRevenue: seed.subGroup || 'Not set',        // Maps to what was metric1
          costOfImplementation: seed.type || 'Not set',               // Maps to what was metric2  
          creatingNewRevenueStreams: metric3Value,                    // Maps to what was metric3
          maintainingCompliance: 'Not set',
          reducingCost: 'Not set',
          reducingRisk: 'Not set', 
          improvingProductivity: 'Not set',
          improvingProcesses: 'Not set'
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
      // Map the first 3 business metrics to the existing form fields
      metric1: idea.estimatedIncreaseRevenue || '',
      metric2: idea.costOfImplementation || '',
      metric3: idea.creatingNewRevenueStreams || ''
    });
    setOpenTestPopup(true); 
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
          <button
            onClick={() => navigate('/time-tracking')}
            style={{
              width: '100%',
              backgroundColor: '#6a951f',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '8px',
              cursor: 'pointer'
          }}>
            TASK TRACKING
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
        gap: '20px',
        maxWidth: 'calc(100vw - 300px)' 
      }}>
        {/*Idea cards*/}
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            style={{
              backgroundColor: '#6a4026', 
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
              position: 'relative'
            }}
          >
            {/*Idea title*/}
            <h2 style={{
              color: '#e8c352', 
              fontSize: '20px',
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: '20px',
              margin: '0 0 20px 0'
            }}>
              {idea.title}
            </h2>
            
            {/*Main content area*/}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              color: '#6a4026',
              display: 'flex', 
              gap: '24px'
            }}>
              {/*Left side content*/}
              <div style={{ flex: '1' }}>
                
                {/*Description Section*/}
                <div style={{ 
                  marginBottom: '24px',
                  padding: '16px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px',
                  border: '1px solid #e9ecef'
                }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    marginBottom: '8px',
                    color: '#495057'
                  }}>
                    Description
                  </h3>
                  <p style={{ 
                    fontSize: '14px', 
                    lineHeight: '1.5',
                    margin: 0,
                    color: '#6c757d'
                  }}>
                    {idea.content}
                  </p>
                </div>

                {/*Priority and Creator Row*/}
                <div style={{ 
                  display: 'flex', 
                  gap: '20px', 
                  marginBottom: '24px' 
                }}>
                  <div style={{ flex: '1' }}>
                    <h4 style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      marginBottom: '6px',
                      color: '#495057'
                    }}>
                      Priority
                    </h4>
                    <div style={{ 
                      padding: '6px 12px',
                      backgroundColor: idea.priority === 'high' ? '#fee2e2' : 
                                     idea.priority === 'medium' ? '#fef3c7' : '#d1fae5',
                      color: idea.priority === 'high' ? '#dc2626' : 
                             idea.priority === 'medium' ? '#d97706' : '#059669',
                      borderRadius: '20px',
                      display: 'inline-block',
                      fontSize: '12px',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}>
                      {idea.priority || 'Low'}
                    </div>
                  </div>
                  
                  <div style={{ flex: '1' }}>
                    <h4 style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      marginBottom: '6px',
                      color: '#495057'
                    }}>
                      Creator
                    </h4>
                    <p style={{ 
                      fontSize: '13px', 
                      margin: 0,
                      color: '#6c757d'
                    }}>
                      {idea.creator || 'Unknown'}
                    </p>
                  </div>
                </div>

                {/*Business Value Metrics Section*/}
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    marginBottom: '16px',
                    color: '#495057'
                  }}>
                    Business Value Metrics
                  </h3>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '16px'
                  }}>
                    
                    {/*Revenue Impact Group*/}
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      <h4 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        marginBottom: '12px',
                        color: '#495057'
                      }}>
                        Revenue Impact
                      </h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#4a5568' }}>Estimated Increase:</span>
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: '500',
                            color: idea.estimatedIncreaseRevenue !== 'Not set' ? '#2d3748' : '#a0aec0'
                          }}>
                            {idea.estimatedIncreaseRevenue}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#4a5568' }}>New Streams:</span>
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: '500',
                            color: idea.creatingNewRevenueStreams !== 'Not set' ? '#2d3748' : '#a0aec0'
                          }}>
                            {idea.creatingNewRevenueStreams}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/*Cost Impact Group*/}
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      <h4 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        marginBottom: '12px',
                        color: '#495057'
                      }}>
                        Cost Impact
                      </h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#4a5568' }}>Implementation:</span>
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: '500',
                            color: idea.costOfImplementation !== 'Not set' ? '#2d3748' : '#a0aec0'
                          }}>
                            {idea.costOfImplementation}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#4a5568' }}>Cost Reduction:</span>
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: '500',
                            color: idea.reducingCost !== 'Not set' ? '#2d3748' : '#a0aec0'
                          }}>
                            {idea.reducingCost}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/*Operations Group*/}
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      <h4 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        marginBottom: '12px',
                        color: '#495057'
                      }}>
                        Operations
                      </h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#4a5568' }}>Productivity:</span>
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: '500',
                            color: idea.improvingProductivity !== 'Not set' ? '#2d3748' : '#a0aec0'
                          }}>
                            {idea.improvingProductivity}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#4a5568' }}>Processes:</span>
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: '500',
                            color: idea.improvingProcesses !== 'Not set' ? '#2d3748' : '#a0aec0'
                          }}>
                            {idea.improvingProcesses}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/*Risk & Compliance Group*/}
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      <h4 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        marginBottom: '12px',
                        color: '#495057'
                      }}>
                        Risk & Compliance
                      </h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#4a5568' }}>Risk Reduction:</span>
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: '500',
                            color: idea.reducingRisk !== 'Not set' ? '#2d3748' : '#a0aec0'
                          }}>
                            {idea.reducingRisk}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#4a5568' }}>Compliance:</span>
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: '500',
                            color: idea.maintainingCompliance !== 'Not set' ? '#2d3748' : '#a0aec0'
                          }}>
                            {idea.maintainingCompliance}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/*Action Buttons*/}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  gap: '8px',
                  paddingTop: '8px'
                }}>
                  <button
                    onClick={() => handleEditIdea(idea)}
                    style={{
                      backgroundColor: '#e8c352', 
                      color: '#6a4026',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#deb837'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#e8c352'}
                  >
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleDeleteIdea(idea.id)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/*Right side media section*/}
              <div style={{ 
                flex: '0 0 220px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #dee2e6',
                minHeight: '200px'
              }}>
                <div style={{ 
                  textAlign: 'center', 
                  color: '#6c757d'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}></div>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                    Media Section
                  </div>
                  <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
                    Images, files, or attachments will display here
                  </div>
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
                priority: (ideaFormData.priority || "low").toLowerCase(),
                // Map form fields to database fields (temporary until backend supports all metrics)
                subGroup: ideaFormData.metric1 || "",    // Will display as Estimated Increase Revenue
                type: ideaFormData.metric2 || "",        // Will display as Cost of Implementation
                description: cleanDescription + (ideaFormData.metric3 ? `||METRIC3:${ideaFormData.metric3}` : "") // Creating New Revenue Streams
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
    </div>
  );
}

export default SeedsDashboard;