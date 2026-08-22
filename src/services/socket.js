import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const socket = io(socketUrl, {
  autoConnect: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 5000
});
