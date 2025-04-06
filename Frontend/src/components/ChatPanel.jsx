import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import Markdown from "markdown-to-jsx";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialOceanic } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useProjectStore } from "../store/useProjectStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { useUserPanelStore } from "../store/useUserPanelStore";
import UserPanel from "./UserPanel";
import CodeEditor from "./CodeEditor";
import { useCodeEditor } from "../store/useCodeEditor";
import FileExplorer from "./FileExplorer";

function jsonFormatter(message) {
  try {
    const jsonObject = JSON.parse(message);
    // console.log("JSON Message", message, jsonObject);
    return jsonObject;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    console.log("Original message:", message);
    return null;
  }
}

const ChatPanel = () => {
  const {
    getMessages,
    messages,
    isMessageLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { selectedProject } = useProjectStore();
  const { authUser } = useAuthStore();
  const { isShowUserPanel } = useUserPanelStore();
  const {
    selectedChat,
    setSelectedChat,
    setShowCodeInterface,
    showCodeInterface,
    setSelectedMessage,
    removeFiles,
  } = useCodeEditor();
  const AI = "ai@gmail.com";

  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedProject?._id) {
      getMessages(selectedProject._id);
      subscribeToMessages(selectedProject._id);
      return () => unsubscribeFromMessages();
    }
  }, [
    selectedProject?._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isShowUserPanel]);

  useEffect(() => {
    // Check if a chat is selected and it's from the AI
    if (
      selectedChat &&
      selectedChat.senderId &&
      selectedChat.senderId.email === AI
    ) {
      // console.log("selectedChat", selectedChat);
      const parsedMessage = jsonFormatter(selectedChat.text);
      console.log("parsed", parsedMessage);
      setSelectedMessage(parsedMessage);
      setShowCodeInterface(true);
    } else {
      setShowCodeInterface(false);
      setSelectedMessage(null);
      setSelectedChat(null);
    }
  }, [
    selectedChat,
    setShowCodeInterface,
    setSelectedChat,
    setSelectedMessage,
    AI,
  ]);

  if (isMessageLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  function WriteAiMessage({ text }) {
    const jsonData = jsonFormatter(text);

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto rounded-sm p-2">
          <Markdown
            options={{
              overrides: {
                code: {
                  component: ({ className, children }) => {
                    const language =
                      className?.replace("lang-", "") || "javascript";
                    return (
                      <SyntaxHighlighter
                        style={materialOceanic}
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
            {jsonData?.text || "Invalid JSON"}
          </Markdown>
        </div>
      </div>
    );
  }

  const handleMessageClick = (message) => {
    if (message.senderId.email !== AI) return;
    if (selectedChat && selectedChat._id === message._id) {
      // If clicking the same message that's already selected, toggle code interface

      setShowCodeInterface(!showCodeInterface);
    } else {
      // If clicking a different message, select it (which will open code interface via useEffect if AI message)

      setSelectedChat(null);
      setSelectedMessage(null);
      removeFiles();
      setSelectedChat(message);
    }
  };

  const handleCodeEditor = () => {
    setSelectedChat(null);
    setSelectedMessage(null);
    removeFiles();
    setShowCodeInterface(!showCodeInterface);
  };

  return (
    <div
      className={`flex-1 flex flex-col overflow-hidden ${
        showCodeInterface ? "bg-base-100" : ""
      }`}
    >
      <ChatHeader />
      {isShowUserPanel ? (
        <UserPanel />
      ) : (
        <>
          {showCodeInterface ? (
            <div className="flex flex-row h-full ">
              {/* Chat Panel */}
              <div className="w-1/4 bg-base-200 h-full flex flex-col  border-r border-base-300 ">
                <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      onClick={() => handleMessageClick(message)}
                      className={`chat ${
                        message.senderId._id === authUser.data._id
                          ? "chat-end"
                          : "chat-start"
                      }`}
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
                        {message.text && (
                          <div
                            className={`break-words max-w-full text-left 
                                                        overflow-y-auto no-scrollbar`}
                          >
                            {message.senderId.email === AI ? (
                              <WriteAiMessage text={message.text} />
                            ) : (
                              <p>{message.text}</p>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Scroll reference added to the last message */}
                      {messages[messages.length - 1]?._id === message._id && (
                        <div ref={messageEndRef} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Message Input - Fixed at bottom */}
                <div className="p-4 bg-base-200">
                  <MessageInput />
                </div>
              </div>

              {/* Coding Workspace */}
              <div className="w-3/4 flex flex-col h-full bg-base-300">
                {/* Header */}
                <div className="flex items-center justify-between p-2  border-b border-base-300 bg-base-100 ">
                  <h2 className="text-lg font-semibold">Coding Workspace</h2>
                  <button
                    className="p-1 rounded-full bg-base-300 hover:bg-base-200 transition-colors"
                    onClick={() => handleCodeEditor()}
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex flex-1 h-full">
                  {/* File Explorer */}
                  <div className="w-1/3 bg-base-300 h-full p-4 no-scrollbar border-r border-base-300">
                    {/* <h2 className="text-md font-semibold">File Explorer</h2> */}
                    <FileExplorer />
                  </div>

                  {/* Code Editor */}
                  <div className="w-2/3 bg-base-200 h-full p-4 no-scrollbar border-l border-base-300">
                    {/* <h2 className="text-md font-semibold">Code Editor</h2> */}
                    <CodeEditor />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Default Chat Layout */
            <div className="flex-1 flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    onClick={() => handleMessageClick(message)}
                    className={`chat ${
                      message.senderId._id === authUser.data._id
                        ? "chat-end"
                        : "chat-start"
                    }`}
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
                      {message.text && (
                        <div
                          className={`break-words max-w-full text-left overflow-y-auto no-scrollbar`}
                        >
                          {message.senderId.email === AI ? (
                            <WriteAiMessage text={message.text} />
                          ) : (
                            <p>{message.text}</p>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Scroll reference added to the last message */}
                    {messages[messages.length - 1]?._id === message._id && (
                      <div ref={messageEndRef} />
                    )}
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
