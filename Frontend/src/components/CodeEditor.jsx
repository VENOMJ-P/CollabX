// import React from 'react';
// import Markdown from "markdown-to-jsx";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { materialOceanic } from "react-syntax-highlighter/dist/esm/styles/prism";
// import { useCodeEditor } from '../store/useCodeEditor';

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


import React from 'react';
import Markdown from "markdown-to-jsx";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialOceanic } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useCodeEditor } from '../store/useCodeEditor';

const CodeEditor = () => {
    const { selectedFile } = useCodeEditor(); // Access the selected file from context

    return (
        <div className="flex-1 bg-base-200 border-neutral border-0 pb-3">
            {/* File name */}
            {selectedFile ? (
                <>
                    <div className="bg-primary/70 p-2 rounded-md mb-2 text-neutral-content font-semibold">
                        {selectedFile.filename}
                    </div>
                    <div className="bg-neutral/10 p-4 rounded-md">
                        {/* Render file content using Markdown */}
                        <Markdown
                            options={{
                                overrides: {
                                    code: {
                                        component: ({ className, children }) => {
                                            const language = className?.replace("lang-", "") || "javascript";
                                            return (
                                                <SyntaxHighlighter
                                                    style={materialOceanic}
                                                    language={language}
                                                    PreTag="div"
                                                >
                                                    {children}
                                                </SyntaxHighlighter>
                                            );
                                        },
                                    },
                                },
                            }}
                        >
                            {`\`\`\`\n${selectedFile.content}\n\`\`\``}
                        </Markdown>
                    </div>
                </>
            ) : (
                <p className="text-gray-500 text-center mt-4">
                    No file selected. Please select a file to view its content.
                </p>
            )}
        </div>
    );
};

export default CodeEditor;
