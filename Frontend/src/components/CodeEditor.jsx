import React, { useState } from 'react';
import Markdown from "markdown-to-jsx";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialOceanic } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useCodeEditor } from '../store/useCodeEditor';

// const CodeEditor = () => {
//     const { selectedFile } = useCodeEditor(); // Access the selected file from context

//     return (
//         <div className="flex-1 bg-base-200 border-neutral border-0 pb-3">
//             {/* File name */}
//             {selectedFile ? (
//                 <>
//                     <div className="bg-primary/70 p-2 rounded-md mb-2">{selectedFile.filename}</div>
//                     <div className="bg-neutral/50 p-4 rounded-md">

//                         {/* <Markdown
//                             options={{
//                                 overrides: {
//                                     code: {
//                                         component: ({ className, children }) => {
//                                             const language = className?.replace("lang-", "") || "javascript";
//                                             return (
//                                                 <SyntaxHighlighter
//                                                     style={materialOceanic}
//                                                     language={language}
//                                                     PreTag="div"
//                                                 >
//                                                     {children}
//                                                 </SyntaxHighlighter>
//                                             );
//                                         },
//                                     },
//                                 },
//                             }}
//                         >
//                     </Markdown> */}
//                         {/* Render file content */}
//                         <pre className="whitespace-pre-wrap text-neutral">
//                             {selectedFile.content}
//                         </pre>
//                     </div>
//                 </>
//             ) : (
//                 <p className="text-gray-500">No file selected. Please select a file to view its content.</p>
//             )
//             }
//         </div >
//     );
// };

// export default CodeEditor;
import { useEffect, useRef } from "react";
// import { useCodeEditor } from "../store/useCodeEditor";
import { Editor } from "@monaco-editor/react";
import toast from "react-hot-toast";

const CodeEditor = () => {
    const { openedFiles, webContainer, initWebContainer } = useCodeEditor();
    const [activeFile, setActiveFile] = useState(openedFiles.length ? openedFiles[openedFiles.length - 1] : null);
    const editorRef = useRef(null);
    const [editorTheme, setEditorTheme] = useState("vs-dark");


    useEffect(() => {
        if (openedFiles.length > 0 && !activeFile) {
            setActiveFile(openedFiles[openedFiles.length - 1]);
        }
    }, [openedFiles]);

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };

    const handleCodeChange = (value) => {
        setActiveFile((prevFile) => prevFile && { ...prevFile, content: value });
    };

    const runCode = async () => {
        if (!webContainer) {
            toast.error("WebContainer is not initialized");
            return;
        }
        try {
            const fileSystem = {};
            openedFiles.forEach(file => {
                fileSystem[file.filename] = { file: { contents: file.content } };
            });

            await webContainer.mount(fileSystem);

            const process = await webContainer.spawn("node", [activeFile?.filename]);
            process.output.pipeTo(new WritableStream({
                write(chunk) {
                    console.log(chunk);
                }
            }));
        } catch (error) {
            toast.error("Error running the code");
            console.error("Execution error:", error);
        }
    };

    return (
        <div className="code-editor-container flex flex-col h-full w-full bg-base-200 p-4 rounded-xl shadow-lg">
            <div className="editor-header flex items-center justify-between mb-3 border-b border-base-300 pb-2">
                <h2 className="text-lg font-semibold text-primary">Code Editor</h2>
                <div className="flex items-center gap-2"> {/* Added a container div for the buttons */}
                    <button
                        onClick={() => {
                            const newTheme = editorTheme === "vs-dark" ? "vs-light" : "vs-dark";
                            setEditorTheme(newTheme); // Update the state
                            editorRef.current?.updateOptions({ theme: newTheme }); // Update the editor theme
                        }}
                        className="btn btn-sm btn-primary"
                    >
                        {editorTheme === "vs-dark" ? "🌞" : "🌙"}
                    </button>
                    {activeFile && <button onClick={runCode} className="btn btn-sm btn-primary">Run Code</button>}
                </div>
            </div>

            {/* <div className=" flex flex-end bg-red-400 theme-switcher mb-2">
                
            </div> */}
            <div className="editor-wrapper flex-1 bg-base-100 rounded-lg overflow-hidden shadow-md">
                {activeFile ? (
                    <Editor
                        height="100%"
                        defaultLanguage={activeFile.filename.split(".").pop()}
                        value={activeFile.content}
                        onChange={handleCodeChange}
                        onMount={handleEditorDidMount}
                        theme={editorTheme} // Use the state variable for the theme
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


// import React from "react";
// import { useCodeEditor } from "../store/useCodeEditor";
// import Markdown from "markdown-to-jsx";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { materialOceanic } from "react-syntax-highlighter/dist/esm/styles/prism";

// const CodeEditor = () => {
//     const { openedFiles } = useCodeEditor();
//     const activeFile = openedFiles.length ? openedFiles[openedFiles.length - 1] : null; // Get the last opened file

//     // Function to get file language for syntax highlighting
//     const getFileLanguage = (filename) => {
//         const extension = filename.split(".").pop().toLowerCase();
//         const languageMap = {
//             js: "javascript",
//             jsx: "javascript",
//             ts: "typescript",
//             tsx: "typescript",
//             css: "css",
//             html: "html",
//             json: "json",
//             md: "markdown",
//             py: "python",
//             java: "java",
//             cpp: "cpp",
//             c: "c",
//             cs: "csharp",
//             php: "php",
//             rb: "ruby",
//             swift: "swift",
//             go: "go",
//         };
//         return languageMap[extension] || "plaintext";
//     };

//     return (
//         <div className="code-editor-container flex flex-col h-full w-full bg-base-200 p-4 rounded-xl shadow-lg">
//             <div className="editor-header flex items-center justify-between mb-3 border-b border-base-300 pb-2">
//                 <h2 className="text-lg font-semibold text-primary">Code Editor</h2>
//             </div>

//             <div className="editor-wrapper flex-1 bg-base-100 rounded-lg overflow-hidden shadow-md p-4">
//                 {activeFile ? (
//                     activeFile.filename.endsWith(".md") ? (
//                         <Markdown>{activeFile.content}</Markdown>
//                     ) : (
//                         <SyntaxHighlighter
//                             language={getFileLanguage(activeFile.filename)}
//                             style={materialOceanic}
//                             showLineNumbers
//                         >
//                             {activeFile.content}
//                         </SyntaxHighlighter>
//                     )
//                 ) : (
//                     <div className="flex items-center justify-center h-full text-gray-500">
//                         <p>No file selected</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default CodeEditor;
