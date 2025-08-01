'use client';

import {createContext, useState, useContext, useEffect, useRef} from "react"
import { io } from 'socket.io-client';

const stateContext = createContext()

export const useStateContext = () => useContext(stateContext);

export const StateProvider = ({children}) => {
    const userObj = useRef({id: '', user: '', roomId: '', xCoord: '', yCoord: ''});
    const roomUsers = useRef(new Map()); //Holding player data, will constantly update
    const socketRef = useRef(null);
    const socketRefReady = useRef(false);
    const roomUsersRef = useRef([]);
    const roomCommentsRef = useRef(new Map());
    const chatMessagesRef = useRef([]);
    const syncFlag = useRef(false);
    const penInfoRef = useRef({color: 'white', size: 2, scale: 1});
    const mouseLocationRef = useRef({x: 0, y: 0});
    const [lineFlag, updateLineFlag] = useState(false);
    const [highlightFlag, updateHighlight] = useState(false);
    const [undoFlag, updateUndo] = useState(false);
    const [redoFlag, updateRedo] = useState(false);
    const [clearFlag, updateClear] = useState(false);
    const [textEditFlag, updateTextFlag] = useState(true);
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

        socketRef.current.on('add-user', (userInfo) => {
            syncFlag.current = true;
            addUser(userInfo);
        });

        socketRef.current.on('remove-user', (userInfo) => {
            console.log('removing user ', userInfo.user);
            removeUser(userInfo);
        });
        
        socketRef.current.on('update-room', (userInfo) => {
            roomUsers.current.set(userInfo.user, userInfo);
        });

        socketRef.current.on('new-msg', (userInfo, message) => {
            //receive new message
            console.log(`received: ${message}`)
            addMessage(userInfo, message);
        });

        socketRef.current.on('sync-request', () => {
            console.log('Syncing with room', roomUsersRef.current);
            socketRef.current.emit('sync-host-out', userObj.current.roomId, {roomMap: Object.fromEntries(roomUsers.current), keys: roomUsersRef.current}, chatMessagesRef.current);
        });

        socketRef.current.on('sync-host-in', (roomInfo, chatHist) => {
            console.log('syncing from host');
            roomUsers.current = new Map(Object.entries(roomInfo.roomMap));
            updateMessages(chatHist);
            updateKeys([...roomInfo.keys]);
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
        console.log('New list of users: ', roomUsersRef.current);
        sessionStorage.setItem('roomUsersKeys', JSON.stringify(roomUsersRef.current));
        if (syncFlag.current) {
            socketRef.current.emit('sync-host-out', userObj.current.roomId, {roomMap: Object.fromEntries(roomUsers.current), keys: roomUsersRef.current}, chatMessagesRef.current);
        }
        syncFlag.current = false;
    }, [roomUsersKeys]);

    useEffect(() => {
        chatMessagesRef.current = chatMessages;
        console.log('New list of chat messages: ', chatMessagesRef.current);
        sessionStorage.setItem('chatMessages', JSON.stringify(chatMessagesRef.current));
    }, [chatMessages]);

    const joinRoom = (newRoom) => {
        if (socketRef.current) {
            let id = randomId();
            userObj.current.id = id;
            userObj.current.roomId = newRoom;
            sessionStorage.setItem('userObj', JSON.stringify(userObj.current));
            socketRef.current.emit('user-joined', userObj.current);
        }
    }

    const leaveRoom = () => {
        if (socketRef.current) {
            socketRef.current.emit('user-left', userObj.current);
            socketRef.current.emit('clear-room', userObj.current.roomId);
            userObj.current = {id: '', user: '', roomId: '', xCoord: '', yCoord: ''};
            roomUsers.current = new Map();
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
        updateMessages(prevMessages => [...prevMessages, {key: randomId(), username: user.user, content: msg}]);
        console.log('added message');
    }

    const addComment = (commentInfo) => {
        console.log(commentInfo);
        roomCommentsRef.current.set(commentInfo.key, commentInfo);
        updateTextFlag(true);
    }

    const loadRoomState = (roomId) => {
        const storedInfo = JSON.parse(sessionStorage.getItem('userObj'));
        if (userObj.current.roomId === '' && roomId === storedInfo.roomId) {
            userObj.current = storedInfo;
            updateKeys(JSON.parse(sessionStorage.getItem('roomUsersKeys')));
            updateMessages(JSON.parse(sessionStorage.getItem('chatMessages')));
            socketRef.current.emit('user-left', userObj.current);
            socketRef.current.emit('user-joined', userObj.current);
            console.log(userObj.current);
        }
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
        sliderThumbColor,
        penInfoRef,
        mouseLocationRef,
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
        newSliderColor,
        randomId,
    }

    return <stateContext.Provider value={state}>
        {children}
    </stateContext.Provider>
}