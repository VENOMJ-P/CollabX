import React, { useEffect, useRef, useState } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { X } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import { useUserPanelStore } from '../store/useUserPanelStore';

const UserPanel = () => {
    const { fetchUserDetails, userDetails, isUserLoading, setSelectedProject, closeUserPanel } = useUserPanelStore();
    const { selectedProject, addCollaborators, isAddingCollaborators } = useProjectStore();

    const userEndRef = useRef(null);

    useEffect(() => {
        if (selectedProject && selectedProject._id) {
            fetchUserDetails(selectedProject._id);
        }
    }, [selectedProject, fetchUserDetails]);

    useEffect(() => {
        if (userEndRef.current && userDetails) {
            userEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [userDetails]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [emails, setEmails] = useState([]);

    if (isUserLoading) {
        return (
            <div className='flex-1 flex flex-col overflow-auto'>
                <div className='p-4'>Loading user details...</div>
            </div>
        );
    }

    const handleTextareaChange = (e) => {
        const value = e.target.value;
        const emailList = value.split(',').map(email => email.trim()).filter(email => email);
        setEmails(emailList);
    };

    const handleAddCollaborators = async () => {
        // const emailList = emails.split(',').map(email => email.trim()).filter(email => email);

        try {
            await addCollaborators(selectedProject._id, emails);
            setIsModalOpen(false);
            setEmails([]);
        } catch (error) {
            console.error('Error adding collaborators:', error);
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-auto p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">User Details</h2>
                <button
                    className="p-2 rounded-full hover:bg-base-200 transition-colors"
                    onClick={() => closeUserPanel()}
                    aria-label="Close"
                >
                    <X size={18} />
                </button>
            </div>
            {userDetails ? userDetails.map((user) => (
                <div key={user._id} className="flex flex-col overflow-auto">
                    <div className="flex flex-col sm:flex-row gap-5 overflow-y-auto p-2">
                        <div className="avatar max-h-10">
                            <img src={user.profilePic || "./avatar.png"} alt="User Avatar" className="h-20 w-20 sm:h-10 sm:w-10 rounded-full border" />
                        </div>
                        <div className="user-info">
                            <h2 className="text-lg sm:text-base font-semibold">{user.fullName}</h2>
                            <p className="text-sm sm:text-xs text-gray-500">{user.email}</p>
                        </div>
                        <div className="user-actions">
                        </div>
                    </div>
                </div>
            )) : <div className="flex flex-col overflow-auto">No User!</div>}
            <div className='bg-accent flex flex-end flex-col rounded-full sticky bottom-0' style={{ marginTop: 'auto' }}>
                <button onClick={() => setIsModalOpen(true)} className='p-2 text-lg'>Add Collaborator</button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-base-100 p-6 rounded-lg w-96">
                        <h3 className="text-lg font-semibold mb-4">Add Collaborators</h3>
                        <textarea
                            className="w-full p-2 border rounded-md mb-4"
                            placeholder="Enter email addresses separated by commas (e.g., user1@example.com, user2@example.com)"
                            onChange={handleTextareaChange}
                            rows={3}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 bg-primary hover:bg-primary/50 rounded-md "
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-accent hover:bg-accent/50 text-white rounded-md"
                                onClick={handleAddCollaborators}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPanel;
