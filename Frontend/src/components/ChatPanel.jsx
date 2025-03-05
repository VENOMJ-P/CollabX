// import React, { useEffect, useRef, useState } from 'react';
// import { Send, Camera, Users, X } from 'lucide-react';
// import Markdown from "markdown-to-jsx";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { materialOceanic } from "react-syntax-highlighter/dist/esm/styles/prism"
// import { useProjectStore } from '../store/useProjectStore';
// import { useChatStore } from "../store/useChatStore";
// import ChatHeader from './ChatHeader';
// import MessageInput from './MessageInput';
// import MessageSkeleton from './MessageSkeleton';
// import { useAuthStore } from '../store/useAuthStore';
// import { formatMessageTime } from '../lib/utils';
// import { useUserPanelStore } from '../store/useUserPanelStore';
// import UserPanel from './UserPanel';
// import CodeEditor from './CodeEditor';
// import { useCodeEditor } from '../store/useCodeEditor';
// import FileExplorer from './FileExplorer';


// function jsonFormatter(message) {
//     let cleanedText = message || "";

//     try {
//         // Check if message starts and ends with JSON markers
//         cleanedText = cleanedText
//             .replace(/^```json\n/, '')  // Remove opening code block
//             .replace(/\n```\n$/, '')      // Remove closing code block
//             .trim();



//         const jsonObject = JSON.parse(cleanedText);
//         // JSON.stringify(jsonObject, null, 2); // Extract text or return formatted JSON
//         console.log(message, cleanedText, jsonObject)
//         return jsonObject;
//     } catch (error) {
//         console.error("Error parsing JSON:", error);
//         return null; // Return original text if parsing fails
//     }
// }


// const ChatPanel = () => {
//     const { getMessages, messages, isMessageLoading, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
//     const { selectedProject } = useProjectStore();
//     const { authUser } = useAuthStore();
//     const { isShowUserPanel } = useUserPanelStore();
//     const { selectedChat, setSelectedChat, setShowCodeInterface, showCodeInterface, selectedMessage, setSelectedMessage } = useCodeEditor();
//     const AI = "ai@gmail.com";

//     const messageEndRef = useRef(null);

//     useEffect(() => {
//         if (selectedProject?._id) { // Check if selectedProject exists to avoid errors
//             getMessages(selectedProject._id);
//             // fetchMessage();
//             subscribeToMessages(selectedProject._id);
//             return () => unsubscribeFromMessages();
//         }
//     }, [selectedProject?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

//     useEffect(() => {
//         if (messageEndRef.current && messages.length > 0) {
//             messageEndRef.current.scrollIntoView({ behavior: "smooth" });
//         }
//     }, [messages, isShowUserPanel]);

//     useEffect(() => {
//         // Check if a chat is selected and it's from the AI
//         if (selectedChat && selectedChat.senderId.email === AI) {
//             console.log("selectedChat", selectedChat)
//             const parsedMessage = jsonFormatter(selectedChat.text);
//             console.log("parsed", parsedMessage)
//             setSelectedMessage(parsedMessage);
//             setShowCodeInterface(true);
//         } else {
//             setShowCodeInterface(false);
//         }
//     }, [selectedChat])

//     const fetchMessage = async () => {
//         if (selectedProject?._id) { // Additional null-check for safety
//             await getMessages(selectedProject._id);
//         }
//     };

//     const handleMessageClick = (message) => {
//         setSelectedChat(message);
//     };


//     if (isMessageLoading) {
//         return (
//             <div className="flex-1 flex flex-col overflow-auto">
//                 <ChatHeader />
//                 <MessageSkeleton />
//                 <MessageInput />
//             </div>
//         );
//     }

//     function WriteAiMessage(message) {

//         const messageObject = jsonFormatter(message)
//         if (!messageObject) {
//             // If not valid JSON, just render the message as plain text.
//             return (
//                 <div className='overflow-auto rounded-sm p-2'>
//                     <p>{message}</p>
//                 </div>
//             );
//         }

//         return (
//             <div className="flex flex-col h-full">
//                 {/* Main Content */}
//                 <div className="flex-1 overflow-auto rounded-sm p-2">
//                     <Markdown
//                         options={{
//                             overrides: {
//                                 code: {
//                                     component: ({ className, children }) => {
//                                         const language = className?.replace("lang-", "") || "javascript";
//                                         return (
//                                             <SyntaxHighlighter
//                                                 style={materialOceanic} // Use your desired syntax highlighting theme
//                                                 language={language}
//                                                 PreTag="div"
//                                             >
//                                                 {children}
//                                             </SyntaxHighlighter>
//                                         );
//                                     },
//                                 },
//                             },
//                         }}
//                     >
//                     </Markdown>
//                     {messageObject && messageObject.text}
//                 </div>

//                 {/* Explorer Panel */}
//             </div>
//         );
//     }

//     return (
//         <div className="flex-1 flex flex-col overflow-auto">
//             <ChatHeader />
//             {isShowUserPanel ? (
//                 <UserPanel />
//             ) : (
//                 <>
//                     <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
//                         {messages.map((message) => (
//                             <div
//                                 key={message._id}
//                                 onClick={() => setSelectedChat(message)}
//                                 className={`chat ${message.senderId._id === authUser.data._id ? "chat-end" : "chat-start"
//                                     }`}
//                             >
//                                 <div className="chat-image avatar">
//                                     <div className="size-12 rounded-full border">
//                                         <img
//                                             src={message?.senderId.profilePic || "./avatar.png"}
//                                             alt="profile pic"
//                                         />
//                                     </div>
//                                 </div>
//                                 <div className="chat-header mb-1">
//                                     <time className="text-xs opacity-50 m-1">
//                                         {formatMessageTime(message.createdAt)}
//                                     </time>
//                                     {message.senderId?.fullName && (
//                                         <span className="text-accent font-medium rounded-md m-1">
//                                             {message.senderId.fullName}
//                                         </span>
//                                     )}
//                                 </div>


//                                 <div className="chat-bubble flex flex-col">
//                                     {message.image && (
//                                         <img
//                                             src={message.image}
//                                             alt="Attachment"
//                                             className="sm:max-w-[200px] rounded-md mb-2"
//                                         />
//                                     )}

//                                     {message.text && (
//                                         <div
//                                             className={`break-words max-w-full text-left
//                         overflow-y-auto no-scrollbar`} // Limit height and add scrolling
//                                         >
//                                             {message.senderId.email === AI ? (
//                                                 // Render markdown as JSX for AI messages
//                                                 // Render markdown as JSX with syntax highlighting
//                                                 // <Markdown
//                                                 //     options={{
//                                                 //         overrides: {
//                                                 //             code: {
//                                                 //                 component: ({ className, children }) => {
//                                                 //                     const language = className?.replace("lang-", "") || "javascript";
//                                                 //                     return (
//                                                 //                         <SyntaxHighlighter
//                                                 //                             style={materialOceanic} // Use your desired syntax highlighting theme
//                                                 //                             language={language}
//                                                 //                             PreTag="div"
//                                                 //                         >
//                                                 //                             {children}
//                                                 //                         </SyntaxHighlighter>
//                                                 //                     );
//                                                 //                 },
//                                                 //             },
//                                                 //         },
//                                                 //     }}
//                                                 // >

//                                                 //     {jsonFormatter(message)?.text || "Invalid JSON "}

//                                                 // </Markdown>
//                                                 WriteAiMessage(message.text)
//                                             ) : (
//                                                 // Render plain text for regular messages
//                                                 <p>{message.text}</p>
//                                             )}
//                                         </div>
//                                     )}
//                                 </div>

//                                 {/* Scroll reference added to the last message */}
//                                 {
//                                     messages[messages.length - 1]?._id === message._id && (
//                                         <div ref={messageEndRef} />
//                                     )
//                                 }
//                             </div>
//                         ))}
//                     </div>
//                     <MessageInput />
//                     {showCodeInterface ? (

//                         <div className="flex flex-row items-center justify-between mb-4">
//                             <h2 className="text-xl font-semibold">Coding Workspace</h2>
//                             <button
//                                 className="p-2 rounded-full hover:bg-base-200 transition-colors"
//                                 onClick={() => setShowCodeInterface(false)}
//                                 aria-label="Close"
//                             >
//                                 <X size={18} />
//                             </button>

//                             <FileExplorer />
//                             <CodeEditor />
//                         </div>
//                     ) : null}
//                 </>
//             )
//             }
//         </div >
//     );
// };

// export default ChatPanel;




import React, { useEffect, useRef, useState } from 'react';
import { Send, Camera, Users, X } from 'lucide-react';
import Markdown from "markdown-to-jsx";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialOceanic } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useProjectStore } from '../store/useProjectStore';
import { useChatStore } from "../store/useChatStore";
import ChatHeader from './ChatHeader';
import MessageInput from './MessageInput';
import MessageSkeleton from './MessageSkeleton';
import { useAuthStore } from '../store/useAuthStore';
import { formatMessageTime } from '../lib/utils';
import { useUserPanelStore } from '../store/useUserPanelStore';
import UserPanel from './UserPanel';
import CodeEditor from './CodeEditor';
import { useCodeEditor } from '../store/useCodeEditor';
import FileExplorer from './FileExplorer';


function jsonFormatter(message) {
    let cleanedText = message || "";

    try {
        // Check if message starts and ends with JSON markers
        cleanedText = cleanedText
            .replace(/^```json\n/, '')  // Remove opening code block
            .replace(/\n```\n$/, '')      // Remove closing code block
            .trim();



        const jsonObject = JSON.parse(cleanedText);
        // JSON.stringify(jsonObject, null, 2); // Extract text or return formatted JSON
        console.log(message, cleanedText, jsonObject)
        return jsonObject;
    } catch (error) {
        console.error("Error parsing JSON:", error);
        return null; // Return original text if parsing fails
    }
}


const ChatPanel = () => {
    const { getMessages, messages, isMessageLoading, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
    const { selectedProject } = useProjectStore();
    const { authUser } = useAuthStore();
    const { isShowUserPanel } = useUserPanelStore();
    const { selectedChat, setSelectedChat, setShowCodeInterface, showCodeInterface, selectedMessage, setSelectedMessage } = useCodeEditor();
    const AI = "ai@gmail.com";

    const messageEndRef = useRef(null);

    useEffect(() => {
        if (selectedProject?._id) { // Check if selectedProject exists to avoid errors
            getMessages(selectedProject._id);
            // fetchMessage();
            subscribeToMessages(selectedProject._id);
            return () => unsubscribeFromMessages();
        }
    }, [selectedProject?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

    useEffect(() => {
        if (messageEndRef.current && messages.length > 0) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isShowUserPanel]);

    useEffect(() => {
        // Check if a chat is selected and it's from the AI
        if (selectedChat && selectedChat.senderId.email === AI) {
            console.log("selectedChat", selectedChat)
            const parsedMessage = jsonFormatter(selectedChat.text);
            console.log("parsed", parsedMessage)
            setSelectedMessage(parsedMessage);
            setShowCodeInterface(true);
        } else {
            setShowCodeInterface(false);
        }
    }, [selectedChat])

    const fetchMessage = async () => {
        if (selectedProject?._id) { // Additional null-check for safety
            await getMessages(selectedProject._id);
        }
    };

    const handleMessageClick = (message) => {
        setSelectedChat(message);
    };


    if (isMessageLoading) {
        return (
            <div className="flex-1 flex flex-col overflow-auto">
                <ChatHeader />
                <MessageSkeleton />
                <MessageInput />
            </div>
        );
    }

    function WriteAiMessage(message) {

        const messageObject = jsonFormatter(message)
        if (!messageObject) {
            // If not valid JSON, just render the message as plain text.
            return (
                <div className='overflow-auto rounded-sm p-2'>
                    <p>{message}</p>
                </div>
            );
        }

        return (
            <div className="flex flex-col h-full">
                {/* Main Content */}
                <div className="flex-1 overflow-auto rounded-sm p-2">
                    <Markdown
                        options={{
                            overrides: {
                                code: {
                                    component: ({ className, children }) => {
                                        const language = className?.replace("lang-", "") || "javascript";
                                        return (
                                            <SyntaxHighlighter
                                                style={materialOceanic} // Use your desired syntax highlighting theme
                                                language={language}
                                                PreTag="div"
                                            >
                                                {children}
                                            </SyntaxHighlighter>
                                        );
                                    },
                                },
                            },
                        }}
                    >
                    </Markdown>
                    {messageObject && messageObject.text}
                </div>

                {/* Explorer Panel */}
            </div>
        );
    }

    return (
        <div className={`flex-1 flex flex-col overflow-hidden ${showCodeInterface ? "bg-base-100" : ""}`}>
            <ChatHeader />
            {isShowUserPanel ? (
                <UserPanel />
            ) : (
                <>
                    {/* Three-Column Layout */}
                    {showCodeInterface ? (
                        <div className="flex flex-row h-full">
                            {/* Chat Panel */}
                            <div className="w-1/4 bg-base-200 h-full flex flex-col">
                                {/* Scrollable Messages Area */}
                                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                    {messages.map((message) => (
                                        <div
                                            key={message._id}
                                            onClick={() => setSelectedChat(message)}
                                            className={`chat ${message.senderId._id === authUser.data._id ? "chat-end" : "chat-start"}`}
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
                                                {message.text && <p>{message.text}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Message Input - Fixed at bottom */}
                                <div className="p-4 bg-base-200">
                                    <MessageInput />
                                </div>
                            </div>

                            {/* Coding Workspace - Wrap File Explorer & Code Editor */}
                            <div className="w-3/4 flex flex-col h-full bg-base-300">
                                {/* Header with Title and Close Button */}
                                <div className="flex items-center justify-between p-4 bg-base-400">
                                    <h2 className="text-lg font-semibold">Coding Workspace</h2>
                                    <button
                                        className="p-1 rounded-full bg-base-300 hover:bg-base-200 transition-colors"
                                        onClick={() => setShowCodeInterface(false)}
                                        aria-label="Close"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                {/* Content: File Explorer & Code Editor */}
                                <div className="flex flex-1 h-full">
                                    {/* File Explorer */}
                                    <div className="w-1/3 bg-base-300 h-full p-4">
                                        <h2 className="text-md font-semibold">File Explorer</h2>
                                        <FileExplorer />
                                    </div>

                                    {/* Code Editor */}
                                    <div className="w-2/3 bg-base-200 h-full p-4">
                                        <h2 className="text-md font-semibold">Code Editor</h2>
                                        <CodeEditor />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Default Chat Layout */
                        <div className="flex-1 flex flex-col h-full">
                            {/* Scrollable Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                                {messages.map((message) => (
                                    <div
                                        key={message._id}
                                        onClick={() => setSelectedChat(message)}
                                        className={`chat ${message.senderId._id === authUser.data._id ? "chat-end" : "chat-start"}`}
                                    >
                                        <div className="chat-image avatar">
                                            <div className="size-12 rounded-full border">
                                                <img src={message?.senderId.profilePic || "./avatar.png"} alt="profile pic" />
                                            </div>
                                        </div>
                                        <div className="chat-header mb-1">
                                            <time className="text-xs opacity-50 m-1">{formatMessageTime(message.createdAt)}</time>
                                            {message.senderId?.fullName && (
                                                <span className="text-accent font-medium rounded-md m-1">
                                                    {message.senderId.fullName}
                                                </span>
                                            )}
                                        </div>
                                        <div className="chat-bubble flex flex-col">
                                            {message.text && <p>{message.text}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Message Input - Fixed at bottom */}
                            <div className="p-4 bg-base-100 border-t border-base-300">
                                <MessageInput />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );


};

export default ChatPanel;

