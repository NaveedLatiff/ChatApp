"use client"
import {  Image as ImageIcon, Send, X, Loader, Smile } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import React, { useEffect, useState, useRef } from 'react';
import Axios from '../../axios';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';


const MessageInput = ({ selectedUser, setMessages }) => {
    const [text, setText] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    
    const fileInputRef = useRef(null);
    const emojiPickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const onEmojiClick = (emojiData) => {
        setText((prev) => prev + emojiData.emoji);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim() && !imagePreview) return;
        
        try {
            setIsSending(true);
            setShowEmojiPicker(false);
            const { data } = await Axios.post(`/message/send/${selectedUser._id}`, {
                text: text.trim(),
                image: imagePreview,
            });

            if (data.success) {
                setMessages((prev) => [...prev, data.message]);
                setText("");
                setImagePreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        } catch (error) {
            toast.error("Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="p-[10px] bg-white/5 backdrop-blur-md border border-white/10 shrink-0 border-t relative">
            {/* Emoji Picker Popover */}
            {showEmojiPicker && (
                <div className="absolute bottom-[70px] left-2 z-50 shadow-2xl" ref={emojiPickerRef}>
                    <EmojiPicker 
                        theme="dark" 
                        onEmojiClick={onEmojiClick}
                        skinTonesDisabled
                        searchPlaceholder="Search emoji..."
                        width={320}
                        height={400}
                    />
                </div>
            )}

            {imagePreview && (
                <div className="mb-3 relative w-24 h-24  rounded-lg border border-[#313d45]">
                    <img src={imagePreview} className="w-full h-full object-cover rounded-md" alt="" />
                    <button 
                        type="button"
                        onClick={() => setImagePreview(null)} 
                        className="absolute -top-2 -right-2 bg-[#ea5664] rounded-full p-1 shadow-lg hover:bg-[#d44a58]"
                    >
                        <X className="w-3 h-3 text-white" />
                    </button>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-3 px-2">
                <div className="flex items-center gap-2">
                    <button 
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`transition-colors ${showEmojiPicker ? 'text-[#00a884]' : 'text-[#8696a0] hover:text-[#e9edef] cursor-pointer'}`}
                    >
                        <Smile className="w-6 h-6" />
                    </button>

                    <input 
                        type="file" accept="image/*" className="hidden" ref={fileInputRef} 
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => setImagePreview(reader.result);
                                reader.readAsDataURL(file);
                            }
                        }} 
                    />
                    
                    <button 
                        type="button" onClick={() => fileInputRef.current?.click()} 
                        className="text-[#8696a0] hover:text-[#e9edef] transition-colors cursor-pointer"
                    >
                        <ImageIcon className="w-6 h-6" />
                    </button>
                </div>

                <input 
                    type="text" 
                    placeholder="Type a message" 
                    className="flex-1 bg-zinc-900/80 border-none rounded-lg py-2.5 px-4 text-[15px] text-[#d1d7db] outline-none placeholder:text-[#8696a0]" 
                    value={text} 
                    onChange={(e) => setText(e.target.value)} 
                    onFocus={() => setShowEmojiPicker(false)}
                />

                <button 
                    type="submit" 
                    disabled={isSending || (!text.trim() && !imagePreview)} 
                    className="text-[#8696a0] hover:text-[#00a884] disabled:opacity-30 cursor-pointer transition-colors"
                >
                    {isSending ? <Loader className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                </button>
            </form>
        </div>
    );
}

export default MessageInput