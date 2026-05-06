import { io } from 'socket.io-client'

export const socket = io(
    'https://ff-banpick-server.onrender.com',
    {
        transports: ['websocket'],
        autoConnect: false,
    }
)