'use client'

import {createContext, useContext, useState, useMemo} from 'react';

const canvasContext = createContext();
export const useCanvasContext = () => useContext(canvasContext);

export const CanvasProvider = ({children}) => {
    const [windowSizeX, changeWindowXSize] = useState(0); //*
    const [windowSizeY, changeWindowYSize] = useState(0); //*
    const [canvasSize, updateSize] = useState({width: 0, height: 0});

    const windowResize = () => {
        changeWindowXSize(window.innerWidth);
        changeWindowYSize(window.innerHeight);
    }

    const value=useMemo(()=>({
        windowSizeX, changeWindowXSize,
        windowSizeY, changeWindowYSize,
        canvasSize, updateSize,
        windowResize,
    }),[windowSizeX ,windowSizeY, canvasSize]);

    return <canvasContext.Provider value={value}>
        {children}
    </canvasContext.Provider>
}