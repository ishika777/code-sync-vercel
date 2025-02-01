import {io} from "socket.io-client";
// import { BACKEND_URL } from "../constants/constant";

export const initSocket = async () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000,
        transports: ['websocket'],
    };
    return io(import.meta.env.VITE_BACKEND_URL, options);
};