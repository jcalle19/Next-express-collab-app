import { useState, useEffect, useRef } from 'react'

const ToolBar = () => {
    const toolBarRef = useRef();
    const [expanded, changeSize] = useState(false);

    const handleToggleClick = (e) => {
        changeSize(!expanded);
    }

    return (
        <>
            <div className={expanded ? 'tool-bar tool-bar-expand' : 'tool-bar tool-bar-content'}></div>
            <div className={expanded ? 'tool-bar tool-bar-expand' : 'tool-bar tool-bar-close'} onClick={handleToggleClick}></div>
        </>
    )
}

export default ToolBar