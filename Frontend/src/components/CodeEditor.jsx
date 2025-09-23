import React, { useState, useEffect, useRef } from 'react';
import { useCodeEditor } from '../store/useCodeEditor';
import { Editor } from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { Play, Square, Loader2 } from 'lucide-react';

const CodeEditor = () => {
    const { 
        openedFiles, 
        selectedMessage, 
        closeFile, 
        updateFileContent,
        executeCode,
        isExecuting,
        executionOutput,
        clearExecutionOutput,
        dockerAvailable,
        checkDockerAvailability
    } = useCodeEditor();
    
    const [activeFile, setActiveFile] = useState(null);
    const editorRef = useRef(null);
    const [editorTheme, setEditorTheme] = useState('vs-dark');

    useEffect(() => {
        if (!activeFile) {
            setActiveFile(openedFiles.length > 0 ? openedFiles[openedFiles.length - 1] : null);
        }
    }, [activeFile, openedFiles]);

    useEffect(() => {
        checkDockerAvailability();
    }, []);

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };

    const handleCodeChange = (value) => {
        if (activeFile) {
            console.log("activeFile", activeFile.filename, value);
            updateFileContent(activeFile.filename, value);
            setActiveFile((prevFile) => ({ ...prevFile, contents: value }));
        }
    };

    const handleFileClose = (filename) => {
        closeFile(filename);
        if (activeFile && activeFile.filename === filename) {
            setActiveFile(openedFiles.length >= 1 ? openedFiles[openedFiles.length - 1] : null);
        }
    };

    const handleRunCode = async () => {
        if (!dockerAvailable) {
            toast.error('Docker is not available for code execution');
            return;
        }

        if (!openedFiles || openedFiles.length === 0) {
            toast.error('No files to execute');
            return;
        }

        await executeCode();
    };

    const getLanguageFromFilename = (filename) => {
        const extension = filename.split('.').pop().toLowerCase();
        const languageMap = {
            'js': 'javascript',
            'jsx': 'javascript',
            'ts': 'typescript',
            'tsx': 'typescript',
            'py': 'python',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'md': 'markdown'
        };
        return languageMap[extension] || 'plaintext';
    };

    return (
        <div className="code-editor-container flex flex-col h-full w-full bg-base-200 p-4 rounded-xl shadow-lg">
            {/* File Tabs */}
            <div className="file-tabs flex space-x-2 overflow-x-auto mb-3 pb-2 border-b border-base-300">
                {openedFiles.map((file) => (
                    <div
                        key={file.filename}
                        className={`tab flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
                            activeFile?.filename === file.filename 
                                ? 'bg-primary text-white' 
                                : 'bg-base-100 text-gray-600'
                        } hover:bg-primary/20`}
                        onClick={() => setActiveFile(file)}
                    >
                        <span className="truncate max-w-xs">{file.filename}</span>
                        <button 
                            className="text-red-500 hover:text-red-700" 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleFileClose(file.filename);
                            }}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            {/* Editor Controls */}
            <div className="editor-header flex items-center justify-between mb-3 border-b border-base-300 pb-2">
                <h2 className="text-lg font-semibold text-primary">
                    {activeFile?.filename || 'No file open'}
                </h2>
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
                    
                    {dockerAvailable && (
                        <button 
                            onClick={handleRunCode}
                            disabled={isExecuting || !activeFile}
                            className="btn btn-sm btn-success flex items-center gap-2"
                        >
                            {isExecuting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Running...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4" />
                                    Run Code
                                </>
                            )}
                        </button>
                    )}
                    
                    {!dockerAvailable && (
                        <div className="badge badge-error badge-sm">Docker Unavailable</div>
                    )}
                </div>
            </div>

            {/* Code Editor */}
            <div className="editor-wrapper flex-1 bg-base-100 rounded-lg overflow-hidden shadow-md">
                {activeFile ? (
                    <Editor
                        height="100%"
                        language={getLanguageFromFilename(activeFile.filename)}
                        value={activeFile.contents}
                        onChange={handleCodeChange}
                        onMount={handleEditorDidMount}
                        theme={editorTheme}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: 'on',
                            automaticLayout: true,
                            scrollBeyondLastLine: false,
                        }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No file selected</p>
                    </div>
                )}
            </div>

            {/* Execution Output */}
            {executionOutput && (
                <div className="execution-output mt-4 bg-base-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold">Output:</h3>
                        <button
                            onClick={clearExecutionOutput}
                            className="btn btn-xs btn-ghost"
                        >
                            Clear
                        </button>
                    </div>
                    
                    {executionOutput.output && (
                        <div className="mb-2">
                            <h4 className="text-xs font-medium text-success mb-1">STDOUT:</h4>
                            <pre className="text-xs bg-base-100 p-2 rounded whitespace-pre-wrap">
                                {executionOutput.output.stdout || 'No output'}
                            </pre>
                        </div>
                    )}
                    
                    {executionOutput.output && executionOutput.output.stderr && (
                        <div className="mb-2">
                            <h4 className="text-xs font-medium text-error mb-1">STDERR:</h4>
                            <pre className="text-xs bg-base-100 p-2 rounded text-error whitespace-pre-wrap">
                                {executionOutput.output.stderr}
                            </pre>
                        </div>
                    )}
                    
                    <div className="text-xs text-base-content/70">
                        Exit Code: {executionOutput.output?.exitCode ?? 'N/A'} | 
                        Execution ID: {executionOutput.executionId}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeEditor;