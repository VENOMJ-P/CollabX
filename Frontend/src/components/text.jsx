import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CreateProjectModal from "./CreateProjectModal";
import { useProjectStore } from "../store/useProjectStore";

const Sidebar = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { projects, fetchProjects } = useProjectStore();

    useEffect(() => {
        fetchProjects(); // Fetch projects on mount
    }, []);

    return (
        <div className="w-16 h-screen bg-gray-900 flex flex-col items-center py-4 relative">
            {/* Projects List */}
            <div className="flex flex-col items-center space-y-4 flex-1">
                {projects.map((project) => (
                    <div key={project._id} className="relative group w-full">
                        <motion.div
                            className="w-10 h-10 flex items-center justify-center bg-gray-700 text-white rounded-lg cursor-pointer shadow-md hover:bg-gray-600"
                        >
                            {console.log(project.name)}
                            {project?.name?.charAt(0).toUpperCase()}
                        </motion.div>

                        {/* Tooltip - Show full project name only on hover */}
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            whileHover={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-gray-800 text-white text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition duration-300 whitespace-nowrap shadow-lg"
                        >
                            {project.name}
                        </motion.div>
                    </div>
                ))}
            </div>

            {/* Create Project Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 p-3 rounded-md transition duration-300 shadow-md"
                aria-label="Create New Project"
            >
                <Plus className="w-6 h-6 text-white" />
            </button>

            {isModalOpen && <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

export default Sidebar;
