"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Axios from "../../axios";
import { useRouter, usePathname } from "next/navigation";
import { io } from "socket.io-client"
import { toast } from "react-toastify"
import Loader from "@/components/Loader"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    
    const router = useRouter()
    const pathname = usePathname()

    const connectSocket = (userId) => {
        if (socket?.connected) return;
        const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL, { 
            query: { userId },
            reconnection: true 
        });
        setSocket(newSocket);
        newSocket.on("getOnlineUsers", (users) => setOnlineUsers(users));
        return newSocket;
    };

    const disconnectSocket = () => {
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    };

    const checkAuth = async () => {
        try {
            const res = await Axios.get("/auth/check");
            if (res.data.success) {
                setUser(res.data.user);
                connectSocket(res.data.user._id);
            }
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (formData) => {
        try {
            const res = await Axios.post("/auth/login", formData);
            if (res.data.success) {
                setUser(res.data.user);
                connectSocket(res.data.user._id);
                toast.success(`Welcome back, ${res.data.user.fullName || 'User'}!`);
                router.push("/");
                return res.data;
            } else {
                toast.error(res.data.message || "Login failed");
            }
        } catch (error) {
            const msg = error.response?.data?.message || "Invalid email or password";
            toast.error(msg);
            return { success: false, message: msg };
        }
    };

    const register = async (formData) => {
        try {
            const res = await Axios.post("/auth/register", formData);
            if (res.data.success) {
                setUser(res.data.user);
                connectSocket(res.data.user._id);
                toast.success("Account created successfully!");
                router.push("/");
                return res.data;
            } else {
                toast.error(res.data.message || "Registration failed");
            }
        } catch (error) {
            const msg = error.response?.data?.message || "Registration failed. Try again.";
            toast.error(msg);
            return { success: false, message: msg };
        }
    };

    const logout = async () => {
        try {
            await Axios.post("/auth/logout");
            disconnectSocket();
            setUser(null);
            toast.info("Logged out successfully");
            router.push("/login");
        } catch (error) {
            toast.error("Logout failed");
        }
    };

    // Route Protection Logic
    useEffect(() => {
        if (!loading) {
            const publicPages = ["/login", "/signup"];
            const isPublicPage = publicPages.includes(pathname);
            if (!user && !isPublicPage) {
                router.push("/login");
            } else if (user && isPublicPage) {
                router.push("/")
            }
        }
    }, [user, loading, pathname, router]);

    return (
        <AuthContext.Provider value={{ 
            user, loading, login, register, logout, socket, onlineUsers, setUser, connectSocket 
        }}>
            {!loading ? 
            children :
            <Loader/>
            }
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);