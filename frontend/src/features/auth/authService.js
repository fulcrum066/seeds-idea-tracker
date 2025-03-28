import axios from "axios";

const API_URL = "/api/users/";

// Register user
const register = async (userData) => {
  const response = await axios.post(API_URL, userData);

  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }

  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await axios.post(API_URL + "login", userData);

  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }

  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem("user");
};

// Delete user
// const deleteUser = async (userId, token) => {
//   const config = {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   }

//   const response = await axios.delete(API_URL + userId, config)

//   localStorage.removeItem('user')

//   window.location.reload();

//   return response.data
// }

//-----------------------------------------------------------------------------------
//--------------------------------------GETTERS----------------------------------
//-----------------------------------------------------------------------------------

const getUser = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get("/api/users/user", config);

  return response.data;
};

const getMe = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get("/api/users/me", config);

  return response.data;
};

// Function to get organization chart data
const getOrgChart = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  try {
    // Make a GET request to fetch organization chart data
    const response = await axios.get(API_URL + "orgchart", config);

    // Return the organization chart data from the response
    return response.data;
  } catch (error) {
    // Handle any errors that occur during the request
    console.error("Error getting organization chart:", error);
    throw error;
  }
};

//-----------------------------------------------------------------------------------
//--------------------------------------UPDATERS----------------------------------
//-----------------------------------------------------------------------------------

const updateUser = async (user, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put("/api/users/user/" + user._id, user, config);

  return response.data;
};

//-----------------------------------------------------------------------------------
//--------------------------------------DELETERS----------------------------------
//-----------------------------------------------------------------------------------

const deleteUser = async (userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete("/api/users/user/" + userId, config);

  return response.data;
};

//-----------------------------------------------------------------------------------
//--------------------------------------GET ONES----------------------------------
//-----------------------------------------------------------------------------------

const getUserOne = async (paramsField, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get("/api/users/userOne/" + paramsField, config);

  return response.data;
};

//-----------------------------------------------------------------------------------
//--------------------------------------UPDATE ONES----------------------------------
//-----------------------------------------------------------------------------------

const updateUserOne = async (userOne, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(
    "/api/users/userOne/" + userOne._id,
    userOne,
    config
  );

  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }

  return response.data;
};

const manageUserOne = async (userOne, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(
    "/api/users/manageUserOne/" + userOne._id,
    userOne,
    config
  );

  console.log(response.data);

  return response.data;
};

const authService = {
  register,
  logout,
  login,
  deleteUser,
  getUser,
  getMe,
  updateUser,
  getUserOne,
  updateUserOne,
  manageUserOne,
  getOrgChart,
};

export default authService;
