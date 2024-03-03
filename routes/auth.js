const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controllers/authController");

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", register);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", login);

// @route   GET api/auth/logout
// @desc    Logout user
// @access  Private
router.get("/logout", logout);

module.exports = router;
