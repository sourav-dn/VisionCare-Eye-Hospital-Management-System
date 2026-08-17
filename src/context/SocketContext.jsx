import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Connect to socket server
    const socket = io('/', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);

      // Join role-specific rooms
      if (user.role === 'doctor') {
        socket.emit('join-doctor-room', user._id);
      } else if (user.role === 'receptionist') {
        socket.emit('join-receptionist');
      }
    });

    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [user]);

  const on  = (event, handler) => socketRef.current?.on(event, handler);
  const off = (event, handler) => socketRef.current?.off(event, handler);
  const emit = (event, data)   => socketRef.current?.emit(event, data);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, on, off, emit }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
