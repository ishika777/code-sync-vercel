import React, { useEffect, useRef, useState } from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Card,
    CardContent,
    CardFooter,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


import { Button } from './ui/button'
import { MessageCircle, Send } from 'lucide-react'
import { Input } from './ui/input'
import axios from 'axios'
import toast from 'react-hot-toast'
import TypingLoader from './TypingLoader'


const AiComponent = ({ editorRef, onCodeChange }) => {

    const messageBox = useRef(null);
    const [loading, setLoading] = useState(false)
        const [isOpen, setIsOpen] = useState(false)
    
    const [messages, setMessages] = useState([
        { sender: 'AI', prompt: 'Hello! How may I assist you today?' },
    ]);
    const [prompt, setPrompt] = useState("");

    const scrollToBottom = () => {
        if (messageBox.current) { // Check if ref exists before using it
            messageBox.current.scrollTop = messageBox.current.scrollHeight;
        }
    }


    const handleClick = async () => {
        try {
            if (prompt === "" || prompt.trim() === "") {
                toast.error("Enter a prompt")
                return;
            }
            setLoading(true);
            setMessages((prev) => [...prev, { sender: "User", prompt }]);
            setPrompt("");
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/ask-ai`, { prompt }, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (response.data.success) {
                const data = JSON.parse(response.data.result)
                setMessages((prev) => [...prev, { sender: "AI", prompt: data.text }]);
                if (data.code) {
                    setIsOpen(false)
                    const editor = editorRef.current;
                    const oldCode = editor.getValue();
                    const updatedCode = oldCode + "\n\n" + data.code;
                
                    editor.setValue(updatedCode);
                    onCodeChange(updatedCode);
                
                    // Get the position of the newly added code
                    const lines = oldCode.split("\n").length + 1; // Start line of new code
                    const newLines = data.code.split("\n").length; // Number of new lines
                    const lastLine = lines + newLines; // Last line of new code
                
                    // Select the newly added code
                    editor.setSelection({
                        startLineNumber: lines,
                        startColumn: 1,
                        endLineNumber: lastLine,
                        endColumn: data.code.length, // Select full new code
                    });
                }
                
            }

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        scrollToBottom();
    }, []);

    return (
        <div>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button className="rounded-full px-2 h-fit"><MessageCircle size={44} strokeWidth={3} /></Button>
                </PopoverTrigger>
                <PopoverContent className="!bg-gray-950 p-0 rounded-xl outline-none border-none mr-8 mb-1">
                    <Card className="outline-none border-none rounded-xl">
                        <div className='w-full items-center justify-center'>
                            <CardContent ref={messageBox} className="message-box w-full rounded-t-xl min-h-72 max-h-[80vh] p-2 !bg-gray-900 overflow-y-auto">

                                {
                                    messages.map((obj, idx) => (

                                        <div key={idx} className='pb-2'>

                                            {
                                                obj.sender === "User" ? (
                                                    <div className={`flex items-center gap-2 justify-end mb-1`}>
                                                        <p className='text-xs bg-purple-700 px-2 py-1 rounded-xl max-w-7/10 break-words'>{obj.prompt}</p>
                                                        <Avatar className="w-6 h-6">
                                                            <AvatarImage src="/user.png" />
                                                            <AvatarFallback>CN</AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                ) : (
                                                    <div className={`flex items-center gap-2 mb-1`}>
                                                        <Avatar className="w-6 h-6">
                                                            <AvatarImage src="/ai.jpeg" />
                                                            <AvatarFallback >AI</AvatarFallback>
                                                        </Avatar>
                                                        <p className='text-xs bg-pink-700 px-2 py-1 rounded-xl max-w-4/5 break-words'>{obj.prompt}</p>
                                                    </div>
                                                )
                                            }

                                        </div>
                                    ))
                                }
                                {
                                    loading && (
                                        <div className='flex items-center gap-2'>
                                            <Avatar className="w-6 h-6">
                                                <AvatarImage src="/ai.jpeg" />
                                                <AvatarFallback >AI</AvatarFallback>
                                            </Avatar>
                                            <span className='bg-pink-700 px-2 pr-4 py-1 rounded-2xl'>

                                            <TypingLoader />
                                            </span>
                                        </div>
                                    )
                                }
                            </CardContent>
                            <CardFooter className="p-0 w-full rounded-b-xl">
                                <div className={`flex w-full h-fit rounded-b-xl ${loading ? "opacity-50 pointer-events-none" : ""}`}>
                                    <Input value={prompt} onKeyDown={(e) => e.key === "Enter" && handleClick()} onChange={(e) => setPrompt(e.target.value)} placeholder="Ask ai" className="rounded-none rounded-bl-xl text-xs !outline-none !border-none !focus:ring-0" />
                                    <Button disabled={loading} onClick={handleClick} className="rounded-none rounded-br-xl w-fit p-3"><Send /></Button>
                                </div>
                            </CardFooter>
                        </div>
                    </Card>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default AiComponent