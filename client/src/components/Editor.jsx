import React, { useEffect, useRef, useState } from 'react';
import ACTIONS from '../config/Actions';
import Codemirror from "codemirror"
import 'codemirror/lib/codemirror.css'; 
import 'codemirror/theme/dracula.css'; // Dracula theme
import 'codemirror/mode/javascript/javascript'; // JavaScript mode
import 'codemirror/addon/edit/matchbrackets'; // Addon for bracket matching
import 'codemirror/addon/edit/closebrackets'; // Addon for auto-closing brackets
import 'codemirror/addon/edit/closetag'; 
import axios from "axios"
import toast from 'react-hot-toast';
import { Button } from './ui/button';
import { Loader, Play } from 'lucide-react';


const Editor = ({ socketRef, roomId, onCodeChange, setOutput }) => {
    const editorRef = useRef(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function init() {
            editorRef.current = Codemirror.fromTextArea(document.getElementById('realtimeEditor'),{
                    mode: { name: 'javascript', json: true },
                    theme: 'dracula',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                    autocorrect: true,
                    
                }
            );
            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });
                }
            });
            return () => { editorRef.current.destroy() };
        }

        init();
    }, []);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null) {
                    editorRef.current.setValue(code);
                }
            });
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        };
    }, [socketRef.current]);

    const runCode = async() => {
        const code = editorRef.current.getValue();
        if(code.length === 0){
            toast.error("Type some code!")
            return;
        }
        try {
            setLoading(true)
            setOutput([])
          const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/run`, {code}, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
          });
          
          setOutput(response.data)
          setLoading(false)
        } catch (error) {
            setLoading(false)
          console.log(`Error: ${error}`);
        }finally{
            setLoading(false)
        }
    };
    

    return (
        <div className='flex flex-col w-full h-full'>
            <div className='flex items-center justify-between my-1 h-8'>
                <p className='text-black bg-gray-300 font-semibold ml-1 rounded-md p-1 px-3 align-middle'>Script.js</p>
                {
                    loading ? (
                        <Button className='flex items-center justify-center mr-3 !text-white !bg-red-500' style={{cursor: "not-allowed"}} disabled onClick={runCode}><Loader className='animate-spin' />Running...</Button>
                    ) : (

                        <Button className='flex items-center justify-center mr-3 !text-white !bg-red-500' onClick={runCode}><Play /> Run Code</Button>
                    )
                }
            </div>
            
        <textarea id="realtimeEditor"></textarea>    
        </div>
    )
};

export default Editor;
