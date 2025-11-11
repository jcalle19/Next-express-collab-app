'use client'

import {createContext, useContext, useRef} from 'react';

const refContext = createContext();
export const useRefContext = () => useContext(refContext);

export const RefProvider = ({children}) => {
    //state things
    const userObj = useRef({id: '', socketId: '', user: '', roomId: '', xCoord: '', yCoord: '', canDraw: true, canChat: true, isHost: false, isAdmin: false});
    const roomOptions = useRef({canJoin: true, canDraw: true, canChat: true});
    const roomUsers = useRef(new Map()); //Holding player data, will constantly update
    const roomUsersRef = useRef([]);
    const chatMessagesRef = useRef([]);
    const tokenSetRef = useRef(false);

    //socket things
    const socketRef = useRef(null);
    const socketRefReady = useRef(false);
    const incomingLineRef = useRef([]);
    const roomCanvasesRef = useRef(new Map());

    //Canvas things
    const penInfoRef = useRef({color: 'white', size: 2, scale: 1});
    const canvasOffsetRef = useRef({left: 0, top: 0});
    const canvasSizeRef = useRef({width: 0, height: 0});
    const clearFunctionRef = useRef(null);

    const value={
        userObj,
        roomOptions,
        roomUsers,
        roomUsersRef,
        chatMessagesRef,
        roomCanvasesRef,
        tokenSetRef,
        socketRef,
        socketRefReady,
        incomingLineRef,
        penInfoRef,
        canvasOffsetRef,
        canvasSizeRef,
        clearFunctionRef
    };

    return <refContext.Provider value={value}>
        {children}
    </refContext.Provider>
}