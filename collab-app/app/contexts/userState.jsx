'use client';

import {createContext, useState, useContext, useEffect, useRef} from "react"
import { io } from 'socket.io-client';

const stateContext = createContext()

export const useStateContext = () => useContext(stateContext);

export const StateProvider = ({children}) => {
    const userObj = useRef({id: '', user: '', roomId: '', xCoord: '', yCoord: ''});
    const roomUsers = useRef(new Map()); //Holding player data, will constantly update
    const socketRef = useRef(null);


    
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
            console.log(roomUsers.current.get(userInfo.user));
        });

        return () => {
        if (socketRef.current) {
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
            console.log(userObj.current, 'hello');
        }
    }
    
    const removeUser = (user) => {
        roomUsers.current.delete(user);
    };

    const addUser = (userInfo) => {
        roomUsers.current.set(userInfo.user, userInfo);
        console.log(`added user: ${userInfo.user}`);
    }

    const randomId= () => {
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
        joinRoom,
        removeUser,
        addUser,
    }

    return <stateContext.Provider value={state}>
        {children}
    </stateContext.Provider>
}