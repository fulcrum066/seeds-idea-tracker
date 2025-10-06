const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

class UserFactory {
  static async createUser(data) {
    const { firstName, lastName, email, password } = data;

    if (!firstName || !lastName || !email || !password) {
      throw new Error("Please add all fields");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isFirstUser = (await User.countDocuments()) === 0;
    const roles = isFirstUser ? ["admin"] : ["pending"];

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      roles,
      exec: "no",
      supervisor: null,
      boards: [],
    });

    return await newUser.save();
  }
}

module.exports = UserFactory;
