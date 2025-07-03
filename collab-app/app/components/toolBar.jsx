import { useState, useEffect, useRef } from 'react'

const ToolBar = () => {
    const toolBarRef = useRef();
    const [expanded, changeSize] = useState(false);

    const handleToggleClick = (e) => {
        changeSize(!expanded);
    }

    return (
        <div id='tool-bar-container'>
            <div className={!expanded ? 'tool-bar tool-bar-expand' : 'tool-bar tool-bar-content'}></div>
            <div className={!expanded ? 'tool-bar tool-bar-expand' : 'tool-bar tool-bar-close'} onClick={handleToggleClick}></div>
        </div>
    )
}

export default ToolBar