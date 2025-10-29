'use client'

import {createContext, useContext, useRef} from 'react';

const stateRefContext = createContext();
export const useStateRefContext = () => useContext(stateRefContext);

export const StateRefProvider = ({children}) => {
    const userObj = useRef({id: '', socketId: '', user: '', roomId: '', xCoord: '', yCoord: '', canDraw: true, canChat: true, isHost: false, isAdmin: false});
    const roomOptions = useRef({canJoin: true, canDraw: true, canChat: true});
    const roomUsers = useRef(new Map()); //Holding player data, will constantly update
    const roomUsersRef = useRef([]);
    const chatMessagesRef = useRef([]);
    const tokenSetRef = useRef(false);

    const value={
        userObj,
        roomOptions,
        roomUsers,
        roomUsersRef,
        chatMessagesRef,
        tokenSetRef,
    };

    return <stateRefContext.Provider value={value}>
        {children}
    </stateRefContext.Provider>
}