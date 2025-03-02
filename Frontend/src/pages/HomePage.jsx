import React from 'react';
import Sidebar from '../components/Sidebar';
import CollaboratorsPanel from '../components/CollaboratorsPanel';
import ChatPanel from '../components/ChatPanel';
import CodeEditor from '../components/CodeEditor';
import { useChatStore } from '../store/useChatStore';
import NoChatSelected from '../components/NoChatSelected';

const HomePage = () => {
  const { selectedUser } = useChatStore();
  return (
    // <div className="flex h-screen bg-base-200">
    //   <Sidebar />
    //   <CollaboratorsPanel />
    //   <ChatPanel />
    //   <CodeEditor />
    // </div>

    <div className="h-screen bg-base-100">
      <div className="flex items-center justify-center pt-20 px-4">
        {/* max-w-0.5xl for further use for increasing width */}
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-0.5xl h-[calc(100vh-6rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {/* {!selectedUser ? <NoChatSelected /> : <><CollaboratorsPanel />
              <ChatPanel />
              <CodeEditor /></>} */}
            <CollaboratorsPanel />
            <ChatPanel />
            <CodeEditor />

          </div>
        </div>
      </div>
    </div>

  );
};

export default HomePage;
