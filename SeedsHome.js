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
          metric3: metric3Value                
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
    </div>
  );
}

export default SeedsDashboard;