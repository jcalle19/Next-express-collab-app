'use client'

import {createContext, useContext, useState, useEffect, useMemo} from 'react'
import {useRefContext} from './refContext.jsx'

const stateContext = createContext();
export const useStateContext = () => useContext(stateContext);

export const RoomStateProvider = ({children}) => {
    const {roomUsersRef,chatMessagesRef} = useRefContext();
    const [roomUsersKeys, updateKeys] = useState([]); //Array of objects structured as follows {key: x, username: x}
    const [chatMessages, updateMessages] = useState([]); //Array of objects structured as follows: {key: x, username: x, content: x}
    const [roomNotes, updateRoomNotes] = useState(new Map());
    const [redrawFlag, triggerRedraw] = useState(false);

    useEffect(() => {
        roomUsersRef.current = roomUsersKeys;
    }, [roomUsersKeys]);

    useEffect(() => {
        chatMessagesRef.current = chatMessages;
    }, [chatMessages]);

    const value= useMemo(() => ({
        roomUsersKeys,updateKeys,
        chatMessages,updateMessages,
        roomNotes, updateRoomNotes,   
        redrawFlag, triggerRedraw,   
    }), [roomUsersKeys, chatMessages, roomNotes, redrawFlag]);

    return <stateContext.Provider value={value}>
        {children}
    </stateContext.Provider>
}