'use client';

import {createContext, useState, useContext, useEffect, useRef} from "react"
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { TextureLoader } from "three";

const stateContext = createContext()

export const useStateContext = () => useContext(stateContext);

export const StateProvider = ({children}) => {
    const router = useRouter();
    const userObj = useRef({id: '', socketId: '', user: '', roomId: '', xCoord: '', yCoord: '', canDraw: true, canChat: true, isHost: false, isAdmin: false});
    const roomOptions = useRef({canJoin: true, canDraw: true, canChat: true});
    const roomUsers = useRef(new Map()); //Holding player data, will constantly update
    const socketRef = useRef(null);
    const socketRefReady = useRef(false);
    const roomUsersRef = useRef([]);
    const roomCommentsRef = useRef(new Map());
    const chatMessagesRef = useRef([]);
    const tokenSetRef = useRef(false);
    const commentsLoaded = useRef(false);
    const penInfoRef = useRef({color: 'white', size: 2, scale: 1});
    const mouseLocationRef = useRef({x: 0, y: 0});
    const [lineFlag, updateLineFlag] = useState(false);
    const [highlightFlag, updateHighlight] = useState(false);
    const [undoFlag, updateUndo] = useState(false);
    const [redoFlag, updateRedo] = useState(false);
    const [clearFlag, updateClear] = useState(false);
    const [textEditFlag, updateTextFlag] = useState(true);
    const [commentsFlag, updateCommentsFlag] = useState(false);
    const [sliderThumbColor, updateSliderColor] = useState('white');
    const [socketReady, updateSocketStatus] = useState(false);
    const [roomUsersKeys, updateKeys] = useState([]); //Array of objects structured as follows {key: x, username: x}
    const [chatMessages, updateMessages] = useState([]); //Array of objects structured as follows: {key: x, username: x, content: x}

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
            console.log(tokenSetRef.current);
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

    useEffect(() => {
        roomUsersRef.current = roomUsersKeys;
        console.log('New list of users: ', roomUsersKeys);
    }, [roomUsersKeys]);

    useEffect(() => {
        chatMessagesRef.current = chatMessages;
        console.log('New list of chat messages: ', chatMessagesRef.current);
    }, [chatMessages]);

    useEffect(() => {
        if (!commentsLoaded.current) {
            roomCommentsRef.current = new Map(JSON.parse(sessionStorage.getItem('roomCommentsMap')));
            commentsLoaded.current = true;
        }
    },[commentsFlag]);

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
            userObj.current = {id: '', user: '', roomId: '', xCoord: '', yCoord: '', canDraw: true, canChat: true, isAdmin: false};
            roomUsers.current = new Map();
            roomCommentsRef.current = new Map();
            updateKeys([]);
            updateMessages([]);
            sessionStorage.clear();
        }
    }

    const addMessage = (user, msg) => {
        //Functional update to add to most current message list
        socketRef.current.emit('broadcast-msg', user, msg);
    }

    const addComment = () => {
        let randKey = randomId();
        roomCommentsRef.current.set(randKey, {key: randKey, width: 180, height: 90, top: 0, left: 0, text: '', color: 'white'});
        updateCommentsFlag(!commentsFlag);
        updateTextFlag(true);
    }

    const loadRoomState = (roomId) => {
        const roomToken = sessionStorage.getItem('roomToken');
        tokenSetRef.current = true;
        socketRef.current.emit('request-user-info', roomToken, roomId, userObj.current.socketId);
    }

    const triggerUndo = () => {
        updateUndo(!undoFlag);
    }

    const triggerRedo = () => {
        updateRedo(!redoFlag);
    }

    const triggerHighlight = () => {
        updateHighlight(!highlightFlag);
        updateLineFlag(false);
    }

    const triggerLineTool = () => {
        updateLineFlag(!lineFlag);
        updateHighlight(false);
    }

    const triggerClear = () => {
        updateClear(!clearFlag);
    }

    const triggerTextFlag = () => {
        updateTextFlag(!textEditFlag);
    }

    const newSliderColor = (newColor) => {
        updateSliderColor(newColor);
    }

    const randomId = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < 16; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    const disconnectUser = () => {
        leaveRoom();
        router.push('/home');
    }

    const state = {
        userObj,
        roomOptions,
        roomUsers,
        socketRef,
        socketRefReady,
        socketReady,
        roomUsersKeys,
        chatMessages,
        roomUsersRef,
        roomCommentsRef,
        chatMessagesRef,
        undoFlag,
        redoFlag,
        highlightFlag,
        lineFlag,
        clearFlag,
        textEditFlag,
        commentsFlag,
        sliderThumbColor,
        penInfoRef,
        mouseLocationRef,
        createRoom,
        joinRoom,
        leaveRoom,
        addMessage,
        addComment,
        loadRoomState,
        triggerUndo,
        triggerRedo,
        triggerHighlight,
        triggerLineTool,
        triggerClear,
        triggerTextFlag,
        updateCommentsFlag,
        newSliderColor,
    }

    return <stateContext.Provider value={state}>
        {children}
    </stateContext.Provider>
}