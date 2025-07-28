import { useState, useEffect, useRef } from 'react'
import { useStateContext } from '../contexts/userState.jsx'
import DOMPurify from "dompurify"
import '../css/comments.css'

const Comment = () => {
    const { penInfoRef } = useStateContext();
    const originalDimensions = {width: 180, height: 90};
    const [inputText, updateText] = useState('Click to edit comment');
    const [isResizing, updateResizeState] = useState(false);
    const [isTranslating, updateTranslateState] = useState(false);
    const [resizeDistX, updateResizeX] = useState(originalDimensions.width);
    const [resizeDistY, updateResizeY] = useState(originalDimensions.height);
    const [resizeCoords, updateResizeCoords] = useState([0,0]);
    const [translateCoords, updateTranslateCoords] = useState([0,0]);
    const containerRef = useRef(null);
    const containerRect = useRef(null);
    const resizeRef = useRef(null);
    const resizeRect = useRef(null);
    const translateRef = useRef(null);
    const translateRect = useRef(null);

    useEffect(()=> {
        resizeRect.current = resizeRef.current.getBoundingClientRect();
        translateRect.current = translateRef.current.getBoundingClientRect();
        containerRect.current = containerRef.current.getBoundingClientRect();

        let resizeLeft = containerRect.current.left + containerRect.current.width - resizeRect.current.width / 2;
        let resizeTop = containerRect.current.top + containerRect.current.height - resizeRect.current.height / 2;
        let translateLeft = containerRect.current.left;
        let translateTop = containerRect.current.top;
        updateResizeCoords([resizeLeft, resizeTop]);
        updateTranslateCoords([translateLeft, translateTop]);
    },[]);

    const enableResizing = (e) => {
        updateResizeState(true);
        updateTranslateState(false);
    }

    const enableTranslate = (e) => {
        updateTranslateState(true);
        updateResizeState(false);
    }

    const handleDragResize = (e) => {
        if (isResizing) {
            let offsetDistX = dist(e.clientX, 0, translateCoords[0], 0) + 15;
            let offsetDistY = dist(e.clientY, 0, translateCoords[1], 0) + 15;
            updateResizeCoords([e.clientX, e.clientY]);
            updateResizeX(offsetDistX);
            updateResizeY(offsetDistY);
        }
    }

    const handleDragTranslate = (e) => {
        if (isTranslating) {
            const boxOffset = 15;
            let translateX = e.clientX - boxOffset;
            let translateY = e.clientY - boxOffset;
            updateTranslateCoords([translateX, translateY]);
            updateResizeCoords([translateX + resizeDistX - resizeRect.current.width / 2, 
                                translateY + resizeDistY - resizeRect.current.width / 2]);
        }
    }

    const handleConfirm = () => {
        const clean = DOMPurify.sanitize(inputText, {
            ALLOWED_TAGS: ['b', 'i', 'u', 'a', 'p', 'br', 'ul', 'ol', 'li'],
            ALLOWED_ATTR: ['href']
        });
        
    }

    const handleCancel = () => {

    }

    const disableResizing = (e) => {
        updateResizeState(false);
    }

    const disableTranslate = (e) => {
        updateTranslateState(false);
    }

    const dist = (x1, y1, x2, y2) => {
        return Math.hypot(x2 - x1, y2 - y1);
    }

    return (
        <div id='full-window' onMouseMove={isTranslating ? handleDragTranslate : isResizing ? handleDragResize : ()=>{}}>
            <div className='transform' ref={translateRef}
                onDragStart={(e) => e.preventDefault()}
                onMouseDown={enableTranslate}
                onMouseUp={disableTranslate}
                style={{left: `${translateCoords[0]}px`, top: `${translateCoords[1]}px`}}
            >
            </div>
            <div id='comment-container' ref={containerRef}
                onDragStart={(e) => e.preventDefault()}
                
                style={{width: `${resizeDistX}px`, height: `${resizeDistY}px`, left: `${translateCoords[0]}px`, top: `${translateCoords[1]}px`}}>
                <div id='comment-field' 
                    contentEditable='true' 
                    suppressContentEditableWarning
                    role='textbox'
                    onInput={(e)=>{updateText(e.currentTarget.textContent)}}
                    style={{fontSize: `calc(1em * ${resizeDistY / originalDimensions.height})`,
                            lineHeight: `clamp(.2, ${resizeDistY / originalDimensions.height}, 1)`
                          }}
                >
                </div>
                <div id='actions-container' className='grid grid-cols-3 grid-rows-1'>
                    <div id='confirm' className='actions' onClick={handleConfirm}>&#10003;</div>
                    <div id='background' className='actions'></div>
                    <div id='cancel' className='actions'>&#10005;</div>
                </div>
            </div>
            
            <div className='transform resize' ref={resizeRef}
                onDragStart={(e) => e.preventDefault()}
                onMouseDown={enableResizing} 
                onMouseUp={disableResizing}
                style={{left: `${resizeCoords[0]}px`, 
                        top: `${resizeCoords[1]}px`}}
            > 
            </div>
        </div>
    )
}
//`calc(${resizeCoords[0]}px + ${translateCoords[0]}px)`
//${resizeCoords[0]}
export default Comment