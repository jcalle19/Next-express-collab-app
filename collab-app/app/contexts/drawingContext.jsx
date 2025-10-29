'use client'

import {createContext, useContext} from 'react';

const drawingContext = createContext();
export const useDrawingContext = () => useContext(drawingContext);

export const DrawingProvider = ({children}) => {

    const value={};
    return <drawingContext.Provider value={value}>
        {children}
    </drawingContext.Provider>
}