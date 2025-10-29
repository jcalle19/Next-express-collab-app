'use client'

import {createContext, useContext, useState, useEffect, useMemo} from 'react'
import {useStateRefContext} from './stateRefContext.jsx'

const stateContext = createContext();
export const useStateContext = () => useContext(stateContext);

export const RoomStateProvider = ({children}) => {
    const { userObj,roomOptions,roomUsers,roomUsersRef,chatMessagesRef,tokenSetRef } = useStateRefContext();
    const [roomUsersKeys, updateKeys] = useState([]); //Array of objects structured as follows {key: x, username: x}
    const [chatMessages, updateMessages] = useState([]); //Array of objects structured as follows: {key: x, username: x, content: x}
    const [roomNotes, updateRoomNotes] = useState(new Map());

    useEffect(() => {
        roomUsersRef.current = roomUsersKeys;
    }, [roomUsersKeys]);

    useEffect(() => {
        chatMessagesRef.current = chatMessages;
    }, [chatMessages]);

    const value= useMemo(() => ({
        roomUsersKeys,
        chatMessages,
        roomNotes,
        updateKeys,
        updateMessages,
        updateRoomNotes,
    }), [roomUsersKeys, chatMessages, roomNotes]);

    return <stateContext.Provider value={value}>
        {children}
    </stateContext.Provider>
}