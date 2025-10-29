'use client'

import {createContext, useContext} from 'react';

const canvasRefContext = createContext();
export const useCanvasRefContext = () => useContext(canvasRefContext);

export const CanvasRefProvider = ({children}) => {

    value={};
    return <canvasRefContext.Provider value={value}>
        {children}
    </canvasRefContext.Provider>
}