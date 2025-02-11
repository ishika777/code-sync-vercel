import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ACTIONS from '../config/Actions';
import Client from '../components/Client';
import EditorComponent from '../components/Editor';
import Terminal from "../components/Terminal"
import { initSocket } from "../config/socket";
import { Button } from '@/components/ui/button';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import AiComponent from '@/components/AiComponent';


// while(true){
//     console.log("h");
//   }
// status

// take input and interact

const EditorPage = () => {
    const socketRef = useRef(null);
    // const codeRef = useRef(null);
    const editorRef = useRef(null);

    const [output, setOutput] = useState([]);
    const [code, setCode] = useState("");
    const terminalPanelRef = useRef(null);
    

    

    const location = useLocation();
    const { roomId } = useParams();
    const navigate = useNavigate();

    function leaveRoom() {
        navigate('/');
    }

    const [clients, setClients] = useState([]);


    useEffect(() => {
        if (terminalPanelRef.current) {
            terminalPanelRef.current.resize(50);
        }
    }, [output]);

    

    useEffect(() => {
        const init = async () => {

            socketRef.current = await initSocket();

            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                navigate('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });

            socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
                if (username !== location.state?.username) {
                    toast.success(`${username} joined the room.`);
                }
                setClients(clients);
                // console.log(code)
                socketRef.current.emit(ACTIONS.SYNC_CODE, {
                    code,
                    socketId,
                });
            }
            );

            // Listening for disconnected
            socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                toast.success(`${username} left the room.`);
                setClients((prev) => {
                    return prev.filter(
                        (client) => client.socketId !== socketId
                    );
                });
            }
            );
        };
        init();
        return () => {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        };
    }, []);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }

    if (!location.state) {
        return <Navigate to="/" />;
    }

    const onCodeChange= (code) => {
        setCode(code);
    }

    return (
        <div className="flex max-w-screen max-h-screen overflow-hidden">
            <div className="w-[230px] h-screen bg-gray-900 text-white p-3">

                <div className="flex flex-col h-screen relative">
                    <img
                        className="pb-3"
                        width={150}
                        src="/code-sync.png"
                        alt="logo"
                    />
                    <h3 className='font-semibold text-lg pb-3'>Connected Users</h3>

                    <div className='flex flex-1 overflow-auto flex-col justify-between gap-5'>
                        <div className="clientsList overflow-auto flex flex-1 items-start justify-start flex-wrap gap-4">
                            {clients.map((client) => (
                                <Client
                                    key={client.socketId}
                                    username={client.username}
                                />
                            ))}
                        </div>
                        <div className='flex flex-col justify-end mb-5 w-full gap-2'>
                            <Button className="!bg-green-400 w-full hover:!bg-green-500" onClick={copyRoomId}>
                                Copy ROOM ID
                            </Button>
                            <Button className="!bg-green-400 w-full hover:!bg-green-500" onClick={leaveRoom}>
                                Leave
                            </Button>
                        </div>
                    </div>
                </div>

            </div>
            <div className="flex flex-1 h-screen flex-col relative">
                <ResizablePanelGroup direction="vertical" className="h-full w-full overflow-hidden">
                    <ResizablePanel defaultSize={100} minSize={50} className='h-full'>
                        <EditorComponent
                            socketRef={socketRef}
                            roomId={roomId}
                            onCodeChange={onCodeChange}
                            setOutput={setOutput}
                            editorRef={editorRef}
                        />
                    </ResizablePanel>
                    <ResizableHandle
                        withHandle
                        className="w-[5px] bg-gray-500 hover:bg-gray-700 cursor-row-resize"
                    />
                    <ResizablePanel ref={terminalPanelRef} defaultSize={0} maxSize={50} className='h-full'>
                        <Terminal output={output} />
                    </ResizablePanel>
                </ResizablePanelGroup>


            </div>

            <div className='absolute bottom-4 right-4'>
            <AiComponent editorRef={editorRef}  onCodeChange={onCodeChange}/>
            </div>

        </div>
    );
};

export default EditorPage;