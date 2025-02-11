import React, { useEffect, useRef, useState } from 'react';
import ACTIONS from '../config/Actions';
import axios from "axios"
import toast from 'react-hot-toast';
import { Button } from './ui/button';
import { Loader, Play } from 'lucide-react';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Editor from '@monaco-editor/react';

const EditorComponent = ({ socketRef, roomId, onCodeChange, setOutput, editorRef }) => {
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState('javascript');


    function handleEditorChange(code) {
        onCodeChange(code);
        setCode(code);
        socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code: code,
        });
    }

    useEffect(() => {
        if (!socketRef.current) {
            return;
        }
        socketRef.current.on(ACTIONS.CODE_UPDATE, ({ code }) => {
            setCode(code);
        });

        return () => {
            socketRef.current.off(ACTIONS.CODE_UPDATE);
        };
    }, [socketRef.current]);

     const runCode = async () => {
        const code = editorRef.current.getValue();
        if (code.length === 0) {
            toast.error("Type some code!")
            return;
        }
        try {
            setLoading(true)
            setOutput([])
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/run`, { code }, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });

            setOutput(response.data)
        } catch (error) {
            console.log(`Error: ${error}`);
        } finally {
            setLoading(false)
        }
    };
   

    return (
        <div className='flex flex-col w-full h-full'>
            <div className='flex items-center justify-between my-1 h-8'>
                <p className='text-black bg-gray-300 font-semibold ml-1 rounded-md p-1 px-3 align-middle'>Script.js</p>
                <Select value={language} onValueChange={setLanguage}>   
                    <SelectTrigger className="w-[140px] h-8 !text-white outline-none border-none !focus:ring-0 !focus:border-transparent">
                        <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent  className="border-none outline-none !shadow-none">
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                    </SelectContent>
                </Select>

                {
                    loading ? (
                        <Button className='flex items-center justify-center mr-3 h-8 !text-white !bg-red-500' style={{ cursor: "not-allowed" }} disabled onClick={runCode}><Loader className='animate-spin' />Running...</Button>
                    ) : (

                        <Button className='flex items-center justify-center mr-3 h-8 !text-white !bg-red-500' onClick={runCode}><Play /> Run Code</Button>
                    )
                }
            </div>
            <div style={{ height: "100%", width: "100%", display: "block" }}>
                <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    language={language}
                    value={code}
                    onMount={(editor) => {
                        editorRef.current = editor; // Store editor instance
                    }}
                    onChange={handleEditorChange}
                    theme="vs-dark"
                    options={{
                        cursorBlinking: "smooth",
                        cursorStyle: "line",
                        cursorWidth: 2,
                        fontSize: 14,
                        lineNumbers: "on",
                        minimap: { enabled: false },
                        automaticLayout: true
                    }}
                />
            </div>

            {/* <textarea id="realtimeEditor"></textarea>     */}
        </div>
    )
};

export default EditorComponent;

// import Codemirror from "codemirror"
// import 'codemirror/lib/codemirror.css'; 
// import 'codemirror/theme/dracula.css'; 
// import 'codemirror/mode/javascript/javascript';
// import 'codemirror/addon/edit/matchbrackets'; 
// import 'codemirror/addon/edit/closebrackets';
// import 'codemirror/addon/edit/closetag';

