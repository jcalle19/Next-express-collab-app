import { useState, useEffect, useRef } from 'react'
import { useStateContext } from '../contexts/userState.jsx'

const ToolBar = () => {
    const [expanded, changeSize] = useState(false);
    const { triggerUndo, triggerRedo } = useStateContext();
    const handleToggleClick = (e) => {
        changeSize(!expanded);
    }

    return (
        <div id='tool-bar-container'>
            <div className={!expanded ? 'tool-bar tool-bar-expand' : 'tool-bar tool-bar-content'}>
                <div id='tool-grid' className={!expanded ? "transparent grid grid-cols-2 grid-rows-4 gap-4" : "grid grid-cols-2 grid-rows-4 gap-4"}>
                    <div className='grid-box '>width</div>
                    <div className='grid-box'>color</div>
                    <div className="grid-box row-start-2">highlight</div>
                    <div className="grid-box row-start-2">clear</div>
                    <div className="grid-box row-start-3">line</div>
                    <div className="grid-box row-start-3">text</div>
                    <div className="grid-box row-start-4" onClick={triggerUndo}>undo</div>
                    <div className="grid-box row-start-4" onClick={triggerRedo}>redo</div>
                </div>
            </div>
            <div className={!expanded ? 'tool-bar tool-bar-expand' : 'tool-bar tool-bar-close'} onClick={handleToggleClick}></div>
        </div>
    )
}

export default ToolBar