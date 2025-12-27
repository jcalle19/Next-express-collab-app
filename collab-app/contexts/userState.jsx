'use client';

import {createContext, useState, useContext, useEffect, useRef} from "react"
import {parseColor} from 'react-aria-components'
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';

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
    const chatMessagesRef = useRef([]);
    const incomingLineRef = useRef([]);
    const tokenSetRef = useRef(false);
    const penInfoRef = useRef({color: 'white', size: 2, scale: 1});
    const canvasOffsetRef = useRef({left: 0, top: 0});
    const canvasSizeRef = useRef({width: 0, height: 0});
    const [canvasSize, updateSize] = useState({width: 0, height: 0});
    const [windowSizeX, changeWindowXSize] = useState(0);
    const [windowSizeY, changeWindowYSize] = useState(0);
    const [canvasBackground, updateBackground] = useState('');
    const [canvasZoom, updateZoom] = useState(100); 
    const [penColor, setPenColor] = useState(parseColor('#ffffff'));
    const [boxColor, setBoxColor] = useState(parseColor('#000000'));
    const [textColor, setTextColor] = useState(parseColor('#ffffff'));
    const [previewFontSize, setPreviewFontSize] = useState('50');
    const [backgroundSelectFlag, updateBackgroundSelect] = useState(false);
    const [lineFlag, updateLineFlag] = useState(false);
    const [highlightFlag, updateHighlight] = useState(false);
    const [undoFlag, updateUndo] = useState(false);
    const [redoFlag, updateRedo] = useState(false);
    const [clearFlag, updateClear] = useState(false);
    const [textEditFlag, updateTextFlag] = useState(false);
    const [noteDeleteFlag, updateDeleteFlag] = useState(false);
    const [socketReady, updateSocketStatus] = useState(false);
    const [roomUsersKeys, updateKeys] = useState([]); //Array of objects structured as follows {key: x, username: x}
    const [chatMessages, updateMessages] = useState([]); //Array of objects structured as follows: {key: x, username: x, content: x}
    const [roomNotes, updateRoomNotes] = useState(new Map());

    const triggerBackgroundFlag = (flag) => {
        if (userObj.current.isHost) {
           updateBackgroundSelect(flag) ;
        }
    }

    const triggerHighlight = (flag) => {
        updateHighlight(flag);
        updateLineFlag(false);
    }

    const triggerLineTool = (flag) => {
        updateLineFlag(flag);
        updateHighlight(false);
    }

    const flagMap = new Map([
        ['undo', [undoFlag, updateUndo]],
        ['redo', [redoFlag, updateRedo]],
        ['clear', [clearFlag, updateClear]],
        ['text', [textEditFlag, updateTextFlag]],
        ['delete', [noteDeleteFlag, updateDeleteFlag]],
        ['highlight', [highlightFlag, triggerHighlight]],
        ['line', [lineFlag, triggerLineTool]],
        ['background', [backgroundSelectFlag, triggerBackgroundFlag]],
    ]);

    const triggerFlag = (flagName) => {
        let mapAccess = flagMap.get(flagName);
        let varValue = mapAccess[0];
        let funcRef = mapAccess[1];
        funcRef(!varValue);
    }

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
        //console.log('New list of users: ', roomUsersKeys);
    }, [roomUsersKeys]);

    useEffect(() => {
        chatMessagesRef.current = chatMessages;
        //console.log('New list of chat messages: ', chatMessagesRef.current);
    }, [chatMessages]);

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
            updateKeys([]);
            updateMessages([]);
            sessionStorage.clear();
        }
    }

    const windowResize = () => {
        changeWindowXSize(window.innerWidth);
        changeWindowYSize(window.innerHeight);
    }

    const addMessage = (user, msg) => {
        //Functional update to add to most current message list
        socketRef.current.emit('broadcast-msg', user, msg);
    }

    const addNote = (user, noteInfo) => {
        socketRef.current.emit('broadcast-note', user, noteInfo);
    }

    const loadRoomState = (roomId) => {
        const roomToken = sessionStorage.getItem('roomToken');
        tokenSetRef.current = true;
        socketRef.current.emit('request-user-info', roomToken, roomId, userObj.current.socketId);
    }

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
        roomNotes,
        socketRef,
        socketRefReady,
        socketReady,
        roomUsersKeys,
        chatMessages,
        roomUsersRef,
        chatMessagesRef,
        incomingLineRef,
        windowSizeX,
        windowSizeY,
        canvasSize,
        canvasOffsetRef,
        canvasSizeRef,
        canvasBackground,
        canvasZoom,
        penColor,
        boxColor,
        textColor,
        previewFontSize,
        backgroundSelectFlag,
        undoFlag,
        redoFlag,
        highlightFlag,
        lineFlag,
        clearFlag,
        textEditFlag,
        noteDeleteFlag,
        flagMap,
        penInfoRef,
        createRoom,
        joinRoom,
        leaveRoom,
        addMessage,
        addNote,
        windowResize,
        updateSize,
        loadRoomState,
        setBackground,
        setPenColor,
        setBoxColor,
        setTextColor,
        setPreviewFontSize,
        triggerFlag,
        zoomIn,
        zoomOut,
    }

    return <stateContext.Provider value={state}>
        {children}
    </stateContext.Provider>
}