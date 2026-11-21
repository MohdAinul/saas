import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import trycatch from "../middlewares/trycatch.js";
import User from "../models/User.js";

//  New Account  (Register)
export const registerUser = trycatch(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Please fill all fields",
    });
  }

  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SEC, {
    expiresIn: "15d",
  });

  res.status(201).json({
    message: "User Registered",
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

// Account (Login)
export const loginUser = trycatch(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(400).json({
      message: "Invalid email or password",
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      message: "Invalid email or password",
    });
  }

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SEC, {
    expiresIn: "15d",
  });

  res.json({
    message: "User Logged in",
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

export const myProfile = trycatch(async (req, res) => {
  const user = req.user;
  res.json(user);
});
