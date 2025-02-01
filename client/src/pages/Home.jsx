import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


const Home = () => {

    const navigate = useNavigate();

    const [roomId, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        toast.success('Created a new room');
    };

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error('ROOM ID & username is required');
            return;
        }

        // Redirect
        navigate(`/editor/${roomId}`, {
            state: {
                username,
            },
        });
    };

    const EnterButtonEvent = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    };
    return (
        <div className="flex items-center justify-center h-screen bg-gray-950 text-white">
            <Card className="min-w-[400px] light">
                <CardHeader>
                    <CardTitle>
                        <img src="/code-sync.png" width={200} alt="logo" />
                    </CardTitle>
                </CardHeader>
                    <CardContent>
                        <div className='flex flex-col gap-5'>
                            <Input
                                type="text"
                                className="!bg-white !text-black font-semibold focus-visible:ring-0 border-none outline-none"
                                placeholder="Room Id"
                                onChange={(e) => setRoomId(e.target.value)}
                                value={roomId}
                                onKeyUp={EnterButtonEvent}
                            />
                            <Input
                                type="text"
                                className="!bg-white !text-black font-semibold focus-visible:ring-0 border-none outline-none"
                                placeholder="Username"
                                onChange={(e) => setUsername(e.target.value)}
                                value={username}
                                onKeyUp={EnterButtonEvent}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className='flex flex-col gap-2 w-full'>
                            <Button className="w-full text-lg !bg-green-400 hover:!bg-green-500" onClick={joinRoom}>
                                Join
                            </Button>
                            <div className="flex items-center justify-center">
                                <span className='text-md'>Don't have an invite link? &nbsp;</span>
                                <p onClick={createNewRoom} className="text-green-400 cursor-pointer text-lg hover:text-green-500">
                                    New Room
                                </p>
                            </div>
                        </div>
                    </CardFooter>
            </Card>
        </div>
    );
};

export default Home;