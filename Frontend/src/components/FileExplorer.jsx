import React from 'react';
import { useCodeEditor } from '../store/useCodeEditor';

const FileExplorer = () => {
    const { selectedMessage } = useCodeEditor();
    return (
        <div className="file-explorer-container">
            {selectedMessage?.fileTree ? (
                <div className="explorer bg-slate-200 max-w-64 min-w-52 p-4">
                    <div className="file-tree w-full">
                        {Object.keys(selectedMessage.fileTree).map((key) => (
                            <div key={key} className="tree-section mb-4">
                                <p className="font-semibold text-lg text-slate-700">{key}</p>
                                {selectedMessage.fileTree[key]?.files?.map((file, index) => (
                                    <button
                                        key={index}
                                        className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-300 w-full rounded-md hover:bg-slate-400"
                                    >
                                        <p>{file}</p>
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="no-file-tree p-4 text-gray-500">
                    No files available
                </div>
            )}
        </div>
    );
};

export default FileExplorer;