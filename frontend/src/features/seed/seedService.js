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
//--------------------------------------DELETERS----------------------------------
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

const seedService = {
  createSeed,
  getSeeds,
  updateSeedById,
  deleteSeedById,
};

export default seedService;
