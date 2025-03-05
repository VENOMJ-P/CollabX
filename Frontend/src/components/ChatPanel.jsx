import React, { useEffect, useRef } from 'react';
import { Send, Camera, Users } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import { useChatStore } from "../store/useChatStore";
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageSkeleton from './MessageSkeleton';
import { useAuthStore } from '../store/useAuthStore';
import { formatMessageTime } from '../lib/utils';
import { useUserPanelStore } from '../store/useUserPanelStore';
import UserPanel from './UserPanel';

const ChatPanel = () => {
    const { getMessages, messages, isMessageLoading, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
    const { selectedProject } = useProjectStore();
    const { authUser } = useAuthStore();
    const { isShowUserPanel } = useUserPanelStore();

    const messageEndRef = useRef(null);

    useEffect(() => {
        getMessages(selectedProject._id);
        fetchMessage();
        subscribeToMessages(selectedProject._id);
        return () => unsubscribeFromMessages();
    }, [selectedProject._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);  // Added dependency on selectedProject._id

    useEffect(() => {
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages, isShowUserPanel])

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
        <div className="flex-1 flex flex-col overflow-auto">
            <ChatHeader />
            {isShowUserPanel ? (
                <UserPanel />
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={message._id}
                                className={`chat ${message.senderId._id === authUser.data._id ? "chat-end" : "chat-start"
                                    }`}
                                ref={messageEndRef}
                            >
                                <div className="chat-image avatar">
                                    <div className="size-12 rounded-full border">
                                        <img
                                            src={message?.senderId.profilePic || "./avatar.png"}
                                            alt="profile pic"
                                        />
                                    </div>
                                </div>
                                <div className="chat-header mb-1">
                                    <time className="text-xs opacity-50 m-1">
                                        {formatMessageTime(message.createdAt)}
                                    </time>
                                    {message.senderId?.fullName && (
                                        <span className="text-accent font-medium rounded-md m-1">
                                            {message.senderId.fullName}
                                        </span>
                                    )}
                                </div>

                                <div className="chat-bubble flex flex-col">
                                    {message.image && (
                                        <img
                                            src={message.image}
                                            alt="Attachment"
                                            className="sm:max-w-[200px] rounded-md mb-2"
                                        />
                                    )}

                                    {/* {message.text && <p>{message.text}</p>} */}
                                    {message.text && (
                                        <p className="break-words max-w-full text-left">
                                            {message.text}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <MessageInput />
                </>
            )}

        </div>
    );

};

export default ChatPanel;

