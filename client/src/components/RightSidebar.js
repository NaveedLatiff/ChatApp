"use client"
import React, { useState } from 'react';
import { User, ChevronRight, Image as ImageIcon, X } from 'lucide-react'; 

const RightSidebar = ({ selectedUser, messages = [] }) => {
    const [fullscreenImage, setFullscreenImage] = useState(null); 
    const sharedMedia = messages.filter(msg => msg.image && msg.image.trim() !== "");

    return (
        <div className="hidden lg:flex flex-col w-full border-l border-[#313d45] h-full overflow-hidden">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-[14px] flex items-center shrink-0">
                <h2 className="text-[#e9edef] text-base font-normal">Contact info</h2>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white/5 backdrop-blur-md border border-white/10">
                <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: #374248; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                `}</style>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 py-7 px-4 flex flex-col items-center text-center mb-2 shadow-sm">
                    <div className="w-48 h-48 rounded-full overflow-hidden mb-4 cursor-pointer bg-[#6a7175]">
                        {selectedUser.profilePic ? (
                            <img src={selectedUser.profilePic} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className="w-24 h-24 text-[#cfd3d5]" />
                            </div>
                        )}
                    </div>
                    <h2 className="text-xl font-normal text-[#e9edef] truncate w-full px-2">{selectedUser.fullName}</h2>
                    <p className="text-[#8696a0] text-sm mt-1 truncate w-full px-2">{selectedUser.email}</p>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 mb-2 shadow-sm">
                    <h3 className="text-sm text-[#8696a0] mb-3">About</h3>
                    <div className="text-[#e9edef] text-[15px] leading-relaxed break-words">
                        {selectedUser.bio || "Hey there! I am using QuickChat."}
                    </div>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 mb-2 shadow-sm pb-2">
                    <button className="w-full p-4 flex items-center justify-between hover:bg-[#202c33] transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <ImageIcon className="w-5 h-5 text-[#8696a0] group-hover:text-[#00a884]" />
                            <span className="text-[#e9edef] text-[15px]">Media, links and docs</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-sm text-[#8696a0]">{sharedMedia.length}</span>
                            <ChevronRight className="w-5 h-5 text-[#8696a0]" />
                        </div>
                    </button>
                    
                    <div className="px-4">
                        {sharedMedia.length > 0 ? (
                            <div className="grid grid-cols-3 gap-1.5">
                                {sharedMedia.slice(0, 6).map((msg) => (
                                    <div key={msg._id} className="aspect-square bg-[#202c33] rounded-sm overflow-hidden cursor-pointer">
                                        <img 
                                            src={msg.image} 
                                            onClick={() => setFullscreenImage(msg.image)} // Open on click
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" 
                                            alt="Shared media" 
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-[#8696a0] text-sm py-2 px-1">No media shared yet</div>
                        )}
                    </div>
                </div>
            </div>

            {fullscreenImage && (
                <div 
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setFullscreenImage(null)}
                >
                    <button 
                        className="absolute top-6 right-6 p-2 bg-[#202c33] rounded-full text-white hover:bg-[#313d45] transition-colors"
                        onClick={() => setFullscreenImage(null)}
                    >
                        <X className="w-6 h-6 cursor-pointer" />
                    </button>
                    <img 
                        src={fullscreenImage} 
                        alt="Full size" 
                        className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}
        </div>
    );
};

export default RightSidebar;