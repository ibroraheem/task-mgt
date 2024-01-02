const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('../utils/nodemailerConfig');
require('dotenv').config();

const signup = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username is already taken' });
        }
        const newUser = new User({ username, password, email });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(422).json({ message: "username and password are required" });
    const user = await User.findOne({ username });
    if (!user) return res.status(403).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(403).json({ message: "Invalid Password" })
    const token = jwt.sign({ sub: user._id }, process.env.SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: "Login Successful", username: user.username, token });
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        const appLink = 'https://rose-agreeable-rhinoceros.cyclic.app'
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a unique reset token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Save the token and expiration time in the user's document
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
        await user.save();

        // Send a password reset email with the reset link
        const resetLink = `${appLink}/${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Password Reset',
            text: `Click the following link to reset your password: ${resetLink}`,
        };

        await nodemailer.sendMail(mailOptions);

        return res.status(200).json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        const user = await User.findOne({ resetPasswordToken: resetToken, resetPasswordExpires: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }


        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { signup, login, forgotPassword, resetPassword };
