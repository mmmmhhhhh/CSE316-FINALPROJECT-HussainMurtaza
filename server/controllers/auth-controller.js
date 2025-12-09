const auth = require('../auth');
const dbManager = require('../db');
const bcrypt = require('bcryptjs');

getLoggedIn = async (req, res) => {
    try {
        let userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(200).json({
                loggedIn: false,
                user: null,
                errorMessage: "?"
            });
        }

        const loggedInUser = await dbManager.findUserById(userId);
        console.log("loggedInUser: " + JSON.stringify(loggedInUser));

        return res.status(200).json({
            loggedIn: true,
            user: {
                firstName: loggedInUser.firstName,
                lastName: loggedInUser.lastName,
                userName: loggedInUser.userName || '',
                email: loggedInUser.email,
                avatar: loggedInUser.avatar || ''
            }
        });
    } catch (err) {
        console.log("err: " + err);
        res.json(false);
    }
};

loginUser = async (req, res) => {
    console.log("loginUser");
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }

        const existingUser = await dbManager.findUserByEmail(email);
        console.log("existingUser: " + JSON.stringify(existingUser));
        if (!existingUser) {
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong email or password provided."
                });
        }

        console.log("provided password: " + password);
        const passwordCorrect = await bcrypt.compare(password, existingUser.passwordHash);
        if (!passwordCorrect) {
            console.log("Incorrect password");
            return res
                .status(401)
                .json({
                    errorMessage: "Wrong email or password provided."
                });
        }

        // LOGIN THE USER
        const userId = existingUser._id || existingUser.id;
        const token = auth.signToken(userId);
        console.log(token);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        }).status(200).json({
            success: true,
            user: {
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                userName: existingUser.userName || '',
                email: existingUser.email,
                avatar: existingUser.avatar || ''
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
};

logoutUser = async (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: false,
        sameSite: "lax"
    }).status(200).send();
};

registerUser = async (req, res) => {
    console.log("REGISTERING USER IN BACKEND");
    try {
        const { firstName, lastName, userName, email, password, passwordVerify, avatar } = req.body;
        console.log("create user: " + firstName + " " + lastName + " " + email);
        
        if (!firstName || !lastName || !email || !password || !passwordVerify) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }
        console.log("all fields provided");
        
        if (password.length < 8) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter a password of at least 8 characters."
                });
        }
        console.log("password long enough");
        
        if (password !== passwordVerify) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter the same password twice."
                });
        }
        console.log("password and password verify match");
        
        const existingUser = await dbManager.findUserByEmail(email);
        console.log("existingUser: " + JSON.stringify(existingUser));
        if (existingUser) {
            return res
                .status(400)
                .json({
                    success: false,
                    errorMessage: "An account with this email address already exists."
                });
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);
        console.log("passwordHash: " + passwordHash);

        const savedUser = await dbManager.createUser({ 
            firstName, 
            lastName,
            userName: userName || '',
            email, 
            passwordHash,
            avatar: avatar || ''
        });
        console.log("new user saved: " + (savedUser._id || savedUser.id));

        // LOGIN THE USER
        const userId = savedUser._id || savedUser.id;
        const token = auth.signToken(userId);
        console.log("token:" + token);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        }).status(200).json({
            success: true,
            user: {
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                userName: savedUser.userName || '',
                email: savedUser.email,
                avatar: savedUser.avatar || ''
            }
        });

        console.log("token sent");

    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
};

updateUser = async (req, res) => {
    console.log("UPDATING USER");
    try {
        let userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(401).json({
                success: false,
                errorMessage: "Not authenticated"
            });
        }

        const { firstName, lastName, userName, currentPassword, newPassword, avatar } = req.body;

        const existingUser = await dbManager.findUserById(userId);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                errorMessage: "User not found"
            });
        }

        // If changing password, verify current password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    errorMessage: "Current password required to change password"
                });
            }

            const passwordCorrect = await bcrypt.compare(currentPassword, existingUser.passwordHash);
            if (!passwordCorrect) {
                return res.status(401).json({
                    success: false,
                    errorMessage: "Current password is incorrect"
                });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    errorMessage: "New password must be at least 8 characters"
                });
            }

            // Hash new password
            const saltRounds = 10;
            const salt = await bcrypt.genSalt(saltRounds);
            existingUser.passwordHash = await bcrypt.hash(newPassword, salt);
        }

        // Update fields
        if (firstName) existingUser.firstName = firstName;
        if (lastName) existingUser.lastName = lastName;
        if (userName !== undefined) existingUser.userName = userName;
        if (avatar !== undefined) existingUser.avatar = avatar;

        await existingUser.save();

        return res.status(200).json({
            success: true,
            user: {
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                userName: existingUser.userName || '',
                email: existingUser.email,
                avatar: existingUser.avatar || ''
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            errorMessage: "Server error"
        });
    }
};

module.exports = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser,
    updateUser
};
