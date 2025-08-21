'use client';

import {createContext, useState, useContext, useEffect, useRef} from "react"
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { TextureLoader } from "three";

const stateContext = createContext()

export const useStateContext = () => useContext(stateContext);

export const StateProvider = ({children}) => {
    const router = useRouter();
    const userObj = useRef({id: '', user: '', roomId: '', xCoord: '', yCoord: ''});
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
            updateSocketStatus(curr => {
                socketRefReady.current = true;
                return true;
            });
        });

        socketRef.current.on('confirm-room-creation', (status, info) => {
            if (status) {
                joinRoom(info.roomId);
                sessionStorage.setItem('hostId', info.hostId);
                router.push(`/rooms/${info.roomId}`);
            } else {
                console.log('Error creating room');
            }
        });

        socketRef.current.on('confirm-room-join', (status, roomId, roomToken) => {
            if (status) {
                sessionStorage.setItem('roomToken', roomToken);
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

        socketRef.current.on('add-user', (userInfo) => {
            addUser(userInfo);
        });

        socketRef.current.on('remove-user', (userInfo) => {
            console.log('removing user ', userInfo.user);
            removeUser(userInfo);
        });
        
        socketRef.current.on('update-room', (userInfo) => {
            roomUsers.current.set(userInfo.user, userInfo);
        });

        socketRef.current.on('token-valid', (valid, roomInfo) => {
            if (valid) {
                const members = new Map(roomInfo.members);
                const chatMessages = roomInfo.chat;
                roomUsers.current = members;
                updateKeys(Array.from(members.values()));
                updateMessages(chatMessages);
            } else {
                disconnectUser();
            }
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
            socketRef.current.emit('create-room', roomId, hostId);
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
            socketRef.current.emit('user-left', userObj.current);
            socketRef.current.emit('clear-room', userObj.current.roomId);
            userObj.current = {id: '', user: '', roomId: '', xCoord: '', yCoord: ''};
            roomUsers.current = new Map();
            roomCommentsRef.current = new Map();
            updateKeys([]);
            updateMessages([]);
            sessionStorage.clear();
        }
    }

    const removeUser = (userInfo) => {
        roomUsers.current.delete(userInfo.user);
        roomUsersRef.current = roomUsersRef.current.filter(obj => obj.user !== userInfo.user);
        updateKeys([...roomUsersRef.current]);
        console.log('New user list: ', [...roomUsersRef.current]);
    };

    const addUser = (userInfo) => {
        roomUsers.current.set(userInfo.user, userInfo);
        updateKeys(currUsers => [...currUsers, {key: randomId(), user: userInfo.user}]);
        console.log(`added user: ${userInfo.user}`, roomUsersRef.current);
    }

    const addMessage = (user, msg) => {
        //Functional update to add to most current message list
        socketRef.current.emit('broadcast-msg', user, msg);
        console.log('added message');
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
        socketRef.current.emit('request-user-info', roomToken, roomId);
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
        sessionStorage.clear();
        router.push('/home');
    }

    const state = {
        userObj,
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
        removeUser,
        addUser,
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