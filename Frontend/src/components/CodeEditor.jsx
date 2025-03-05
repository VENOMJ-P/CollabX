import React from 'react';

const CodeEditor = () => {
    return (
        <div className="flex-1 bg-base-200  border-neutral border-0- p-4">
            
            <div className="bg-primary/70 p-2 rounded-md mb-2">server.js</div>
            <div className="bg-neutral/50 p-4 rounded-md">
                <pre className="text-primary">import express from 'express';</pre>
                <pre className="text-neutral">const app = express();</pre>
                <pre className="text-neutral">const port = 3000;</pre>
            </div>
            <div className="flex mt-2">
                <button className="btn btn-accent px-4 py-2 rounded-md mr-2">Run</button>
                <button className="bg-primary px-4 py-2 rounded-md">Save</button>
            </div>
        </div>
    );
};

export default CodeEditor;
