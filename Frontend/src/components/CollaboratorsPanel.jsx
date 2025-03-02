import React from 'react';

const CollaboratorsPanel = () => {
    return (
        <div className="w-64 bg-base-200 p-4">
            <div className="bg-primary/30 p-3 rounded-md mb-4">Workflow 1</div>
            <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-accent/10 rounded-full relative">
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full"></span>
                </div>
                <span className="ml-3">User 1</span>
            </div>
            <button className="bg-accent/80 hover:bg-accent/40 p-3 rounded-md w-full">Add Collaborator</button>
        </div>
    );
};

export default CollaboratorsPanel;
