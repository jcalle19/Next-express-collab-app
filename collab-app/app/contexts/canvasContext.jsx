'use client'

import {createContext, useContext, useState, useMemo} from 'react';

const canvasContext = createContext();
export const useCanvasContext = () => useContext(canvasContext);

export const CanvasProvider = ({children}) => {
    const [windowSizeX, changeWindowXSize] = useState(0); //*
    const [windowSizeY, changeWindowYSize] = useState(0); //*
    const [canvasSize, updateSize] = useState({width: 0, height: 0});
    const [clearFlag, updateClear] = useState(false);

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

    const windowResize = () => {
        changeWindowXSize(window.innerWidth);
        changeWindowYSize(window.innerHeight);
    }

    const value=useMemo(()=>({
        windowSizeX, changeWindowXSize,
        windowSizeY, changeWindowYSize,
        canvasSize, updateSize,
        clearFlag, updateClear,
    }),[windowSizeX,windowSizeY, canvasSize, undoFlag, redoFlag, clearFlag]);

    return <canvasContext.Provider value={value}>
        {children}
    </canvasContext.Provider>
}