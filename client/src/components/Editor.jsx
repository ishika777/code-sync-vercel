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
import { BACKEND_URL } from '../constants/constant';


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
          const response = await axios.post('${BACKEND_URL}/run', {code}, {
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
        <>
            <div className='editor-file-button'>
                <span className='file-name'>Script.js</span>
                {
                    loading ? (
                        <button className='run-btn btn' style={{cursor: "not-allowed"}} disabled onClick={runCode}><i className="ri-loader-line"></i>Running...</button>
                    ) : (

                        <button className='run-btn btn' onClick={runCode}>Run Code</button>
                    )
                }
            </div>
            <textarea id="realtimeEditor"></textarea>    
        </>
    )
};

export default Editor;
