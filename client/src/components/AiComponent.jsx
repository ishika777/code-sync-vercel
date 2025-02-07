import React, { useState } from 'react'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import { Button } from './ui/button'
import { MessageCircle, Send } from 'lucide-react'
import { Input } from './ui/input'


const AiComponent = () => {

    const [messages, setMessages] = useState(new Set());

    return (
        <div>
            <Popover>
                <PopoverTrigger>
                    <Button className="rounded-full px-2 h-fit"><MessageCircle size={44} strokeWidth={3} /></Button>
                </PopoverTrigger>
                <PopoverContent className="!bg-gray-950 p-0 outline-none border-none mr-8 mb-1">
                    <Card className="outline-none border-none">
                        <CardContent className="p-0 !bg-gray-900">
                            <div className='min-h-72 max-h-[80vh]'></div>
                        </CardContent>
                        <CardFooter className="p-0 w-full">
                            <div className='flex w-full'>
                                <Input className="rounded-none outline-none border-none" />
                                <Button className="rounded-none"><Send /></Button>
                            </div>
                        </CardFooter>
                    </Card>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default AiComponent