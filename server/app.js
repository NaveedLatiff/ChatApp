import express from "express";
import cors from "cors";
import 'dotenv/config';
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/auth.js";
import cookieParser from "cookie-parser";
import messageRouter from "./routes/message.js";
import http from "http";
import { Server } from "socket.io";
import Message from "./models/message.js"; 

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

const userSocketMap = {};

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
        userSocketMap[userId] = socket.id;
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("markMessageAsSeen", async ({ messageId, senderId, receiverId }) => {
        try {
            await Message.findByIdAndUpdate(messageId, { seen: true });

            const senderSocketId = userSocketMap[senderId];
            if (senderSocketId) {
                io.to(senderSocketId).emit("messagesSeen", {
                    seenBy: receiverId 
                });
            }
        } catch (error) {
            console.error("Error in markMessageAsSeen socket:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

app.use((req, res, next) => {
    req.io = io; 
    next();
});

const PORT = process.env.PORT || 3003;
connectDB();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use('/auth', authRouter);
app.use('/message', messageRouter);

server.listen(PORT, () => {
    console.log(`Server (with Socket.io) is running on http://localhost:${PORT}`);
});

export { app, io, server, userSocketMap };