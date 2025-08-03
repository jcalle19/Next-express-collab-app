import { useState, useEffect, useRef } from 'react'
import { useStateContext } from '../contexts/userState.jsx'
import DOMPurify from "dompurify"
import '../css/comments.css'

const Comment = ({commentInfo}) => {
    const { textEditFlag, commentsFlag, roomCommentsRef, updateCommentsFlag, windowSizeRef, penInfoRef } = useStateContext();
    const dimensions = {width: commentInfo.width, height: commentInfo.height};
    const [inputText, updateText] = useState(commentInfo.text);
    const [isResizing, updateResizeState] = useState(false);
    const [isTranslating, updateTranslateState] = useState(false);
    const [resizeDistX, updateResizeX] = useState(dimensions.width / windowSizeRef.current.x);
    const [resizeDistY, updateResizeY] = useState(dimensions.height / windowSizeRef.current.y);
    const [resizeCoords, updateResizeCoords] = useState([0,0]);
    const [translateCoords, updateTranslateCoords] = useState([commentInfo.left, commentInfo.top]);
    const [isEditable, toggleEdits] = useState(true);
    const initialTextRef = useRef(commentInfo.text);
    const containerRef = useRef(null);
    const containerRect = useRef(null);
    const resizeRef = useRef(null);
    const resizeRect = useRef(null);
    const translateRef = useRef(null);
    const translateRect = useRef(null);
    const storedCommentState = roomCommentsRef.current.get(commentInfo.key);

    useEffect(() => {
        resizeRect.current = resizeRef.current.getBoundingClientRect();
        translateRect.current = translateRef.current.getBoundingClientRect();
        containerRect.current = containerRef.current.getBoundingClientRect();

        let resizeLeft = containerRect.current.left + containerRect.current.width - resizeRect.current.width / 2;
        resizeLeft = resizeLeft / windowSizeRef.current.x;
        let resizeTop = containerRect.current.top + containerRect.current.height - resizeRect.current.height / 2;
        resizeTop = resizeTop / windowSizeRef.current.y;
        let translateLeft = containerRect.current.left / windowSizeRef.current.x;
        let translateTop = containerRect.current.top / windowSizeRef.current.y;
        updateResizeCoords([resizeLeft, resizeTop]);
        updateTranslateCoords([translateLeft, translateTop]);
        windowSizeRef.current.x = window.innerWidth;
        windowSizeRef.current.y = window.innerHeight;
        console.log(resizeLeft, resizeTop);
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
        storedCommentState.text = inputText;
        updateCommentsFlag(!commentsFlag);
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
            const offsetPercentageX = 15 / windowSizeRef.current.x;
            const offsetPercentageY = 15 / windowSizeRef.current.y;
            let offsetDistX = dist(e.clientX, 0, translateCoords[0] * windowSizeRef.current.x, 0) + 15;
            let offsetDistY = dist(e.clientY, 0, translateCoords[1] * windowSizeRef.current.y, 0) + 15;
            updateResizeCoords([e.clientX / windowSizeRef.current.x, e.clientY / windowSizeRef.current.y]);
            updateResizeX(offsetDistX / windowSizeRef.current.x);
            updateResizeY(offsetDistY / windowSizeRef.current.y);
            storedCommentState.width = offsetDistX;
            storedCommentState.height = offsetDistY;
        }
    }

    const handleDragTranslate = (e) => {
        if (isTranslating) {
            const boxOffset = 15;
            const widthPercent = (resizeRect.current.width / 2) / windowSizeRef.current.x;
            const heightPercent = (resizeRect.current.height / 2) / windowSizeRef.current.y;
            let translateX = (e.clientX - boxOffset) / windowSizeRef.current.x;
            let translateY = (e.clientY - boxOffset) / windowSizeRef.current.y;
            updateTranslateCoords([translateX, translateY]);
            updateResizeCoords([translateX + resizeDistX - widthPercent, 
                                translateY + resizeDistY - heightPercent]);
            storedCommentState.left = translateX;
            storedCommentState.top = translateY;
        }
    }

    const cleanText = (dirtyText) => {
        const clean = DOMPurify.sanitize(dirtyText, {
            ALLOWED_TAGS: ['b', 'i', 'u', 'a', 'p', 'br', 'ul', 'ol', 'li'],
            ALLOWED_ATTR: ['href']
        });
        return clean;
    }

    const handleCancel = () => {
        roomCommentsRef.current.delete(commentInfo.key);
        updateCommentsFlag(!commentsFlag);
    }

    const disableResizing = (e) => {
        updateResizeState(false);
        updateCommentsFlag(!commentsFlag);
        window.removeEventListener('mousemove', handleDragResize);
    }

    const disableTranslate = (e) => {
        updateTranslateState(false);
        updateCommentsFlag(!commentsFlag);
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
                style={{left: `${100 * translateCoords[0]}vw`, 
                        top: `${100 * translateCoords[1]}vh`, 
                        display: `${isEditable ? '' : 'none'}`
                       }}
            >   &#10070;
                <div className='actions-container' style={{display: `${isEditable ? '' : 'none'}`}}>
                    <div id='cancel' className='actions'
                         onClick={handleCancel}>&#10005;
                    </div>
                </div>
            </div>
            <div id='content-container' ref={containerRef}
                onDragStart={(e) => e.preventDefault()}
                style={{width: `${100 * resizeDistX}vw`, height: `${100 * resizeDistY}vh`, 
                        left: `${100 * translateCoords[0]}vw`, 
                        top: `${100 * translateCoords[1]}vh`
                       }}>
                <div id='comment-field' 
                    contentEditable='true' 
                    suppressContentEditableWarning
                    role='textbox'
                    onInput={(e)=>{updateText(e.currentTarget.textContent)}}
                    style={{fontSize: `${10 * resizeDistY}vh`,
                            lineHeight: `clamp(.2, ${100 * resizeDistY}, 1)`,
                            border: `${isEditable ? '1px dashed white' : 'none'}`,
                            color: `${commentInfo.color}`,
                          }}
                >
                    {initialTextRef.current}
                </div>
            </div>
            
            <div className='transform resize' ref={resizeRef}
                onDragStart={(e) => e.preventDefault()}
                onMouseDown={enableResizing} 
                onMouseUp={disableResizing}
                style={{left: `${100 * resizeCoords[0]}vw`, 
                        top: `${100 * resizeCoords[1]}vh`,
                        display: `${isEditable ? '' : 'none'}`}}
            > 
            </div>
        </div>
    )
}


export default Comment