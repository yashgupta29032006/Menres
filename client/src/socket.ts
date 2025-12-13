import { io } from 'socket.io-client';

// In development, we need to point to the backend port.
// In production (when built and served by server.js), it will be relative.
const URL = import.meta.env.DEV ? 'http://localhost:3000' : '/';

export const socket = io(URL);
