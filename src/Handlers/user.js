const errorHandling = require("../errorHandling");
const User = require("../models/User");
const {
    generateToken,
    encryptedPassword,
    generateCustomerId
} = require("../../utils/auth");
const bcrypt = require("bcrypt");

const createUser = async (req, res) => {
    try {
        const user = new User(req?.body);

        const isUserExist = await User.findOne({ mobile: req?.body?.mobile });
        if (isUserExist) {
            return res.json({ message: "User is already exist" });
        }

        const hashPassword = encryptedPassword(user?.password);
        const customerId = generateCustomerId();
        user.customer_id = customerId;
        user.password = hashPassword;

        await user.save();
        const token = generateToken(user);
        let response = { message: "token creates successfully", token: token };
        res.status(201).json(response);
    } catch (err) {
        const errorMsg = errorHandling(err);
        console.log("error while creating new user", err.statusCode);
        res.json({ message: errorMsg });
    }
};

const signin = async (req, res) => {
    try {
        const existingUser = await User.findOne({ mobile: req?.body?.mobile });
        if (!existingUser) {
            return res.json({ message: "Username or password is incorrect" });
        }

        const isPasswordValid = await bcrypt.compare(
            req.body.password,
            existingUser.password
        );

        if (!isPasswordValid) {
            return res.json({ message: "Username or password is incorrect" });
        }

        const token = generateToken(existingUser);
        let response = { message: "Login successful", token: token };
        res.status(201).json(response);
    } catch (err) {
        const errorMsg = errorHandling(err);
        console.log("error while creating new user", err);
        res.json({ message: errorMsg });
    }
};

module.exports = {
    createUser,
    signin
};
