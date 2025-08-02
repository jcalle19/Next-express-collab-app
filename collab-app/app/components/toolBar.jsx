import { useState, useEffect, useRef } from 'react'
import { useStateContext } from '../contexts/userState.jsx'
import ColorPicker from './colorPicker.jsx'
import Comment from './comment.jsx'

const ToolBar = () => {
    const [expanded, changeSize] = useState(false);
    const [sliderValue, changeSlider] = useState('0');
    const sliderPxRef = useRef(2);
    const { triggerUndo, triggerRedo, triggerLineTool, 
            triggerHighlight, triggerClear, triggerTextFlag, 
            sliderThumbColor, penInfoRef, addComment } = useStateContext();

    const minSize = 1;
    const maxSize = 7;
    const maxScale = .822;

    useEffect(() => {
        penInfoRef.current.size = sliderPxRef.current * 2; //multiplying by 2 to account for symmetry of radial gradient to make more accurate
    },[sliderValue, sliderThumbColor]);

    const handleToggleClick = (e) => {
        changeSize(!expanded);
    }

    const handleSliderChange = (newVal) => {
        changeSlider(newVal);
        percentToPixel(newVal);
    }

    const triggerAddComment = () => {
        addComment();
    }

    const percentToPixel = (percent) => {
        sliderPxRef.current = minSize + Math.ceil((percent / 100) * maxSize * penInfoRef.current.scale) ;
    }

    return (
        <>
        <div id='tool-bar-container' className='grid grid-cols-[4fr_1fr]'>
            <div className={!expanded ? 'tool-bar tool-bar-expand' : 'tool-bar tool-bar-content'}>
                <div id='tool-grid' className={!expanded ? "transparent" : ""}>
                    <div className='grid grid-cols-[1fr_3fr]'>
                        <div className='grid-box'>width</div>
                        <div className='grid-box'>
                            <input 
                                id="width-slider" 
                                type="range" min="2" 
                                max="100" value={sliderValue} 
                                onChange={(e) => handleSliderChange(e.target.value)}
                                style={{'--slider-thumb-bg' : 
                                            `radial-gradient(${penInfoRef.current.color} 0px, 
                                            ${penInfoRef.current.color} ${sliderPxRef.current}px, 
                                            transparent  ${sliderPxRef.current}px, 
                                            transparent 100%)`
                                        }}
                            />
                        </div>
                    </div>
                    <div className='grid grid-cols-12 grid-rows-3'>
                        <div className="grid-box col-span-6" onClick={triggerHighlight}>highlight</div>
                        <div className="grid-box col-span-6" onClick={triggerClear}>clear</div>
                        <div className="grid-box col-span-3 row-start-2" onClick={triggerLineTool}>line</div>
                        <div className="grid-box col-span-5 row-start-2" onClick={triggerAddComment}>Comment</div>
                        <div className="grid-box col-span-4 row-start-2" onClick={triggerTextFlag}>Edit text</div>
                        <div className="grid-box col-span-6 row-start-3" onClick={triggerUndo}>undo</div>
                        <div className="grid-box col-span-6 row-start-3" onClick={triggerRedo}>redo</div>
                    </div>

                </div>
                <ColorPicker expanded={expanded}/>
            </div>
            <div className={!expanded ? 'tool-bar tool-bar-expand' : 'tool-bar tool-bar-close'} onClick={handleToggleClick}></div>
        </div>
        </>
    )
}

export default ToolBar