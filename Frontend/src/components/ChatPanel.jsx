// import React from 'react';
// import { Send, Camera } from 'lucide-react';

// const ChatPanel = () => {
//     return (
//         <div className="flex flex-col w-2/5 b p-4">
//             <div className="chat-bubble p-4 rounded-lg mb-4">
//                 <p className="text-gray-300 text-sm">user@example.com</p>
//                 <p>Hello!</p>
//             </div>
//             <div className="bg-gray-700 p-4 rounded-lg mb-4 self-end">
//                 <p className="text-gray-300 text-sm">@ai</p>
//                 <p>Create server.js</p>
//             </div>
//             <div className="bg-gray-600 p-4 rounded-lg">
//                 <p className="text-green-400 text-sm">AI Assistant</p>
//                 <p>Here's a basic Express server setup:</p>
//             </div>
//             <div className="flex items-center mt-auto bg-gray-700 p-3 rounded-lg">
//                 <input
//                     type="text"
//                     placeholder="Enter message..."
//                     className="flex-grow bg-transparent outline-none px-2 text-white"
//                 />
//                 <button className="p-2 text-blue-400">
//                     <Camera size={20} />
//                 </button>
//                 <button className="p-2 text-blue-500">
//                     <Send size={20} />
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default ChatPanel;


import React from 'react';
import { Send, Camera } from 'lucide-react';

const ChatPanel = () => {
    return (
        <div className="flex flex-col w-2/5 b p-4">
            <div className="chat-bubble p-4 rounded-lg mb-4">
                <p className="text-accent text-sm">user@example.com</p>
                <p>Hello!</p>
            </div>
            <div className="chat chat-bubble p-4 rounded-lg mb-4 self-end">
                <p className="text-accent text-sm">@ai</p>
                <p>Create server.js</p>
            </div>
            <div className="chat chat-bubble p-4 rounded-lg">
                <p className="text-secondary/100 -400 text-sm">AI Assistant</p>
                <p>Here's a basic Express server setup:</p>
            </div>
            <div className="flex items-center mt-auto bg-accent/80 p-3 rounded-lg">
                <input
                    type="text"
                    placeholder="Enter message..."
                    className="flex-grow bg-transparent  border-none px-2 text-neutral border-neutral"
                />
                <button className="p-2 ml-2 btn btn-primary">
                    <Camera size={20} />
                </button>
                <button className="p-2 ml-2 btn-primary btn">
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
};

export default ChatPanel;

