'use client';

import {createContext, useState, useContext, useEffect, useRef} from "react"
import { io } from 'socket.io-client';

const stateContext = createContext()

export const useStateContext = () => useContext(stateContext);

export const StateProvider = ({children}) => {
    const userObj = useRef({id: '', user: '', roomId: '', xCoord: '', yCoord: ''});
    const roomUsers = useRef(new Map()); //Holding player data, will constantly update
    const socketRef = useRef(null);
    const [roomUsersKeys, updateKeys] = useState(null);
    const [chatMessages, updateMessages] = useState([]);


    
    useEffect(() => {
        socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL);

        socketRef.current.on('add-user', (userInfo) => {
            addUser(userInfo);
            console.log(roomUsers.current.keys());
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

        return () => {
        if (socketRef.current) {
            socketRef.current.removeAllListeners();
            socketRef.current.disconnect();
        }
    };
    },[]);

    const joinRoom = (newRoom) => {
        if (socketRef.current) {
            let id = randomId();
            userObj.current.id = id;
            userObj.current.roomId = newRoom;
            socketRef.current.emit('user-joined', userObj.current);
        }
    }

    const removeUser = (user) => {
        roomUsers.current.delete(user);
        updateKeys(roomUsers.current.keys());
    };

    const addUser = (userInfo) => {
        roomUsers.current.set(userInfo.user, userInfo);
        updateKeys(roomUsers.current.keys());
        console.log(`added user: ${userInfo.user}`);
    }

    const addMessage = (user, msg) => {
        //Functional update to add to most current message list
        updateMessages(prevMessages => [...prevMessages, {msgId: randomId(), username: user.user, content: msg}]);
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
        roomUsersKeys,
        chatMessages,
        joinRoom,
        removeUser,
        addUser,
        addMessage,
    }

    return <stateContext.Provider value={state}>
        {children}
    </stateContext.Provider>
}