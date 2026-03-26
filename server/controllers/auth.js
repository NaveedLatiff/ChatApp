import jwt from "jsonwebtoken";
import User from "../models/auth.js";
import bcrypt from 'bcryptjs'
import cloudinary from "../config/cloudinary.js";

export const register = async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password ) { 
        return res.json({ success: false, message: "Please Fill In All The Fields" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User Already Exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            fullName, 
            email, 
            password: hashedPassword,
            
        });

        const token = jwt.sign({ id: user._id }, process.env.SESSION_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({
            success: true,
            message: "User Registered Successfully",
            user 
        });

    } catch (err) {
        res.json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.json({
            success: false,
            message: "Please Fill In All The Fields"
        })
    }
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.json({
                success: false,
                message: "Invalid Email"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.json({
                success: false,
                message: "Invalid Password"
            })
        }

        const token = jwt.sign({ id: user._id }, process.env.SESSION_SECRET, { expiresIn: '7d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.json({
            success: true,
            message: "Login Successfully",
            user
        })

    } catch (err) {
        res.json({
            success: false,
            message: "Internal Server Error"
        })
    }

}


export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',

        })
        return res.json({
            success: true,
            message: "Logout Successfully"
        })

    } catch (err) {
        return res.json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const isAuthenticated = async (req, res) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.json({
                success: false,
                message: "User ID not found"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        return res.json({
            success: true,
            message: "You are Authorized",
            user
        });
    } catch (err) {
        return res.json({
            success: false,
            message: `Internal Server Error: ${err.message}`
        });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { profilePic, fullName, bio } = req.body;
        
        let updateData = { fullName, bio };

        if (profilePic) {
            const uploadResponse = await cloudinary.uploader.upload(profilePic, {
                folder: "chatapp-profileImages", 
            });
            updateData.profilePic = uploadResponse.secure_url;
        }

        // 2. Update the user in one clean go
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.json({
            success: true,
            user: updatedUser
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: `Internal Server Error: ${err.message}`
        });
    }
};
