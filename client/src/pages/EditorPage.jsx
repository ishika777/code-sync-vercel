import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Navigate, useParams} from 'react-router-dom';
import toast from 'react-hot-toast';
import ACTIONS from '../config/Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import Terminal from "../components/Terminal"
import { initSocket } from "../config/socket";

// while(true){
//     console.log("h");
//   }
// status

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);

    const [output, setOutput] = useState([]);

    const location = useLocation();
    const { roomId } = useParams();
    const navigate = useNavigate();

    function leaveRoom() {
        navigate('/');
    }

    const [clients, setClients] = useState([]);

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

            // Listening for joined event
            socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                    }
                    setClients(clients);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                    });
                }
            );

            // Listening for disconnected
            socketRef.current.on(ACTIONS.DISCONNECTED,({ socketId, username }) => {
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

    return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img
                            className="logoImage"
                            src="/code-sync.png"
                            alt="logo"
                        />
                    </div>
                    <h3>Connected</h3>
                    <div className='contentWrapper'>
                        <div className="clientsList">
                            {clients.map((client) => (
                                <Client
                                    key={client.socketId}
                                    username={client.username}
                                />
                            ))}
                        </div>
                        <div className='buttonWrapper'>
                            <button className="btn copyBtn" onClick={copyRoomId}>
                                Copy ROOM ID
                            </button>
                            <button className="btn leaveBtn" onClick={leaveRoom}>
                                Leave
                            </button>
                        </div>
                    </div>
                </div>
                
            </div>
            <div className="editorWrap">
                <Editor
                    socketRef={socketRef}
                    roomId={roomId}
                    onCodeChange={(code) => {
                        codeRef.current = code;
                    }}
                    setOutput={setOutput}
                />
                <Terminal output={output} />
            </div>

        </div>
    );
};

export default EditorPage;