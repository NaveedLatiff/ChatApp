import { userSocketMap } from "../app.js";
import cloudinary from "../config/cloudinary.js";
import User from "../models/auth.js";
import Message from "../models/message.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.userId;

        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

        const usersWithCounts = await Promise.all(
            filteredUsers.map(async (user) => {
                const count = await Message.countDocuments({
                    senderId: user._id,
                    receiverId: userId,
                    seen: false
                });

                return {
                    ...user.toObject(),
                    unseenCount: count
                }
            })
        )

        return res.json({
            success: true,
            users: usersWithCounts 
        })

    } catch (err) {
        return res.json({
            success: false,
            message: `Internal Server Error: ${err.message}`
        })
    }
}

export const getMessages = async (req, res) => {
    try {
        const myId = req.userId;
        const { id: selectedUserId } = req.params;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: selectedUserId },
                { senderId: selectedUserId, receiverId: myId },
            ]
        });

        await Message.updateMany(
            { senderId: selectedUserId, receiverId: myId, seen: false }, 
            { $set: { seen: true } }
        );

        const senderSocketId = userSocketMap[selectedUserId];
        if (senderSocketId) {
            req.io.to(senderSocketId).emit("messagesSeen", {
                seenBy: myId 
            });
        }
        
        return res.json({ success: true, messages });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};


export const markAsSeen = async (req, res) => {
    try {
        const { id } = req.params;

        await Message.findByIdAndUpdate(id, { seen: true })

        return res.json({
            success: true,
            message: "Message Seen"
        })

    } catch (err) {
        return res.json({
            success: false,
            message: `Internal Server Error: ${err.message}`
        });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const senderId = req.userId;
        const { id: receiverId } = req.params;

        if (!text && !image) {
            return res.json({ success: false, message: "No content provided" });
        }

        let imageUrl;
        if (image) {
            const uploadedImage = await cloudinary.uploader.upload(image);
            imageUrl = uploadedImage.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            seen: false
        });

        const receiverSocketId = userSocketMap[receiverId];

        if (receiverSocketId) {
            req.io.to(receiverSocketId).emit("newMessage", newMessage);

            req.io.to(receiverSocketId).emit("updateNotification", {
                senderId: senderId,
                type: "new_message"
            });
        }

        return res.json({
            success: true,
            message: newMessage
        });

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}