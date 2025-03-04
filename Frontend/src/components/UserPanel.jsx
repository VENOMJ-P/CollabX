import React, { useEffect, useRef } from 'react';
import { useUserPanelStore } from '../store/useUserPanelStore';
import { useAuthStore } from '../store/useAuthStore';
import MessageInput from './MessageInput';
import { useProjectStore } from '../store/useProjectStore';
import { X } from 'lucide-react';

const UserPanel = () => {
    const { fetchUserDetails, userDetails, isUserLoading, closeUserPanel } = useUserPanelStore();
    const { selectedProject } = useProjectStore();
    const { authUser } = useAuthStore();

    const userEndRef = useRef(null);

    useEffect(() => {
        console.log("selected", selectedProject);
        fetchUserDetails(selectedProject._id);
        // return () => closeUserPanel();
    }, [authUser.data._id, fetchUserDetails, closeUserPanel]);

    useEffect(() => {
        if (userEndRef.current && userDetails) {
            userEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [userDetails]);

    if (isUserLoading) {
        return (
            <div className='flex-1 flex flex-col overflow-auto'>
                <div className='p-4'>Loading user details...</div>
            </div>
        );
    }

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
            {userDetails ? userDetails.map((userDetail) => (
                <div key={userDetail._id} className="flex flex-col overflow-auto">
                    <div className="flex flex-col sm:flex-row gap-5 overflow-y-auto p-2">
                        <div className="avatar max-h-10">
                            <img src={userDetail.profilePic || "./avatar.png"} alt="User Avatar" className="h-20 w-20 sm:h-10 sm:w-10 rounded-full border" />
                        </div>
                        <div className="user-info">
                            <h2 className="text-lg sm:text-base font-semibold">{userDetail.fullName}</h2>
                            <p className="text-sm sm:text-xs text-gray-500">{userDetail.email}</p>
                            {/* Add other user info as needed */}
                        </div>
                        <div className="user-actions">
                            {/* Add actions like 'Send Message', 'Add Friend', etc. */}
                        </div>
                    </div>
                </div>
            )) : <div className="flex flex-col overflow-auto">No User!</div>}
        </div>
    );
};

export default UserPanel;
