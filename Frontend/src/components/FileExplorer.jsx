


import React, { useState } from 'react';
import { useCodeEditor } from '../store/useCodeEditor';

const FileExplorer = () => {
    const { selectedMessage, addFile, openedFiles } = useCodeEditor();
    const [hoveredFile, setHoveredFile] = useState(null);

    const handleFileSelect = (fileKey) => {
        const fileContent = selectedMessage.fileTree[fileKey].file?.contents;
        addFile({ filename: fileKey, contents: fileContent }); // Add selected file
    };



    // Function to get appropriate file icon based on extension
    const getFileIcon = (filename) => {
        const extension = filename.split('.').pop().toLowerCase();
        switch (extension) {
            case 'js':
            case 'jsx':
                return '📜';
            case 'ts':
            case 'tsx':
                return '🔷';
            case 'json':
                return '📋 '; // JSON files
            case 'html':
                return '🌐';
            case 'css':
                return '🎨';
            case 'md':
                return '📘';
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'webp':
                return '🖼️';
            case 'pdf':
                return '📄';
            case 'txt':
                return '📄';
            default:
                return '📄';
        }

    };

    return (
        <div className="file-explorer-container p-3 w-full bg-base-200 rounded-xl shadow-lg overflow-hidden border border-base-300">
            {selectedMessage?.fileTree ? (
                <div className="explorer p-4 w-full overflow-y-auto">
                    <h2 className="text-xl font-bold text-primary mb-4 border-b border-base-300 pb-2">Project Files</h2>

                    <div className="file-tree flex flex-col gap-4">
                        {Object.keys(selectedMessage.fileTree).length ? (
                            <div className="tree-section mb-6 card bg-base-100 shadow-md">
                                {/* Section Header */}
                                <div className="card-header p-3 bg-gradient-to-r from-primary/20 to-transparent rounded-t-xl">
                                    <h3 className="font-semibold text-lg">Ungrouped Files</h3>
                                </div>

                                {/* Files List */}
                                <div className="card-body p-2">
                                    <div className="files-list flex flex-col">
                                        {Object.keys(selectedMessage.fileTree).map((fileKey) => (
                                            <button
                                                key={fileKey}
                                                className={`tree-element cursor-pointer p-3 flex items-center gap-2 
                                                          hover:bg-base-300 transition-all duration-300 border-b border-base-200 last:border-b-0
                                                          ${hoveredFile === fileKey ? 'bg-base-300 text-primary' : ''}`}
                                                onClick={() => handleFileSelect(fileKey)}
                                                onMouseEnter={() => setHoveredFile(fileKey)}
                                                onMouseLeave={() => setHoveredFile(null)}
                                            >
                                                <span className="file-icon text-lg">{getFileIcon(fileKey)}</span>
                                                <p className="text-base transition-all duration-300">{fileKey}</p>
                                                <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {hoveredFile === fileKey && (
                                                        <span className="text-xs badge badge-ghost badge-sm">Select</span>
                                                    )}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="no-files-section text-center text-gray-500">
                                <p>No files available</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="no-file-tree flex flex-col items-center justify-center h-full p-8 text-gray-500">
                    <div className="text-5xl mb-4">📁</div>
                    <p className="text-lg font-semibold">No files available</p>
                    {/* <p className="text-sm opacity-70 mt-2">Select a message with file content</p>
                    <button className="btn btn-primary btn-sm mt-4">Upload Files</button> */}
                </div>
            )}
        </div>
    );
};

export default FileExplorer;
