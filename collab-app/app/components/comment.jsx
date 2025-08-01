import { useState, useEffect, useRef } from 'react'
import { useStateContext } from '../contexts/userState.jsx'
import DOMPurify from "dompurify"
import '../css/comments.css'

const Comment = ({commentInfo}) => {
    const { textEditFlag, roomCommentsRef, penInfoRef } = useStateContext();
    const originalDimensions = {width: commentInfo.width, height: commentInfo.height};
    const [inputText, updateText] = useState(commentInfo.text);
    const [isResizing, updateResizeState] = useState(false);
    const [isTranslating, updateTranslateState] = useState(false);
    const [resizeDistX, updateResizeX] = useState(originalDimensions.width);
    const [resizeDistY, updateResizeY] = useState(originalDimensions.height);
    const [resizeCoords, updateResizeCoords] = useState([0,0]);
    const [translateCoords, updateTranslateCoords] = useState([0,0]);
    const [isEditable, toggleEdits] = useState(true);
    const [expandedMenu, toggleMenu] = useState(false);
    const containerRef = useRef(null);
    const containerRect = useRef(null);
    const resizeRef = useRef(null);
    const resizeRect = useRef(null);
    const translateRef = useRef(null);
    const translateRect = useRef(null);

    useEffect(() => {
        resizeRect.current = resizeRef.current.getBoundingClientRect();
        translateRect.current = translateRef.current.getBoundingClientRect();
        containerRect.current = containerRef.current.getBoundingClientRect();

        let resizeLeft = containerRect.current.left + containerRect.current.width - resizeRect.current.width / 2;
        let resizeTop = containerRect.current.top + containerRect.current.height - resizeRect.current.height / 2;
        let translateLeft = containerRect.current.left;
        let translateTop = containerRect.current.top;
        updateResizeCoords([resizeLeft, resizeTop]);
        updateTranslateCoords([translateLeft, translateTop]);

        return ()=>{
            window.removeEventListener('mousemove', handleDragTranslate);
            window.removeEventListener('mousemove', handleDragResize);
        };
    },[]);

    useEffect(() => {
        if (isTranslating) {
            window.addEventListener('mousemove', handleDragTranslate);
        } else if (isResizing) {
            window.addEventListener('mousemove', handleDragResize);
        }
        return () => {
            window.removeEventListener('mousemove', handleDragTranslate);
            window.removeEventListener('mousemove', handleDragResize);
        }
    }, [isTranslating, isResizing]);


    useEffect(() => {
        toggleEdits(textEditFlag);
        if (!textEditFlag && commentInfo.text === '') {
            handleCancel();
        }
    },[textEditFlag]);

    useEffect(()=>{
        roomCommentsRef.current.get(commentInfo.key).text = inputText;
    },[inputText]);
    
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
        toggleMenu(false);
        toggleEdits(false);
    }

    const handleCancel = () => {
        roomCommentsRef.current.delete(commentInfo.key);
    }

    const handleEdit = () => {
        toggleMenu(!expandedMenu);
    }

    const disableResizing = (e) => {
        updateResizeState(false);
        window.removeEventListener('mousemove', handleDragResize);
    }

    const disableTranslate = (e) => {
        updateTranslateState(false);
        window.removeEventListener('mousemove', handleDragTranslate);
    }

    const dist = (x1, y1, x2, y2) => {
        return Math.hypot(x2 - x1, y2 - y1);
    }

    return (
        <div id='comment-container' style={{pointerEvents: `${isEditable ? 'auto' : 'none'}`}}>
            <div id='translate-handle' className='transform' ref={translateRef}
                onDragStart={(e) => e.preventDefault()}
                onMouseDown={enableTranslate}
                onMouseUp={disableTranslate}
                style={{left: `${translateCoords[0]}px`, top: `${translateCoords[1]}px`, display: `${isEditable ? '' : 'none'}`}}
            >   &#10070;
                <div className='actions-container' style={{display: `${isEditable ? '' : 'none'}`}}>
                    <div id='edit' className='actions'
                         onClick={handleEdit}>&#9998;</div>
                    <div id='confirm' className='actions' 
                         style={{transform: `translateY(${expandedMenu ? `${resizeRect.current.width}px` : '0px'})`}}
                         onClick={handleConfirm}>&#10003;
                    </div>
                    <div id='cancel' className='actions'
                         style={{transform: `translateY(${expandedMenu ? `${2 * resizeRect.current.width}px` : '0px'})`}}
                         onClick={handleCancel}>&#10005;
                    </div>
                </div>
            </div>
            <div id='content-container' ref={containerRef}
                onDragStart={(e) => e.preventDefault()}
                
                style={{width: `${resizeDistX}px`, height: `${resizeDistY}px`, 
                        left: `${translateCoords[0]}px`, top: `${translateCoords[1]}px`
                       }}>
                <div id='comment-field' 
                    contentEditable='true' 
                    suppressContentEditableWarning
                    role='textbox'
                    onInput={(e)=>{updateText(e.currentTarget.textContent)}}
                    style={{fontSize: `calc(1em * ${resizeDistY / originalDimensions.height})`,
                            lineHeight: `clamp(.2, ${resizeDistY / originalDimensions.height}, 1)`,
                            border: `${isEditable ? '1px dashed white' : 'none'}`
                          }}
                >
                </div>
            </div>
            
            <div className='transform resize' ref={resizeRef}
                onDragStart={(e) => e.preventDefault()}
                onMouseDown={enableResizing} 
                onMouseUp={disableResizing}
                style={{left: `${resizeCoords[0]}px`, 
                        top: `${resizeCoords[1]}px`,
                        display: `${isEditable ? '' : 'none'}`}}
            > 
            </div>
        </div>
    )
}


export default Comment