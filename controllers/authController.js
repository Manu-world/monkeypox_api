const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const {
  registerValidation,
  loginValidation,
} = require("../services/userService");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// User registration
exports.register = async (req, res, next) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user);

    res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    next(error);
  }
};

// User login
exports.login = async (req, res, next) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = generateToken(user);

    res.status(200).json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    next(error);
  }
};

// User logout
exports.logout = (req, res) => {
  res.status(200).json({ message: "Logout successful" });
};
