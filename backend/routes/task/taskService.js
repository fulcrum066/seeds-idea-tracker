import axios from "axios";
const API_URL = "";

//-----------------------------------------------------------------------------------
//--------------------------------------GETTERS----------------------------------
//-----------------------------------------------------------------------------------

// Function to get all tasks for a seed
const getTasksForSeed = async (seedId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.get(API_URL + `/api/tasks/seed/${seedId}`, config);
    return response.data;
  } catch (error) {
    console.error(
      "Error retrieving tasks:",
      error.response?.data || error.message
    );
    throw error;
  }
};

//-----------------------------------------------------------------------------------
//--------------------------------------CREATORS----------------------------------
//-----------------------------------------------------------------------------------

// Function to create a new task
const createTask = async (taskData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.post(
      API_URL + "/api/tasks",
      taskData,
      config
    );
    console.log("createTask response.data: ", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating task:",
      error.response?.data || error.message
    );
    throw error;
  }
};

//-----------------------------------------------------------------------------------
//--------------------------------------UPDATERS----------------------------------
//-----------------------------------------------------------------------------------

// Function to update a task by its ID
const updateTaskById = async (taskId, taskData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.put(
      `${API_URL}/api/tasks/${taskId}`,
      taskData,
      config
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating task:",
      error.response?.data || error.message
    );
    throw error;
  }
};

//-----------------------------------------------------------------------------------
//--------------------------------------DELETERS----------------------------------
//-----------------------------------------------------------------------------------

// Function to delete a task by its ID
const deleteTaskById = async (taskId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.delete(
      `${API_URL}/api/tasks/${taskId}`,
      config
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting task:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const taskService = {
  createTask,
  getTasksForSeed,
  updateTaskById,
  deleteTaskById,
};

export default taskService;