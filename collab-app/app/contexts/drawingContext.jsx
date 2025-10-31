'use client'

import {createContext, useContext, useState, useMemo} from 'react';

const drawingContext = createContext();
export const useDrawingContext = () => useContext(drawingContext);

export const DrawingProvider = ({children}) => {
    const [highlightFlag, updateHighlight] = useState(false); //*
    const [backgroundSelectFlag, updateBackgroundSelect] = useState(false);
    const [lineFlag, updateLineFlag] = useState(false); //*
    const [textEditFlag, updateTextFlag] = useState(false); //*
    const [noteDeleteFlag, updateDeleteFlag] = useState(false); //*
    const [undoFlag, updateUndo] = useState(false); //*
    const [redoFlag, updateRedo] = useState(false); //*
    const [previewFontSize, setPreviewFontSize] = useState('50'); //*
    const [penColor, setPenColor] = useState(parseColor('#ffffff')); //*
    const [boxColor, setBoxColor] = useState(parseColor('#000000')); //*
    const [textColor, setTextColor] = useState(parseColor('#ffffff')); //*

    const flagMap = new Map([
        ['undo', [undoFlag, updateUndo]],
        ['redo', [redoFlag, updateRedo]],
        ['clear', [clearFlag, updateClear]],
        ['text', [textEditFlag, updateTextFlag]],
        ['delete', [noteDeleteFlag, updateDeleteFlag]],
        ['highlight', [highlightFlag, triggerHighlight]],
        ['line', [lineFlag, triggerLineTool]],
        ['background', [backgroundSelectFlag, triggerBackgroundFlag]],
    ]);

    const triggerHighlight = (flag) => {
        updateHighlight(flag);
        updateLineFlag(false);
    }

    const triggerLineTool = (flag) => {
        updateLineFlag(flag);
        updateHighlight(false);
    }

    const triggerBackgroundFlag = (flag) => {
        if (userObj.current.isHost) {
           updateBackgroundSelect(flag) ;
        }
    }

    const triggerFlag = (flagName) => {
        let mapAccess = flagMap.get(flagName);
        let varValue = mapAccess[0];
        let funcRef = mapAccess[1];
        funcRef(!varValue);
    }

    const value=useMemo(()=>({
        previewFontSize,setPreviewFontSize,
        penColor, setPenColor,
        boxColor, setBoxColor,
        textColor, setTextColor,
        lineFlag, updateLineFlag,
        noteDeleteFlag, updateDeleteFlag,
        highlightFlag, updateHighlight,
        backgroundSelectFlag, updateBackgroundSelect,
        undoFlag, updateUndo,
        redoFlag, updateRedo,
        triggerFlag,
        flagMap,
    }),[previewFontSize, penColor, boxColor, textColor, lineFlag, noteDeleteFlag, highlightFlag, backgroundSelectFlag, flagMap]);

    return <drawingContext.Provider value={value}>
        {children}
    </drawingContext.Provider>
}