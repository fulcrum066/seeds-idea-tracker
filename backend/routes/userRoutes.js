const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  getUser,
  updateUser,
  deleteUser,
  getUserOne,
  getUserIdByEmail,
  updateUserOne,
  manageUserOne,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

// public
router.post("/", registerUser);
router.post("/login", loginUser);

// self
router.get("/me", protect, getMe);

// admin
router.delete("/:id", protect, authorize("admin"), deleteUser);
router.get("/byEmail/:email", protect, authorize("admin"), getUserIdByEmail);
router.route("/user").get(protect, authorize("admin"), getUser);
router.route("/user/:id")
  .delete(protect, authorize("admin"), deleteUser)
  .put(protect, authorize("admin"), updateUser);
router.route("/userOne/:paramsField").get(protect, authorize("admin"), getUserOne);
router.route("/userOne/:id").put(protect, authorize("admin"), updateUserOne);
router.route("/manageUserOne/:id").put(protect, authorize("admin"), manageUserOne);

module.exports = router;
