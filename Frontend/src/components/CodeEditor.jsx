

import React, { useState, useEffect, useRef, act } from 'react';
import { useCodeEditor } from '../store/useCodeEditor';
import { Editor } from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { useChatStore } from '../store/useChatStore';

const CodeEditor = () => {
    const { openedFiles, webContainer, initWebContainer, selectedMessage, closeFile, solve, isSolving, updateFileContent } = useCodeEditor();
    const [activeFile, setActiveFile] = useState(null);
    const editorRef = useRef(null);
    const [editorTheme, setEditorTheme] = useState('vs-dark');
    const [runProcess, setRunProcess] = useState(null)

    const { getMessages, messages, isMessageLoading, subscribeToMessages, unsubscribeFromMessages } = useChatStore();

    useEffect(() => {
        if (!activeFile)
            setActiveFile(openedFiles.length > 0 ? openedFiles[openedFiles.length - 1] : null);
    }, [activeFile, openedFiles]);

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };

    const handleCodeChange = (value) => {
        if (activeFile) {
            console.log("activeFile", activeFile.filename, value)
            updateFileContent(activeFile.filename, value); // update global state
            setActiveFile((prevFile) => ({ ...prevFile, contents: value })); // update local state
        }
    };


    const handleFileClose = (filename) => {
        closeFile(filename);
        if (activeFile && activeFile.filename === filename) {
            setActiveFile(openedFiles.length >= 1 ? openedFiles[openedFiles.length - 1] : null);
        }
    };



    const runCode = async () => {
        if (!webContainer) {
            toast.error('WebContainer is not initialized');
            return;
        }
        try {
            const fileSystem = {};
            openedFiles.forEach(file => {
                fileSystem[file.filename] = { file: { contents: file.contents } };
            });



            await webContainer.mount(fileSystem);
            if (runProcess) {
                runProcess.kill()
            }



            if (!activeFile || !activeFile.filename.endsWith('.js')) {
                toast.error('Only JavaScript files can be executed');
                return;
            }


            console.log("build", selectedMessage, selectedMessage.buildCommand.mainItem)
            if (selectedMessage.buildCommand) {
                const installProcess = await webContainer.spawn(selectedMessage.buildCommand.mainItem, selectedMessage.buildCommand.commands);
                installProcess.output.pipeTo(new WritableStream({
                    write(chunk) {
                        console.log(chunk);
                    }
                }));

                setRunProcess(installProcess)
            }

            console.log("start", selectedMessage, selectedMessage.startCommand)
            if (selectedMessage.startCommand) {

                const process = await webContainer.spawn(selectedMessage.startCommand.mainItem, selectedMessage.startCommand.commands);
                process.output.pipeTo(new WritableStream({
                    write(chunk) {
                        console.log(chunk);
                    }
                }));
            } else {
                const process = await webContainer.spawn('node', [activeFile.filename]);
                process.output.pipeTo(new WritableStream({
                    write(chunk) {
                        console.log(chunk);
                    }
                }));
            }
        } catch (error) {
            toast.error('Error running the code');
            console.error('Execution error:', error);
        }
    };


    return (
        <div className="code-editor-container flex flex-col h-full w-full bg-base-200 p-4 rounded-xl shadow-lg">
            {/* File Tabs */}
            <div className="file-tabs flex space-x-2 overflow-x-auto mb-3 pb-2 border-b border-base-300">
                {openedFiles.map((file) => (
                    <div
                        key={file.filename}
                        className={`tab flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 ${activeFile?.filename === file.filename ? 'bg-primary text-white' : 'bg-base-100 text-gray-600'
                            } hover:bg-primary/20`}
                        onClick={() => setActiveFile(file)}
                    >
                        <span className="truncate max-w-xs">{file.filename}</span>
                        <button className="text-red-500 hover:text-red-700" onClick={() => handleFileClose(file.filename)}>✕</button>
                    </div>
                ))}
            </div>

            {/* Editor Controls */}
            <div className="editor-header flex items-center justify-between mb-3 border-b border-base-300 pb-2">
                <h2 className="text-lg font-semibold text-primary">{activeFile?.filename || 'No file open'}</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            const newTheme = editorTheme === 'vs-dark' ? 'vs-light' : 'vs-dark';
                            setEditorTheme(newTheme);
                            editorRef.current?.updateOptions({ theme: newTheme });
                        }}
                        className="btn btn-sm btn-primary"
                    >
                        {editorTheme === 'vs-dark' ? '🌞' : '🌙'}
                    </button>
                    {activeFile && <button onClick={runCode} className="btn btn-sm btn-primary">Run Code</button>}
                </div>
            </div>

            {/* Code Editor */}
            <div className="editor-wrapper flex-1 bg-base-100 rounded-lg overflow-hidden shadow-md">
                {activeFile ? (
                    <Editor
                        height="100%"
                        defaultLanguage={activeFile.filename.split('.').pop()}
                        value={activeFile.contents}
                        onChange={handleCodeChange}
                        onMount={handleEditorDidMount}
                        theme={editorTheme}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No file selected</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodeEditor;

