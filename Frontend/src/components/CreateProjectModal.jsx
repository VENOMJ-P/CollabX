import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useProjectStore } from "../store/useProjectStore";

const CreateProjectModal = ({ isOpen, onClose }) => {
    const [projectName, setProjectName] = useState('');
    const { projects, fetchProjects, createProject, isCreatingProject } = useProjectStore();

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
    };

    const handleOutsideClick = (e) => {
        if (e.target.id === "modal-overlay") onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!projectName.trim()) return;

        await createProject({ name: projectName });
        await fetchProjects(); // Fetch updated projects
        setProjectName('');
        onClose();
    };


    if (!isOpen) return null;

    return (
        <div
            id="modal-overlay"
            className="z-50 fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300"
            onClick={handleOutsideClick}
        >
            <div className="bg-base-100 rounded-lg p-6 w-96 shadow-lg relative animate-fadeIn">
                <button
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition duration-200"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold mb-4">Create New Project</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Project Name"
                        className="input input-bordered w-full mb-4"
                        autoFocus
                        required
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`btn btn-primary ${!projectName.trim() || isCreatingProject ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={!projectName.trim() || isCreatingProject}
                        >
                            {isCreatingProject ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProjectModal;
