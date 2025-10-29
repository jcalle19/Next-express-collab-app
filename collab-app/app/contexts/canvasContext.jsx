'use client'

import {createContext, useContext} from 'react';

const canvasContext = createContext();
export const useCanvasContext = () => useContext(canvasContext);

export const CanvasProvider = ({children}) => {

    value={};
    return <canvasContext.Provider value={value}>
        {children}
    </canvasContext.Provider>
}