const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, roles } = req.body;
  console.log("Register user", req.body);

  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Check if the User model is empty
  const isFirstUser = (await User.countDocuments()) === 0;

  // Set roles based on whether this is the first user
  let r = isFirstUser ? ["admin"] : ["pending"];

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    roles: r,
    exec: "no",
    supervisor: null,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: user.roles,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log("Login user", req.body);

  // Check for user email
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roles: user.roles,
      token: generateToken(user._id),
      supervisor: user.supervisor,
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
});

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "9000d",
  });
};

// // @desc    Delete user
// // @route   DELETE /api/users/:id
// // @access  Private
// const deleteUser = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.params.id)

//   // Check for user
//   if (!req.user) {
//     res.status(401)
//     throw new Error('User not found')
//   }

//   await user.remove()

//   res.status(200).json({ id: req.params.id })
// })

//-----------------------------------------------------------------------------------
//--------------------------------------GETTERS----------------------------------
//-----------------------------------------------------------------------------------

const getUser = asyncHandler(async (req, res) => {
  const user = await User.find({}); //user: req.user.id
  res.status(200).json(user);
});

//-----------------------------------------------------------------------------------
//--------------------------------------UPDATERS----------------------------------
//-----------------------------------------------------------------------------------

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById({ _id: req.params.id });

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error("User not found");
  }

  // Make sure the logged in user matches the user user
  //  if (user.user.toString() !== req.user.id) {
  //    res.status(401)
  //    throw new Error('User not authorized')
  //  }

  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json(updatedUser);
});

//-----------------------------------------------------------------------------------
//--------------------------------------DELETERS----------------------------------
//-----------------------------------------------------------------------------------

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error("User not found");
  }

  await user.remove();

  res.status(200).json({ id: req.params.id, myId: req.user.id });
});

//-----------------------------------------------------------------------------------
//--------------------------------------GET ONES----------------------------------
//-----------------------------------------------------------------------------------

const getUserOne = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        $expr: {
          $eq: [
            "$user",
            {
              $toObjectId: req.params.paramsField,
            },
          ],
        },
      },
    },
  ]);

  const userOne = await user.find((obj) => obj.user == req.user.id);

  res.status(200).json(userOne);
});

//-----------------------------------------------------------------------------------
//--------------------------------------UPDATE ONES----------------------------------
//-----------------------------------------------------------------------------------

const updateUserOne = asyncHandler(async (req, res) => {
  var { _id, firstName, lastName, email, password: pw, roles } = req.body;

  var password = "";

  const userOne = await User.find({ _id: _id });

  if (!userOne) {
    res.status(400);
    throw new Error("UserOne not found");
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error("User not found");
  }

  console.log("Password: " + pw);

  if (pw == "") {
    password = userOne.password;
  } else {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(pw, salt);
  }

  var combined = { _id, firstName, lastName, email, password, roles };

  const updatedUserOne = await User.findByIdAndUpdate(_id, combined, {
    new: true,
  });

  // Check for user email

  if (updatedUserOne) {
    res.json({
      _id: updatedUserOne.id,
      firstName: updatedUserOne.firstName,
      lastName: updatedUserOne.lastName,
      email: updatedUserOne.email,
      roles: updatedUserOne.roles,
      token: generateToken(req.params.id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid credentials");
  }
});

const manageUserOne = asyncHandler(async (req, res) => {
  var {
    _id,
    roles: rolesBeforeFilter,
    exec,
    supervisor: ss,
    removedRole,
    phoneNumber,
    companyRole,
    managementLevel,
    ref,
  } = req.body;
  console.log("Received user", req.body);
  var supervisor = ss;

  if (supervisor == "") {
    supervisor = null;
  }

  const userOne = await User.findOne({ _id: _id });

  if (!userOne) {
    res.status(400);
    throw new Error("UserOne not found");
  }

  // Check for user
  if (!req.user) {
    res.status(401);
    throw new Error("User not found");
  }

  // Remove unwanted roles
  var roles = rolesBeforeFilter.filter(
    (role) => !removedRole.includes(role) && role !== ""
  );

  const isPhoneNumberEmpty = !phoneNumber || phoneNumber.trim() === "";

  // Create the new company role object
  const newCompanyRole = { ref, role: companyRole, managementLevel };

  const user1 = userOne;

  // Filter out the existing companyRole if it matches
  const updatedCompanyRoles = user1.companyRoles.filter(
    (cr) => cr.role !== companyRole
  );

  // Add the new companyRole object if companyRole is provided
  if (companyRole) {
    updatedCompanyRoles.push(newCompanyRole);
  }

  var combined = {
    _id,
    roles,
    exec,
    supervisor,
    ...(isPhoneNumberEmpty ? {} : { phoneNumber }), // Include phoneNumber only if it's not empty
    companyRoles: updatedCompanyRoles, // Updated field to companyRoles
  };

  // Check if the roles array has changed
  const rolesChanged = JSON.stringify(user1.roles) !== JSON.stringify(roles);

  // Update the user only if roles have changed
  if (rolesChanged) {
    const updatedUserOne = await User.findByIdAndUpdate(_id, combined, {
      new: true,
    });

    if (updatedUserOne) {
      res.status(200).json(updatedUserOne);
    } else {
      res.status(400);
      throw new Error("Invalid credentials");
    }
  } else {
    res.status(200).json(user1); // Return the current user without updating
  }
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  deleteUser,
  getUser,
  updateUser,
  deleteUser,
  getUserOne,
  updateUserOne,
  manageUserOne,
};
