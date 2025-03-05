import { Users, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useProjectStore } from "../store/useProjectStore";
import { useUserPanelStore } from "../store/useUserPanelStore";

const ChatHeader = () => {
    const { selectedProject, setSelectedProject } = useProjectStore();
    const { setIsShowUserPanel, isShowUserPanel } = useUserPanelStore();

    return (
        <div className="p-4 border-b border-base-300 bg-base-100 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-lg">{selectedProject.name}</h3>
                    <div className="px-2 py-1 bg-base-200 rounded-full">
                        <p className="text-sm text-base-content/80 flex items-center">
                            <span className="mr-1">{selectedProject?.users.length || 0}</span>
                            <span>members</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <button className="flex-1" onClick={() => setIsShowUserPanel(!isShowUserPanel)}>
                        <Users />
                    </button>
                    <button
                        className="p-2 rounded-full hover:bg-base-200 transition-colors"
                        onClick={() => setSelectedProject(null)}
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>


            </div>
        </div>
    );
};
export default ChatHeader;

// import { useState } from "react";
// import { Users, X } from "lucide-react";
// import { useProjectStore } from "../store/useProjectStore";
// import { useUserPanelStore } from "../store/useUserPanelStore"

// const ChatHeader = () => {
//     const { selectedProject, setSelectedProject } = useProjectStore();
//     const { showUserPanel, setShowUserPanel } = useUserPanelStore();

//     const toggleUserPanel = () => {
//         setShowUserPanel(!showUserPanel);
//     };

//     return (
//         <div className="p-4 border-b border-base-300 bg-base-100 shadow-sm">
//             <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                     <h3 className="font-medium text-lg">{selectedProject.name}</h3>
//                     <div className="px-2 py-1 bg-base-200 rounded-full">
//                         <p className="text-sm text-base-content/80 flex items-center">
//                             <span className="mr-1">{selectedProject?.users.length || 0}</span>
//                             <span>members</span>
//                         </p>
//                     </div>
//                 </div>

//                 <div className="flex items-center space-x-4">
//                     <button
//                         className={`p-2 rounded-full transition-colors ${showUserPanel ? 'bg-base-200' : 'hover:bg-base-200'}`}
//                         onClick={toggleUserPanel}
//                         aria-label="Toggle Users Panel"
//                     >
//                         <Users size={18} />
//                     </button>
//                     <button
//                         className="p-2 rounded-full hover:bg-base-200 transition-colors"
//                         onClick={() => setSelectedProject(null)}
//                         aria-label="Close"
//                     >
//                         <X size={18} />
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ChatHeader;