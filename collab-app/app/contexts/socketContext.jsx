'use client'

import {createContext, useContext, useRef, useState, useEffect, useMemo} from 'react';
import {useRefContext} from './refContext.jsx';
import {useStateContext} from './stateContext.jsx';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';

const socketContext = createContext();
export const useSocketContext = () => useContext(socketContext);

export const SocketProvider = ({children}) => {
    const {userObj, roomOptions, roomUsers, tokenSetRef,
           socketRef, socketRefReady,incomingLineRef} = useRefContext();
    const {updateKeys, updateMessages, updateRoomNotes} = useStateContext();
    const [socketReady, updateSocketStatus] = useState(false);
    const [hostFlag, setHostFlag] = useState(false);

    //canvas exceptions
    const [canvasBackground, updateBackground] = useState(''); //*
    const [canvasZoom, updateZoom] = useState(100);
    
    const router = useRouter();
    

    useEffect(() => {
        //Socket stuff
        socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL);

        socketRef.current.on('connect', () => {
            userObj.current.socketId = socketRef.current.id;
            updateSocketStatus(curr => {
                socketRefReady.current = true;
                return true;
            });
        });

        socketRef.current.on('confirm-room-creation', (status, info) => {
            if (status) {
                sessionStorage.setItem('hostId', info.hostId);
                userObj.current.isAdmin = true;
                userObj.current.isHost = true;
                joinRoom(info.roomId);
            } else {
                console.log('Error creating room');
            }
        });

        socketRef.current.on('confirm-room-join', (status, roomId, roomToken) => {
            console.log('joining room');
            if (status) {
                sessionStorage.setItem('roomToken', roomToken);
                if (userObj.current.isHost) {
                    socketRef.current.emit('edit-admins', userObj.current.roomId, roomToken, true);
                }
                tokenSetRef.current = true;
                router.push(`/rooms/${roomId}`);
            } else {
                console.log('error joining room');
            }
        });

        socketRef.current.on('sync-with-server', (roomInfo) => {
            if (tokenSetRef.current) {
                let currToken = sessionStorage.getItem('roomToken');
                socketRef.current.emit('check-token', userObj.current.roomId, currToken);
            }
        });

        socketRef.current.on('receive-user-info', (status, received) => {
            if (status) {
                userObj.current = received;
                console.log('received info', received);
                socketRef.current.emit('request-sync', (userObj.current.roomId));
            } else {
                console.log('Could not get user info from server');
                disconnectUser();
            }
        });
        
        socketRef.current.on('draw-from-server', (strokeBatch) => {
            incomingLineRef.current.push(strokeBatch);
        });

        socketRef.current.on('update-room', (token, userInfo) => {
            roomUsers.current.set(token, userInfo);
        });

        socketRef.current.on('token-valid', (valid, roomInfo) => {
            if (valid) {
                const members = new Map(roomInfo.members);
                const chatMessages = roomInfo.chat;
                roomUsers.current = members;
                roomOptions.current = roomInfo.options;
                updateKeys(Array.from(members.values()));
                updateMessages(chatMessages);
                updateRoomNotes(new Map(roomInfo.notes));
                updateBackground(roomInfo.background);
                updateZoom(roomInfo.zoom);
                setHostFlag(userObj.current.isHost);
            } else {
                disconnectUser();
            }
        });

        socketRef.current.on('update-drawing', (value) => {
            userObj.current.canDraw = value;
            const token = sessionStorage.getItem('roomToken');
            socketRef.current.emit('update-room', userObj.current, token);
        });
        socketRef.current.on('update-chat', (value) => {
            userObj.current.canChat = value;
            const token = sessionStorage.getItem('roomToken');
            socketRef.current.emit('update-room', userObj.current, token);
        });
        socketRef.current.on('update-admin', (value) => {
            userObj.current.isAdmin = value;
            const token = sessionStorage.getItem('roomToken');
            socketRef.current.emit('update-room', userObj.current, token);
            socketRef.current.emit('edit-admins', userObj.current.roomId, token, value);
        });

        socketRef.current.on('kick', () => {
            disconnectUser();
        });

        //stuff to do on unmount
        return () => {
            //disconnecting socket
            if (socketRef.current) {
                updateSocketStatus(curr => {
                    socketRefReady.current = false;
                    return false;
                });
                //socketRef.current.emit('user-left', userObj.current);
                socketRef.current.removeAllListeners();
                socketRef.current.disconnect();
            }
        };
    },[]);

    /*-------------- Add host verification to these ones --------------*/
    useEffect(() => {
        if (canvasBackground !== '' && userObj.current.isHost) {
            socketRef.current.emit('update-background', userObj.current.roomId, canvasBackground);
        }
    }, [canvasBackground]);
    
    useEffect(() => {
        if (userObj.current.roomId !== '' && userObj.current.isHost) {
            socketRef.current.emit('update-zoom', userObj.current.roomId, canvasZoom);
        }
    }, [canvasZoom]);

    const setBackground = (url) => {
        updateBackground(url);
    }

    const zoomIn = () => {
        if (canvasZoom + 25 < 450) {
            updateZoom(canvasZoom + 25);
        }
    }

    const zoomOut = () => {
        if (canvasZoom - 25 > 0) {
            updateZoom(canvasZoom - 25);
        }
    }
    /*--------------------------------------------------------------------*/

    const addMessage = (user, msg) => {
        //Functional update to add to most current message list
        socketRef.current.emit('broadcast-msg', user, msg);
    }

    const addNote = (user, noteInfo) => {
        socketRef.current.emit('broadcast-note', user, noteInfo);
    }

     const createRoom = () => {
        if (socketRef.current) {
            let roomId = randomId();
            let hostId = randomId();
            socketRef.current.emit('create-room', roomId, hostId, roomOptions.current);
        }
    }

    const joinRoom = (newRoom) => {
        if (socketRef.current) {
            let id = randomId();
            let serverToken = randomId();
            userObj.current.id = id;
            userObj.current.roomId = newRoom;
            socketRef.current.emit('user-joined', userObj.current, serverToken);
        }
    }

    const leaveRoom = () => {
        if (socketRef.current) {
            const token = sessionStorage.getItem('roomToken');
            socketRef.current.emit('clear-room', userObj.current.roomId);
            socketRef.current.emit('user-left', userObj.current.roomId, token);
            userObj.current = {id: '', user: '', roomId: '', xCoord: '', yCoord: '', canDraw: true, canChat: true, isHost: false, isAdmin: false};
            roomUsers.current = new Map();
            updateKeys([]);
            updateMessages([]);
            sessionStorage.clear();
        }
    }

    const loadRoomState = (roomId) => {
        const roomToken = sessionStorage.getItem('roomToken');
        const hostId = sessionStorage.getItem('hostId');
        tokenSetRef.current = true;
        socketRef.current.emit('request-user-info', roomToken, hostId, roomId, userObj.current.socketId);
    }

    const disconnectUser = () => {
        leaveRoom();
        router.push('/home');
    }

    const randomId = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < 16; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    const value=useMemo(()=>({
        socketReady,
        updateSocketStatus,
        addMessage,
        addNote,
        createRoom,
        joinRoom,
        leaveRoom,
        loadRoomState,
        canvasZoom,
        canvasBackground,
        setBackground,
        loadRoomState,
        zoomIn,
        zoomOut,
        hostFlag,
    }),[socketReady, canvasBackground, canvasZoom, hostFlag]);

    return <socketContext.Provider value={value}>
        {children}
    </socketContext.Provider>
}