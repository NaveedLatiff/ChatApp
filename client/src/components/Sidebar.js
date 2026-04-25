"use client"
import React, { useEffect, useState, useRef } from 'react';
import Axios from '../../axios';
import { User, MoreVertical, Settings, LogOut, Search, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const Sidebar = ({ selectedUser, setSelectedUser }) => {
    const { logout, onlineUsers, socket, user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMenu, setShowMenu] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [fullscreenImage, setFullscreenImage] = useState(null);
    
    const menuRef = useRef(null);
    const sortUsers = (userList) => {
        return [...userList].sort((a, b) => {
            const aUnseen = a.unseenCount || 0;
            const bUnseen = b.unseenCount || 0;
            return bUnseen - aUnseen;
        });
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const { data } = await Axios.get('/message/users');
                if (data.success) {
                    setUsers(sortUsers(data.users));
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError("Failed to load contacts");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (!socket) return;

   const handleUpdateNotification = ({ senderId, type }) => {
    if (type === "new_message") {
        setUsers((prevUsers) => {
            const userIndex = prevUsers.findIndex(u => u._id === senderId);
            if (userIndex === -1) return prevUsers; 
            const updatedUsers = [...prevUsers];
            const targetUser = { ...updatedUsers[userIndex] };

           if (selectedUser?._id !== senderId) {
                targetUser.unseenCount = (targetUser.unseenCount || 0) + 1;
            }

            updatedUsers.splice(userIndex, 1);

            return [targetUser, ...updatedUsers];
        });
    }
};

        socket.on("updateNotification", handleUpdateNotification);

        return () => {
            socket.off("updateNotification", handleUpdateNotification);
        };
    }, [socket, selectedUser]);

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setUsers((prevUsers) =>
            prevUsers.map((u) =>
                u._id === user._id ? { ...u, unseenCount: 0 } : u
            )
        );
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredUsers = users.filter(u => 
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="h-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-white/5 backdrop-blur-md border border-white/10 w-full border-r">
            {/* Header */}
            <div className="px-4 py-[10px] flex justify-between items-center shrink-0">
                <div 
                    className="cursor-pointer transition-transform active:scale-95 shrink-0" 
                    onClick={() => setFullscreenImage(currentUser?.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png")}
                >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-[#6a7175] flex items-center justify-center">
                        {currentUser?.profilePic ? (
                            <img src={currentUser.profilePic} className="w-full h-full object-cover" alt="Me" />
                        ) : (
                            <User className="w-6 h-6 text-[#cfd3d5]" />
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-2 relative" ref={menuRef}>
                    <button 
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 hover:bg-[#374248] rounded-full transition-colors text-[#aebac1] cursor-pointer"
                    >
                        <MoreVertical className="w-6 h-6" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 top-12 w-48 bg-black shadow-xl z-50 py-2 rounded-sm border border-[#313d45]">
                            <Link 
                                href="/profile-page" 
                                className="flex items-center gap-3 px-6 py-3 text-sm text-[#e9edef] hover:bg-[#182229] transition-colors cursor-pointer"
                            >
                                <Settings className="w-4 h-4" /> Profile
                            </Link>
                            <button 
                                onClick={logout}
                                className="w-full flex items-center gap-3 px-6 py-3 text-sm text-[#e9edef] hover:bg-[#182229] transition-colors cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Search */}
            <div className="px-3 py-2 ">
                <div className="relative flex items-center bg-zinc-900/80 rounded-lg px-3">
                    <Search className="w-4 h-4 text-[#8696a0]" />
                    <input 
                        type="text"
                        placeholder="Search or start new chat"
                        className="w-full bg-transparent border-none py-1.5 pl-4 pr-2 text-sm text-[#e9edef] outline-none placeholder-[#8696a0]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #374248; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                `}</style>
                
                {filteredUsers.length === 0 ? (
                    <div className="p-10 text-[#8696a0] text-center text-sm">
                        No chats found
                    </div>
                ) : (
                    filteredUsers.map((user) => {
                        const isOnline = onlineUsers.includes(user._id);
                        const isSelected = selectedUser?._id === user._id;

                        return (
                            <div
                                key={user._id}
                                onClick={() => handleSelectUser(user)}
                                className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors relative
                                    ${isSelected ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'}`}
                            >
                                <div className="relative shrink-0" onClick={(e) => {
                                    e.stopPropagation();
                                    setFullscreenImage(user.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png");
                                }}>
                                    <div className="w-12 h-12 rounded-full overflow-hidden hover:opacity-80 transition-all active:scale-95 bg-[#6a7175] flex items-center justify-center">
                                        {user.profilePic ? (
                                            <img src={user.profilePic} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <User className="w-7 h-7 text-[#cfd3d5]" />
                                        )}
                                    </div>
                                    {isOnline && (
                                        <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-[#00a884] border-2 border-[#111b21] rounded-full" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 border-b border-[#222d34] pb-3 pt-1">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-[#e9edef] font-normal truncate pr-2">
                                            {user.fullName}
                                        </h3>
                                        <span className="text-[12px] text-[#8696a0]">
                                            {isOnline ? "Online" : ""}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-sm text-[#8696a0] truncate flex-1 pr-2">
                                            {user.bio || "Hey there! I am using QuickChat."}
                                        </p>
                                        {user.unseenCount > 0 && !isSelected && (
                                            <span className="bg-[#00a884] text-[#111b21] text-[12px] font-bold h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full">
                                                {user.unseenCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            
            {fullscreenImage && (
                <div 
                    className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 z-[9999]"
                    onClick={() => setFullscreenImage(null)}
                >
                    <button 
                        className="absolute top-6 right-6 p-2 bg-[#202c33] rounded-full text-white hover:bg-[#313d45] transition-colors z-[10000]"
                        onClick={(e) => {
                            e.stopPropagation();
                            setFullscreenImage(null);
                        }}
                    >
                        <X className="w-6 h-6 cursor-pointer" />
                    </button>

                    <div className="relative w-full max-w-[350px] aspect-square rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
                        {fullscreenImage.includes("cdn-icons-png") ? (
                            <div className="w-full h-full bg-[#6a7175] flex items-center justify-center">
                                <User className="w-32 h-32 text-[#cfd3d5]" />
                            </div>
                        ) : (
                            <img 
                                src={fullscreenImage} 
                                alt="Preview" 
                                className="w-full h-full object-cover"
                                onClick={(e) => e.stopPropagation()} 
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;