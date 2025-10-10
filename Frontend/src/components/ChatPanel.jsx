import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
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
  if (!message) {
    console.warn('Invalid message for parsing:', message);
    return { text: 'No content available' };
  }

  // Handle direct JavaScript object
  if (typeof message === 'object' && !Array.isArray(message)) {
    if (message.text && message.fileTree) {
      // Already in expected format
      return message;
    }
    // Fallback: assume top-level keys are filenames with code as values
    const fileTree = {};
    let language = 'javascript';
    let description = 'Generated code snippet';
    for (const [key, value] of Object.entries(message)) {
      if (key.endsWith('.cpp') || key.endsWith('.c') || key.endsWith('.java') || key.endsWith('.py') || key.endsWith('.js') || key.endsWith('.jsx') || key.endsWith('.html') || key.endsWith('.css') || key.endsWith('.json')) {
        fileTree[key] = { file: { contents: value } };
        language = key.split('.').pop().toLowerCase();
        description = `Generated ${language} code`;
      }
    }
    const buildCommand = message.buildCommand || { mainItem: null, commands: [] };
    const startCommand = message.startCommand || { mainItem: null, commands: [] };
    return {
      text: message.text || description,
      fileTree: Object.keys(fileTree).length > 0 ? fileTree : undefined,
      buildCommand,
      startCommand
    };
  }

  // Handle string input (JSON or code block)
  if (typeof message !== 'string') {
    console.warn('Expected string or object, got:', typeof message);
    return { text: String(message) || 'No content available' };
  }

  // Helper to extract content from Markdown code blocks (e.g., ```json
  const extractFromMarkdown = (text) => {
    const match = text.match(/```(\w+)?\s*\n([\s\S]*?)\n```/i);
    if (match) {
      const lang = match[1]?.toLowerCase();
      const content = match[2].trim();
      if (lang === 'json') {
        // Try parsing as JSON if marked as such
        try {
          return JSON.parse(content);
        } catch {
          return content;
        }
      }
      return { lang, content };
    }
    return { content: text.trim() };
  };

  // Helper to detect language from code keywords
  const detectLanguage = (code) => {
    const codeLower = code.toLowerCase();
    if (codeLower.includes('public class') || codeLower.includes('import java')) return 'java';
    if (code.includes('def ') || (codeLower.includes('import ') && (codeLower.includes('numpy') || codeLower.includes('pandas')))) return 'python';
    if (code.includes('#include') || codeLower.includes('int main')) return codeLower.includes('.cpp') ? 'cpp' : 'c';
    if (codeLower.includes('function') || codeLower.includes('const ') || codeLower.includes('let ') || codeLower.includes('class ')) return 'javascript';
    if (codeLower.includes('<html') || codeLower.includes('<div')) return 'html';
    if (codeLower.includes('@import') || (code.includes('{') && code.includes('}'))) return 'css';
    if (codeLower.includes('.jsx') || codeLower.includes('react')) return 'react';
    return 'javascript';
  };

  // Helper to extract filename from text (e.g., "binarySearch.js")
  const extractFilename = (text) => {
    const filenameMatch = text.match(/([\w-]+\.(js|jsx|py|java|cpp|c|html|css|json))/i);
    return filenameMatch ? filenameMatch[1] : null;
  };

  // Language configs for extensions, build, and start commands
  const languageConfig = {
    java: { extension: 'java', buildCommand: { mainItem: 'javac', commands: ['*.java'] }, startCommand: { mainItem: 'java', commands: ['Main'] } },
    python: { extension: 'py', buildCommand: { mainItem: null, commands: [] }, startCommand: { mainItem: 'python', commands: ['main.py'] } },
    javascript: { extension: 'js', buildCommand: { mainItem: null, commands: [] }, startCommand: { mainItem: 'node', commands: ['main.js'] } },
    cpp: { extension: 'cpp', buildCommand: { mainItem: 'g++', commands: ['*.cpp', '-o', 'main'] }, startCommand: { mainItem: null, commands: ['./main'] } },
    c: { extension: 'c', buildCommand: { mainItem: 'gcc', commands: ['*.c', '-o', 'main'] }, startCommand: { mainItem: null, commands: ['./main'] } },
    html: { extension: 'html', buildCommand: { mainItem: null, commands: [] }, startCommand: { mainItem: null, commands: [] } },
    css: { extension: 'css', buildCommand: { mainItem: null, commands: [] }, startCommand: { mainItem: null, commands: [] } },
    react: { extension: 'jsx', buildCommand: { mainItem: 'npm', commands: ['install'] }, startCommand: { mainItem: 'npm', commands: ['start'] } },
    json: { extension: 'json', buildCommand: { mainItem: null, commands: [] }, startCommand: { mainItem: null, commands: [] } },
  };

  // Main parsing logic
  const extracted = extractFromMarkdown(message);
  let jsonObject;
  if (typeof extracted === 'object' && extracted.content) {
    const { lang: extractedLang, content } = extracted;
    if (content.startsWith('{') && content.endsWith('}')) {
      try {
        jsonObject = JSON.parse(content);
      } catch (jsonError) {
        console.log('JSON parse failed:', jsonError);
      }
    }
    if (jsonObject && typeof jsonObject.text === 'string') {
      return jsonObject;
    }
    // Fallback to code
    const language = extractedLang || detectLanguage(content);
    const config = languageConfig[language] || languageConfig.javascript;
    const filename = extractFilename(message) || `main.${config.extension}`;
    return {
      text: `Generated ${language} code`,
      code: content,
      fileTree: {
        [filename]: { file: { contents: content } }
      },
      buildCommand: config.buildCommand,
      startCommand: config.startCommand
    };
  } else if (typeof extracted === 'object') {
    // Already parsed JSON from markdown
    return extracted;
  }

  // Plain text fallback (shouldn't reach here often)
  return { text: message.trim() };
}

const ChatPanel = () => {
  const {
    getMessages,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    socket
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
      console.log("Subscribing to messages for project:", selectedProject._id);
      getMessages(selectedProject._id);
      const unsubscribe = subscribeToMessages(selectedProject._id);
      return () => {
        console.log("Unsubscribing from messages for project:", selectedProject._id);
        if (unsubscribe) unsubscribe();
        unsubscribeFromMessages(selectedProject._id);
      };
    }
  }, [selectedProject?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showCodeInterface]);

  useEffect(() => {
    if (
      selectedChat &&
      selectedChat.senderId &&
      selectedChat.senderId.email === AI
    ) {
      const parsedMessage = jsonFormatter(selectedChat.text);
      console.log("Parsed message:", parsedMessage);
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

  if (isMessagesLoading) {
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
            {jsonData?.text || text || "No content available"}
          </Markdown>
        </div>
      </div>
    );
  }

  WriteAiMessage.propTypes = {
    text: PropTypes.string.isRequired,
  };

  const handleMessageClick = (message) => {
    if (!message.senderId?.email || message.senderId.email !== AI) return;
    if (selectedChat && selectedChat._id === message._id) {
      setShowCodeInterface(!showCodeInterface);
    } else {
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
      className={`flex-1 flex flex-col overflow-hidden ${showCodeInterface ? "bg-base-100" : ""}`}
    >
      <ChatHeader />
      {isShowUserPanel ? (
        <UserPanel />
      ) : (
        <>
          {showCodeInterface ? (
            <div className="flex flex-row h-full">
              <div className="w-1/4 bg-base-200 h-full flex flex-col border-r border-base-300">
                <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
                  {messages.map((message, index) => (
                    <div
                      key={message._id}
                      ref={index === messages.length - 1 ? messageEndRef : null}
                      onClick={() => handleMessageClick(message)}
                      className={`chat ${message?.senderId?._id === authUser?.data?._id ? "chat-end" : "chat-start"}`}
                    >
                      <div className="chat-image avatar">
                        <div className="size-12 rounded-full border">
                          <img
                            src={message.senderId?.profilePic || "./avatar.png"}
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
                        {message.text && (
                          <div className="break-words max-w-full text-left overflow-y-auto no-scrollbar">
                            {message.senderId?.email === AI ? (
                              <WriteAiMessage text={message.text} />
                            ) : (
                              <p>{message.text}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-base-200">
                  <MessageInput />
                </div>
              </div>
              <div className="w-3/4 flex flex-col h-full bg-base-300">
                <div className="flex items-center justify-between p-2 border-b border-base-300 bg-base-100">
                  <h2 className="text-lg font-semibold">Coding Workspace</h2>
                  <button
                    className="p-1 rounded-full bg-base-300 hover:bg-base-200 transition-colors"
                    onClick={() => handleCodeEditor()}
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex flex-1 h-full">
                  <div className="w-1/3 bg-base-300 h-full p-4 no-scrollbar border-r border-base-300">
                    <FileExplorer />
                  </div>
                  <div className="w-2/3 bg-base-200 h-full p-4 no-scrollbar border-l border-base-300">
                    <CodeEditor />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {messages.map((message, index) => (
                  <div
                    key={message._id}
                    ref={index === messages.length - 1 ? messageEndRef : null}
                    onClick={() => handleMessageClick(message)}
                    className={`chat ${message?.senderId?._id === authUser?.data?._id ? "chat-end" : "chat-start"}`}
                  >
                    <div className="chat-image avatar">
                      <div className="size-12 rounded-full border">
                        <img
                          src={message.senderId?.profilePic || "./avatar.png"}
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
                      {message.text && (
                        <div className="break-words max-w-full text-left overflow-y-auto no-scrollbar">
                          {message.senderId?.email === AI ? (
                            <WriteAiMessage text={message.text} />
                          ) : (
                            <p>{message.text}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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