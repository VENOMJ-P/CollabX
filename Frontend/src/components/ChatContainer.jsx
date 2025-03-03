import React, { useEffect } from 'react';
import { Send, Camera, Users } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import { useChatStore } from "../store/useChatStore";
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageSkeleton from './MessageSkeleton';
import { useAuthStore } from '../store/useAuthStore';
import { formatMessageTime } from '../lib/utils';

const ChatPanel = () => {
    const { getMessages, messages, isMessageLoading } = useChatStore();
    const { selectedProject } = useProjectStore();
    const { authUser } = useAuthStore();

    useEffect(() => {
        fetchMessage();
    }, [selectedProject._id]);  // Added dependency on selectedProject._id

    const fetchMessage = async () => {
        await getMessages(selectedProject._id);
    };

    if (isMessageLoading) {
        return (
            <div className='flex-1 flex flex-col overflow-auto'>
                <ChatHeader />
                <MessageSkeleton />
                <MessageInput />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-auto">  {/* Fixed typo here */}
            <ChatHeader />
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {console.log("auth", authUser.data._id)}
                {messages.map((message) => (
                    <div key={message._id} className={`chat ${message.senderId._id === authUser.data._id ? "chat-end" : "chat-start"}`}>
                        <div className='chat-image avatar'>
                            <div className='size-10 rounded-full border'>
                                <img src={message?.senderId.profilePic || "./avatar.png"} alt="profile pic" />
                            </div>
                        </div>
                        <div className="chat-header mb-1">
                            <time className="text-xs opacity-50 ml-1">
                                {formatMessageTime(message.createdAt)}
                            </time>
                        </div>
                        <div className="chat-bubble flex flex-col">
                            {message.image && (
                                <img
                                    src={message.image}
                                    alt="Attachment"
                                    className="sm:max-w-[200px] rounded-md mb-2"
                                />
                            )}
                            {message.text && <p>{message.text}</p>}
                        </div>
                    </div>
                ))}
            </div>
            <MessageInput />
        </div>
    );
};

export default ChatPanel;


// import React, { useEffect, useState } from 'react';
// import { Send, Camera, Users, X } from 'lucide-react';
// import { useProjectStore } from '../store/useProjectStore';
// import { useChatStore } from "../store/useChatStore";
// import ChatHeader from './ChatHeader';
// import MessageInput from './MessageInput';
// import MessageSkeleton from './MessageSkeleton';
// import { useAuthStore } from '../store/useAuthStore';
// import { formatMessageTime } from '../lib/utils';
// import { useUserPanelStore } from '../store/useUserPanelStore';


// const UserPanel = () => {
//     const { selectedProject, users, fetchProjectUser } = useProjectStore();
//     const { showUserPanel, setShowUserPanel } = useUserPanelStore();
//     useEffect(() => {
//         fetchProjectUser(selectedProject._id);
//     }, [])
//     return (
//         <div className="w-64 bg-base-200 border-l border-base-300 p-4 overflow-y-auto">
//             <div className="flex justify-between items-center mb-4">
//                 <h3 className="font-medium">Members</h3>
//                 <button
//                     onClick={setShowUserPanel(false)}
//                     className="p-1 hover:bg-base-300 rounded-full"
//                 >
//                     <X size={16} />
//                 </button>
//             </div>
//             <div className="space-y-3">
//                 {users?.map(user => (
//                     <div key={user._id} className="flex items-center space-x-3">
//                         <div className="avatar">
//                             <div className="w-10 h-10 rounded-full border">
//                                 <img src={user.profilePic || "./avatar.png"} alt={user.username} />
//                             </div>
//                         </div>
//                         <div>
//                             <p className="font-medium text-sm">{user.username}</p>
//                             <p className="text-xs opacity-70">{user.isOnline ? "Online" : "Offline"}</p>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// // const ChatPanel = () => {
// //     const { getMessages, messages, isMessageLoading } = useChatStore();
// //     const { selectedProject } = useProjectStore();
// //     const { authUser } = useAuthStore();
// //     const { showUserPanel, setShowUserPanel } = useUserPanelStore(false);

// //     useEffect(() => {
// //         fetchMessage();
// //     }, [selectedProject._id, messages.length]);

// //     const fetchMessage = async () => {
// //         await getMessages(selectedProject._id);
// //     };

// //     const toggleUserPanel = () => {
// //         setShowUserPanel(!showUserPanel);
// //     };

// //     if (isMessageLoading) {
// //         return (
// //             <div className='flex-1 flex flex-col overflow-auto'>
// //                 <ChatHeader />
// //                 <MessageSkeleton />
// //                 <MessageInput />
// //             </div>
// //         );
// //     }

// //     return (
// //         <div className="flex-1 flex overflow-auto">
// //             <div className={`flex flex-col ${showUserPanel ? 'flex-1' : 'w-full'}`}>
// //                 <ChatHeader />
// //                 <div className="flex-1 overflow-y-auto p-4 space-y-4">
// //                     {messages.map((message) => (
// //                         <div key={message._id} className={`chat ${message.senderId._id === authUser.data._id ? "chat-end" : "chat-start"}`}>
// //                             <div className='chat-image avatar'>
// //                                 <div className='size-10 rounded-full border'>
// //                                     <img src={message?.senderId.profilePic || "./avatar.png"} alt="profile pic" />
// //                                 </div>
// //                             </div>
// //                             <div className="chat-header mb-1">
// //                                 <time className="text-xs opacity-50 ml-1">
// //                                     {formatMessageTime(message.createdAt)}
// //                                 </time>
// //                             </div>
// //                             <div className="chat-bubble flex flex-col">
// //                                 {message.image && (
// //                                     <img
// //                                         src={message.image}
// //                                         alt="Attachment"
// //                                         className="sm:max-w-[200px] rounded-md mb-2"
// //                                     />
// //                                 )}
// //                                 {message.text && <p>{message.text}</p>}
// //                             </div>
// //                         </div>
// //                     ))}
// //                 </div>
// //                 <MessageInput />
// //             </div>

// //             {showUserPanel && (
// //                 <UserPanel />
// //             )}
// //         </div>
// //     );
// // };

// // export default ChatPanel;