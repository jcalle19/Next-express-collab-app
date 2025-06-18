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
    const [socketReady, updateSocketStatus] = useState(false);
    const roomUsersRef = useRef([]);
    const chatMessagesRef = useRef([]);
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
            addUser(userInfo);
        });

        socketRef.current.on('remove-user', (userInfo) => {
            removeUser(userInfo.user);
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
            socketRef.current.emit('sync-host-out', userObj.current.roomId, Object.fromEntries(roomUsers.current), chatMessagesRef.current);
        });

        socketRef.current.on('sync-host-in', (roomInfo, chatHist) => {
            console.log('syncing from host');
            roomUsers.current = new Map(Object.entries(roomInfo));
            updateMessages(chatHist);
        });

        //stuff to do on unmount
        return () => {
            //disconnecting socket
            if (socketRef.current) {
                updateSocketStatus(curr => {
                    socketRefReady.current = false;
                    return false;
                });
                socketRef.current.emit('user-left', userObj.current);
                socketRef.current.removeAllListeners();
                socketRef.current.disconnect();
            }
        };
    },[]);

    useEffect(() => {
        roomUsersRef.current = roomUsersKeys;
        localStorage.setItem('roomUsersKeys', JSON.stringify(roomUsersRef.current));
    }, [roomUsersKeys]);

    useEffect(() => {
        chatMessagesRef.current = chatMessages;
        localStorage.setItem('chatMessages', JSON.stringify(chatMessagesRef.current));
    }, [chatMessages]);

    const joinRoom = (newRoom) => {
        if (socketRef.current) {
            let id = randomId();
            userObj.current.id = id;
            userObj.current.roomId = newRoom;
            localStorage.setItem('userObj', JSON.stringify(userObj.current));
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
            //localStorage.clear();
        }
    }

    const removeUser = (user) => {
        roomUsers.current.delete(user);
        updateKeys([...roomUsers.current.keys()]);
        console.log('New user list: ', [...roomUsers.current.keys()], roomUsersRef);
    };

    const addUser = (userInfo) => {
        roomUsers.current.set(userInfo.user, userInfo);
        updateKeys(currUsers => [...currUsers, {key: randomId(), user: userInfo.user}]);
        console.log(`added user: ${userInfo.user}`, roomUsersKeys);
    }

    const addMessage = (user, msg) => {
        //Functional update to add to most current message list
        updateMessages(prevMessages => [...prevMessages, {key: randomId(), username: user.user, content: msg}]);
        console.log('added message');
    }

    const loadRoomState = (roomId) => {
        const storedInfo = JSON.parse(localStorage.getItem('userObj'));
        if (userObj.current.roomId === '' && roomId === storedInfo.roomId) {
            userObj.current = storedInfo;
            updateKeys(JSON.parse(localStorage.getItem('roomUsersKeys')));
            updateMessages(JSON.parse(localStorage.getItem('chatMessages')));
            socketRef.current.emit('user-joined', userObj.current);
        }
        /*for debugging, dont need rn
        console.log("All LocalStorage contents:");
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            console.log(key, localStorage.getItem(key));
        }
        */
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
        chatMessagesRef,
        joinRoom,
        leaveRoom,
        removeUser,
        addUser,
        addMessage,
        loadRoomState,
    }

    return <stateContext.Provider value={state}>
        {children}
    </stateContext.Provider>
}