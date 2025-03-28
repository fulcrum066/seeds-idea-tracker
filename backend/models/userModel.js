const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please add a name"],
    },
    lastName: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: false,
    },
    companyRoles: [
      {
        ref: {
          type: mongoose.Schema.Types.ObjectId,
        },
        role: {
          type: String,
          required: true,
        },
        managementLevel: {
          type: Number,
        },
      },
    ],
    exec: {
      type: String,
      required: false,
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    roles: {
      type: Array,
      required: [true, "Please add a role"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
