import React from 'react';

const Sidebar = () => {
    return (
        <div className="w-16 bg-base-100 flex flex-col items-center py-2">
            <div className="bg-primary/60 hover:bg-primary/30 p-3 rounded-md mb-4">W1</div>
            <div className="bg-primary/60 hover:bg-primary/30 p-3 rounded-md mb-4">W1</div>
            <div className="bg-primary/60 hover:bg-primary/30 p-3 rounded-md mb-4">W1</div>
            <div className="bg-primary/60 hover:bg-primary/30 p-3 rounded-md mb-4">W1</div>
            <button className="bg-primary/60 hover:bg-primary/30 p-4 rounded-md">+</button>
        </div>
    );
};

export default Sidebar;
