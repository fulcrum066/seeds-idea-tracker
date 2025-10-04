import axios from "axios";
const API_URL = "";

//-----------------------------------------------------------------------------------
//--------------------------------------GETTERS----------------------------------
//-----------------------------------------------------------------------------------

// Function to get all seeds
const getSeeds = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.get(API_URL + "/api/seeds/seed", config);
    return response.data;
  } catch (error) {
    console.error(
      "Error retrieving seeds:",
      error.response?.data || error.message
    );
    throw error;
  }
};

//-----------------------------------------------------------------------------------
//--------------------------------------CREATORS----------------------------------
//-----------------------------------------------------------------------------------

// Function to create a new seed
const createSeed = async (seedData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.post(
      API_URL + "/api/seeds/seed",
      seedData,
      config
    );
    console.log("createSeed response.data: ", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating seed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

//-----------------------------------------------------------------------------------
//--------------------------------------UPDATERS----------------------------------
//-----------------------------------------------------------------------------------

// Function to update a seed by its ID
const updateSeedById = async (seedId, seedData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.put(
      `${API_URL}/api/seeds/seed/${seedId}`,
      seedData,
      config
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating seed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

//-----------------------------------------------------------------------------------
//--------------------------------------DELETERS-------------------------------------
//-----------------------------------------------------------------------------------

// Function to delete a seed by its ID
const deleteSeedById = async (seedId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.delete(
      `${API_URL}/api/seeds/seed/${seedId}`,
      config
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting seed:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Function to toggle favorite status
const toggleFavorite = async (seedId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.put(
      `${API_URL}/api/seeds/seed/${seedId}/favorite`,
      {},
      config
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error toggling favorite:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Function to add comment to seed
const addComment = async (seedId, commentData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.post(
      `${API_URL}/api/seeds/seed/${seedId}/comment`,
      commentData,
      config
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error adding comment:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Function to delete comment from seed
const deleteComment = async (seedId, commentId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios.delete(
      `${API_URL}/api/seeds/seed/${seedId}/comment/${commentId}`,
      config
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting comment:",
      error.response?.data || error.message
    );
    throw error;
  }
};

//-----------------------------------------------------------------------------------
//--------------------------------------SEARCH---------------------------------------
//-----------------------------------------------------------------------------------

export const searchSeeds = async ({ token, q, boardId, limit = 100 }) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const params = new URLSearchParams();
  if (q) params.append("q", q);
  if (boardId) params.append("boardId", boardId);
  if (limit) params.append("limit", limit);

  const res = await axios.get(`/api/search/seeds?${params.toString()}`, config);
  return res.data;
};


const seedService = {
  createSeed,
  getSeeds,
  updateSeedById,
  deleteSeedById,
  toggleFavorite,
  addComment,
  deleteComment,
};

export default seedService;
