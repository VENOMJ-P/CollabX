// import React from 'react';
// import Sidebar from '../components/Sidebar';
// // import ChatPanel from '../components/ChatPanel';
// import CodeEditor from '../components/CodeEditor';
// import { useProjectStore } from '../store/useProjectStore';
// import NoChatSelected from '../components/NoChatSelected';
// import ChatPanel from '../components/ChatPanel';

// const HomePage = () => {
//   const { selectedProject } = useProjectStore();
//   return (
//     // <div className="flex h-screen bg-base-200">
//     //   <Sidebar />
//     //   <CollaboratorsPanel />
//     //   <ChatPanel />
//     //   <CodeEditor />
//     // </div>

//     <div className="h-screen bg-base-100">
//       <div className="flex items-center justify-center pt-20 px-4">
//         {/* max-w-0.5xl for further use for increasing width */}
//         <div className="bg-base-100  border-1 border-base-300 rounded-lg shadow-cl w-full max-w-0.5xl h-[calc(100vh-6rem)]">
//           <div className="flex h-full rounded-lg overflow-hidden">
//             <Sidebar />
//             {!selectedProject ?
//               <NoChatSelected /> :
//               <>
//                 <ChatPanel />
//               </>
//             }
//             {/* <CodeEditor /> */}
//           </div>
//         </div>
//       </div>
//     </div>

//   );
// };

// export default HomePage;


import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import CodeEditor from '../components/CodeEditor';
import { useProjectStore } from '../store/useProjectStore';
import NoChatSelected from '../components/NoChatSelected';
import ChatPanel from '../components/ChatPanel';
import { useCodeEditor } from '../store/useCodeEditor';
import { useAuthStore } from '../store/useAuthStore';

const HomePage = () => {
  const { selectedProject } = useProjectStore(); // Assuming `isAuthorized` indicates successful authorization
  const { initWebContainer } = useCodeEditor();


  useEffect(() => {
    initWebContainer();
  }, [initWebContainer]);
  return (
    <div className="h-screen bg-base-100">
      <div className="flex items-center justify-center pt-20 px-4">
        {/* max-w-0.5xl for further use for increasing width */}
        <div className="bg-base-100  border-1 border-base-300 rounded-lg shadow-cl w-full max-w-0.5xl h-[calc(100vh-6rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            {!selectedProject ? (
              <NoChatSelected />
            ) : (
              <>
                <ChatPanel />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
