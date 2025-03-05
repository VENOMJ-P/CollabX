import { Plus, Users, Workflow } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import CreateProjectModal from './CreateProjectModal';
import { useProjectStore } from "../store/useProjectStore";
import { useUserPanelStore } from '../store/useUserPanelStore';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';

const Sidebar = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { projects, fetchProjects, selectedProject, setSelectedProject } = useProjectStore();
    const { connectSocket, disconnectSocket } = useAuthStore();
    const { closeUserPanel } = useUserPanelStore();
    useEffect(() => {
        fetchProjects(); // Fetch projects on mount
    }, []);


    return (
        <>
            <div className="w-16 bg-base-200 flex flex-col items-center py-2 border-r border-base-300 z-89">
                {projects.map((project) => (
                    <button
                        key={project?._id}
                        onClick={() => {
                            if (selectedProject?._id !== project?._id) {
                                disconnectSocket();  // Disconnect from previous project
                                setSelectedProject(project);
                                closeUserPanel();
                                connectSocket(); // Connect to the new project
                            }
                        }}
                        className="relative bg-primary/60 hover:bg-primary/30 p-4.5 m-3 rounded-md border-accent transition duration-500 ease-in-out transform hover:scale-105 group"
                        aria-label={project?.name || "Unnamed Project"}
                    >
                        {project?.name ? project.name.charAt(0).toUpperCase() : "?"}

                        {/* Tooltip */}
                        <span className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-gray-800 text-white text-sm px-4 py-2 rounded-md shadow-lg opacity-0 transition duration-300 ease-in-out whitespace-nowrap group-hover:opacity-100 pointer-events-none">
                            <p className="flex items-center space-x-3 font-semibold">
                                <Workflow />
                                <span>{project?.name || "Unnamed Project"}</span>
                            </p>
                            <p className="flex items-center space-x-3">
                                <Users />
                                <span><small>Collaborators: </small>{project?.users?.length || 0}</span>
                            </p>
                        </span>
                    </button>
                ))}


                <button
                    onClick={() => setIsModalOpen(true)}
                    className="relative bg-primary/60 hover:bg-primary/30 p-3 m-3 rounded-md border-accent transition duration-300 ease-in-out group"
                    aria-label="Create New Project"
                >
                    <Plus className="w-6 h-6" />

                    <span className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-gray-800 text-white text-sm px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap">
                        Create New Project
                    </span>
                </button>

                {isModalOpen && <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
            </div >

        </>
    );
};

export default Sidebar;
