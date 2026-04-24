"use client"
import React, { useEffect, useState, useRef } from 'react';
import { User, X, Loader, CheckCheck, Check, ArrowLeft, } from 'lucide-react';
import Axios from '../../axios';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import MessageInput from './MessageInput';



const ChatContainer = ({ selectedUser, setSelectedUser, messages, setMessages }) => {
    const { user: authUser, socket, onlineUsers } = useAuth();
    const [loading, setLoading] = useState(false);
    const messageEndRef = useRef(null);
    const isOnline = onlineUsers.includes(selectedUser?._id);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!socket || !selectedUser) return;

        const handleNewMessage = (newMessage) => {
            if (newMessage.senderId === selectedUser._id) {
                setMessages((prev) => [...prev, newMessage]);
                socket.emit("markMessageAsSeen", {
                    messageId: newMessage._id,
                    senderId: newMessage.senderId,
                    receiverId: authUser._id
                });
            }
        };

        const handleMessagesSeen = ({ seenBy }) => {
            if (seenBy === selectedUser._id) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.senderId === authUser?._id ? { ...msg, seen: true } : msg
                    )
                );
            }
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("messagesSeen", handleMessagesSeen);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("messagesSeen", handleMessagesSeen);
        };
    }, [socket, selectedUser?._id, authUser?._id, setMessages]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedUser?._id) return;
            try {
                setLoading(true);
                const { data } = await Axios.get(`/message/${selectedUser._id}`);
                if (data.success) setMessages(data.messages || []);
            } catch (err) {
                toast.error("Could not load messages");
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, [selectedUser?._id, setMessages]);

    return (
        <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden relative">
            <header className="h-[59px] min-h-[59px] px-4  flex items-center justify-between shrink-0 z-20 bg-white/5 backdrop-blur-md border border-white/10">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={() => setSelectedUser(null)}
                        className="md:hidden p-1 -ml-2 text-[#8696a0] hover:bg-[#2a3942] cursor-pointer rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-[#6a7175] overflow-hidden shrink-0">
                        {selectedUser.profilePic ? (
                            <img src={selectedUser.profilePic} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#cfd3d5]">
                                <User className="w-6 h-6" />
                            </div>
                        )}
                    </div>

                    <div className="min-w-0">
                        <h3 className="text-[16px] font-normal text-[#e9edef] truncate leading-tight">
                            {selectedUser.fullName}
                        </h3>
                        <p className={`text-[12px] ${isOnline ? 'text-[#00a884]' : 'text-[#8696a0]'}`}>
                            {isOnline ? "online" : "offline"}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 text-[#8696a0] hover:bg-[#2a3942] rounded-full transition-all group cursor-pointer"
                    title="Close chat"
                >
                    <X className="w-5 h-5 group-hover:text-[#ea5664]" />
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar-style relative bg-white/5 backdrop-blur-md border border-white/10 ">

                <style jsx>{`
                    .custom-scrollbar-style::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar-style::-webkit-scrollbar-thumb { background: #374248; }
                `}</style>

                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader />
                    </div>
                ) : (
                    <div className="relative z-10 flex flex-col gap-1">
                        {messages.map((msg) => {
                            const isMe = msg.senderId === authUser?._id;
                            return (
                                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                                    <div className={`max-w-[85%] md:max-w-[65%] px-2 py-1.5 rounded-lg shadow-sm relative ${isMe ? 'bg-[#005c4b] text-[#e9edef]' : 'bg-[#202c33] text-[#e9edef]'
                                        }`}>
                                        {msg.image && (
                                            <img src={msg.image} className="rounded-md mb-1 max-h-72 w-full object-cover" alt="attachment" />
                                        )}
                                        {msg.text && (
                                            <p className="text-[14.2px] leading-relaxed pr-12 break-words">{msg.text}</p>
                                        )}
                                        <div className="absolute bottom-1 right-1.5 flex items-center gap-1 min-w-[40px] justify-end">
                                            <span className="text-[10px] text-[#8696a0] font-light">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                            </span>
                                            {isMe && (
                                                msg.seen
                                                    ? <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                                                    : <Check className="w-3.5 h-3.5 text-[#8696a0]" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div ref={messageEndRef} className="pb-2" />
            </main>
            <MessageInput selectedUser={selectedUser} setMessages={setMessages} />
        </div>
    );
};

export default ChatContainer;