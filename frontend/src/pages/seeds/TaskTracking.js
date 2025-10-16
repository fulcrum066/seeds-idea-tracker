import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getSeeds } from '../../features/seed/seedSlice';
import { getTasksForSeed, createTask, updateTask, deleteTask } from '../../features/task/taskSlice';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function TimeTracking() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { allSeeds } = useSelector((state) => state.seeds);
  const { allTasks } = useSelector((state) => state.tasks);
  const { user } = useSelector((state) => state.auth);

  const [selectedBoard, setSelectedBoard] = useState(null);
  const [selectedSeed, setSelectedSeed] = useState(null);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    taskName: '',
    subTaskCategory: '',
    dueDate: '',
    timeDue: ''
  });

  useEffect(() => {
    dispatch(getSeeds());
  }, [dispatch]);

  // Load tasks when seed is selected
  useEffect(() => {
    if (selectedSeed) {
      dispatch(getTasksForSeed(selectedSeed._id));
    }
  }, [selectedSeed, dispatch]);

  // Get unique boards
  const boards = React.useMemo(() => {
    let projectList = [];
    
    if (allSeeds && Array.isArray(allSeeds) && allSeeds.length > 0) {
      const uniqueGroups = [...new Set(allSeeds.map(seed => seed.group).filter(Boolean))];
      projectList = uniqueGroups.map((group, index) => ({
        id: index,
        name: `Board ${index + 1}`,
        groupName: group
      }));
    }
    
    // Ensure at least one board exists for ungrouped seeds
    if (projectList.length < 1) {
      projectList.push({
        id: 0,
        name: 'Board 1',
        groupName: 'Board 1'
      });
    }
    
    return projectList;
  }, [allSeeds]);

  // Get seeds for selected board
  const seedsForBoard = React.useMemo(() => {
    if (!selectedBoard || !allSeeds) return [];
    return allSeeds.filter(seed => {
      // If seed has no group, show it in the first board
      if (!seed.group) {
        return selectedBoard.id === 0;
      }
      return seed.group === selectedBoard.groupName;
    });
  }, [selectedBoard, allSeeds]);

  // Helper function to convert 24h time to 12h AM/PM
  const formatTime = (time24) => {
    if (!time24) return 'N/A';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleOpenTaskDialog = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTaskFormData({
        taskName: task.taskName,
        subTaskCategory: task.subTaskCategory,
        dueDate: task.dueDate,
        timeDue: task.timeDue
      });
    } else {
      setEditingTask(null);
      setTaskFormData({
        taskName: '',
        subTaskCategory: '',
        dueDate: '',
        timeDue: ''
      });
    }
    setOpenTaskDialog(true);
  };

  const handleCloseTaskDialog = () => {
    setOpenTaskDialog(false);
    setEditingTask(null);
    setTaskFormData({
      taskName: '',
      subTaskCategory: '',
      dueDate: '',
      timeDue: ''
    });
  };

  const handleSaveTask = () => {
    if (!taskFormData.taskName.trim()) {
      alert('Please enter a task name');
      return;
    }

    if (editingTask) {
      dispatch(updateTask({
        id: editingTask._id,
        taskData: taskFormData
      }));
    } else {
      dispatch(createTask({
        ...taskFormData,
        seedId: selectedSeed._id,
        createdBy: user._id
      }));
    }
    handleCloseTaskDialog();
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(taskId));
    }
  };

  return (
    <div style={{ 
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f1dc99',
      width: '100%',
      margin: 0,
      padding: 0
    }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: '#6a4026',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minHeight: '100vh'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#e8c352',
            margin: 0
          }}>
            Time Tracking
          </h2>
        </div>

        <button
          onClick={() => navigate('/dashboard/seed/')}
          style={{
            width: '100%',
            backgroundColor: '#6a951f',
            color: 'white',
            padding: '10px 12px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '20px',
            cursor: 'pointer'
          }}
        >
          Back to Dashboard
        </button>

        <h3 style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#e8c352',
          marginBottom: '8px'
        }}>
          Select Board:
        </h3>

        {boards.map((board) => (
          <div key={board.id} style={{ marginBottom: '8px' }}>
            <button
              onClick={() => {
                if (selectedBoard?.id === board.id) {
                  // If clicking the same board, deselect it (close dropdown)
                  setSelectedBoard(null);
                  setSelectedSeed(null);
                } else {
                  // Otherwise select this board
                  setSelectedBoard(board);
                  setSelectedSeed(null);
                }
              }}
              style={{
                width: '100%',
                backgroundColor: selectedBoard?.id === board.id ? '#91b472' : '#8B6F47',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              {board.name}
              <span>{selectedBoard?.id === board.id ? '▼' : '▶'}</span>
            </button>

            {selectedBoard?.id === board.id && seedsForBoard.length > 0 && (
              <div style={{ marginTop: '8px', marginLeft: '12px' }}>
                {seedsForBoard.map((seed) => (
                  <button
                    key={seed._id}
                    onClick={() => setSelectedSeed(seed)}
                    style={{
                      width: '100%',
                      backgroundColor: selectedSeed?._id === seed._id ? '#6a951f' : '#A0826D',
                      color: 'white',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: 'normal',
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginBottom: '4px'
                    }}
                  >
                    {seed.title || seed.description?.substring(0, 30) || 'Untitled Seed'}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        padding: '40px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          minHeight: '600px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            paddingBottom: '20px',
            borderBottom: '2px solid #e9ecef'
          }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#6a4026',
              margin: 0
            }}>
              {selectedSeed ? `Tasks for: ${selectedSeed.title || selectedSeed.description?.substring(0, 30)}` : 'View Tasks'}
            </h1>

            {selectedSeed && (
              <button
                onClick={() => handleOpenTaskDialog()}
                style={{
                  backgroundColor: '#91b472',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Add Task
              </button>
            )}
          </div>

          {!selectedSeed ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
              color: '#6c757d',
              fontSize: '18px'
            }}>
              Please select a board and seed to view tasks
            </div>
          ) : allTasks.length === 0 ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
              color: '#6c757d',
              fontSize: '18px'
            }}>
              No tasks yet. Click "Add Task" to create one.
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {allTasks.map((task) => (
                <div
                  key={task._id}
                  style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '16px'
                    }}>
                      <div>
                        <span style={{
                          fontSize: '12px',
                          color: '#6c757d',
                          fontWeight: '600'
                        }}>
                          Task Name:
                        </span>
                        <div style={{
                          fontSize: '14px',
                          color: '#495057',
                          marginTop: '4px'
                        }}>
                          {task.taskName}
                        </div>
                      </div>

                      <div>
                        <span style={{
                          fontSize: '12px',
                          color: '#6c757d',
                          fontWeight: '600'
                        }}>
                          Sub-Task Category:
                        </span>
                        <div style={{
                          fontSize: '14px',
                          color: '#495057',
                          marginTop: '4px'
                        }}>
                          {task.subTaskCategory || 'N/A'}
                        </div>
                      </div>

                      <div>
                        <span style={{
                          fontSize: '12px',
                          color: '#6c757d',
                          fontWeight: '600'
                        }}>
                          Due Date:
                        </span>
                        <div style={{
                          fontSize: '14px',
                          color: '#495057',
                          marginTop: '4px'
                        }}>
                          {task.dueDate || 'N/A'}
                        </div>
                      </div>

                      <div>
                        <span style={{
                          fontSize: '12px',
                          color: '#6c757d',
                          fontWeight: '600'
                        }}>
                          Time Due:
                        </span>
                        <div style={{
                          fontSize: '14px',
                          color: '#495057',
                          marginTop: '4px'
                        }}>
                          {formatTime(task.timeDue)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginLeft: '20px'
                  }}>
                    <button
                      onClick={() => handleOpenTaskDialog(task)}
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
                      onClick={() => handleDeleteTask(task._id)}
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
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Dialog */}
      <Dialog
        open={openTaskDialog}
        onClose={handleCloseTaskDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Add New Task'}
          <IconButton
            aria-label="close"
            onClick={handleCloseTaskDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#495057'
              }}>
                Task Name *
              </label>
              <input
                type="text"
                value={taskFormData.taskName}
                onChange={(e) => setTaskFormData({ ...taskFormData, taskName: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#495057'
              }}>
                Sub-Task Category
              </label>
              <input
                type="text"
                value={taskFormData.subTaskCategory}
                onChange={(e) => setTaskFormData({ ...taskFormData, subTaskCategory: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#495057'
              }}>
                Due Date
              </label>
              <input
                type="date"
                value={taskFormData.dueDate}
                onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#495057'
              }}>
                Time Due
              </label>
              <input
                type="time"
                value={taskFormData.timeDue}
                onChange={(e) => setTaskFormData({ ...taskFormData, timeDue: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseTaskDialog} style={{ color: '#6c757d' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveTask}
            variant="contained"
            style={{ backgroundColor: '#6a951f', color: 'white' }}
          >
            {editingTask ? 'Update Task' : 'Add Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default TimeTracking;
