import { useState, useEffect, useRef } from 'react'
import { useStateContext } from '../contexts/userState.jsx'
import ColorPicker from './colorPicker.jsx';

const ToolBar = () => {
    const [expanded, changeSize] = useState(false);
    const [sliderValue, changeSlider] = useState('0');
    const { triggerUndo, triggerRedo } = useStateContext();
    const handleToggleClick = (e) => {
        changeSize(!expanded);
    }

    return (
        <div id='tool-bar-container'>
            <div className={!expanded ? 'tool-bar tool-bar-expand' : 'tool-bar tool-bar-content'}>
                <div id='tool-grid' className={!expanded ? "transparent" : ""}>
                    <div className='grid grid-cols-[1fr_3fr]'>
                        <div className='grid-box'>width</div>
                        <div className='grid-box'>
                            <input type="range" min="1" max="100" value={sliderValue} onChange={(e) => changeSlider(e.target.value)}></input>
                        </div>
                    </div>
                    <div className='grid grid-cols-2 grid-rows-4'>
                        <div className="grid-box">highlight</div>
                        <div className="grid-box">clear</div>
                        <div className="grid-box row-start-2">line</div>
                        <div className="grid-box row-start-2">text</div>
                        <div className="grid-box row-start-3" onClick={triggerUndo}>undo</div>
                        <div className="grid-box row-start-3" onClick={triggerRedo}>redo</div>
                        <div className="grid-box row-start-4"></div>
                    </div>

                </div>
                <ColorPicker/>
            </div>
            
            <div className={!expanded ? 'tool-bar tool-bar-expand' : 'tool-bar tool-bar-close'} onClick={handleToggleClick}></div>
        </div>
    )
}

export default ToolBar