import { useState, useEffect, useRef } from 'react'
import {useStateContext} from '../contexts/userState.jsx'
import Icon from '../components/icon.jsx'
import '../css/note.css'

const Note = ({isPreview, content, boxColor, textColor, fontSize, widthPercent, heightPercent, left, top}) => {
    const {textEditFlag, userObj, addNote, canvasOffsetRef, 
           canvasSizeRef, canvasSize} = useStateContext();
    const [text, setText] = useState(content);
    const [resizing, toggleResizing] = useState(true);
    const [translating, toggleMoving] = useState(false);
    const [translateX, setXCoord] = useState(left); //percentage * pixel
    const [translateY, setYCoord] = useState(top);
    const [size, setSize] = useState({ width: widthPercent, height: heightPercent}); //%
    const areaOffsetRef = useRef({x: widthPercent * canvasSizeRef.current.width / 2, 
                                  y: heightPercent * canvasSizeRef.current.height / 2});
    const textareaRef = useRef(null);

    //Log desired size percentage on manual textarea resize
    useEffect(() => {
      if (!textareaRef.current) return;

      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        const { width, height } = entry.contentRect;
        const { width: cw, height: ch } = canvasSizeRef.current;
        areaOffsetRef.current.x = (width / cw) * canvasSizeRef.current.width / 2;
        areaOffsetRef.current.y = (height / ch) * canvasSizeRef.current.height / 2;
      });
      observer.observe(textareaRef.current);
      return () => {
        observer.disconnect();
      };
    }, []);

    //set 
    useEffect(()=> {
      if (!resizing) {
        const { width, height } = textareaRef.current.getBoundingClientRect();
        setSize({
          width: width / canvasSizeRef.current.width,
          height: height / canvasSizeRef.current.height
        });
      }
    },[resizing]);

    /*Defining functions here to avoid stale values*/
    useEffect(() => {
      const handleMouseMove = (e) => {
        if (translatingRef.current) {
          const xPixels = e.clientX - canvasOffsetRef.current.left - areaOffsetRef.current.x;
          const yPixels = e.clientY - canvasOffsetRef.current.top - areaOffsetRef.current.y;
          setXCoord(xPixels / canvasSizeRef.current.width);
          setYCoord(yPixels / canvasSizeRef.current.height);
        }
      };

      const handleMouseUp = () => {
        toggleResizing(false);
        toggleMoving(false);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, []);

    const translatingRef = useRef(false);

    useEffect(() => {
      translatingRef.current = translating;
    }, [translating]);
    
    const createNote = () => {
      //default note
      const noteInfo = {user: userObj.current.id, 
                        text: 'Edit Text', 
                        boxColor: boxColor, 
                        textColor: textColor, 
                        fontSize: fontSize, 
                        top: 0, left: 0, 
                        width: .20, height: .20
                      };
      addNote(userObj.current, noteInfo);
    }

    return (
      <div id='note-container'
           onMouseDown={()=>{toggleResizing(true)}}
           className={`${isPreview ? 'preview-centered grid grid-cols-[1fr_15fr]' : ''} `}
           style={{position: `${isPreview ? 'relative' : 'absolute'}`, 
                   left: `${isPreview ? '' : `${100 * translateX / 2}%`}`, //divided by 2 to account for notearea size
                   top: `${isPreview ? '' : `${100 * translateY}%`}`,
                   minHeight: `${isPreview ? '100%' : 'fit-content'}`,
                   minWidth: `${isPreview ? '100%' : ''}`,
                   userSelect: `${textEditFlag ? '' : 'none'}`,
                   zIndex: `${textEditFlag || isPreview ? '10' : '-1'}`,
                  }}
      >
          {isPreview ?
            <div id='button-area' className='col-start-1'>
                  <div id='confirm-button' className='grid grid-rows-3 glassy' style={{borderColor: `${textColor}`}} onClick={createNote}></div>            
            </div> : <div style={{display: 'none'}}></div>
          }
          <textarea readOnly={isPreview || !textEditFlag || translating} //disable when dragEditFlag is true
                    ref={textareaRef}
                    id='note-content' 
                    className={`col-start-${isPreview ? '2' : '1'} `}
                    value={text}
                    onChange={(e)=>setText(e.target.value)}
                    style={{border: `2px solid ${boxColor}`, 
                            backgroundColor: boxColor, 
                            outline: 'none',
                            color: textColor,
                            maxWidth: `${canvasSizeRef.current.width}px`,
                            width: `${Math.ceil(size.width * canvasSizeRef.current.width)}px`,
                            height: `${Math.ceil(size.height * canvasSizeRef.current.height)}px`,
                            fontSize: `${Math.ceil(fontSize / 1000 * canvasSizeRef.current.width)}px`,
                            letterSpacing: `0px`,
                            resize: `${isPreview || !textEditFlag ? 'none' : 'both'}`,
                            padding: '0px',
                            pointerEvents: `${textEditFlag ? '' : 'none'}`,
                            userSelect: `${textEditFlag ? '' : 'none'}`,
                          }}
          />
          {textEditFlag && !isPreview ? 
            <div id='move-handle' className='edit-buttons row-start-1' 
                 onDragStart={(e) => e.preventDefault()}
                 onMouseDown={()=>toggleMoving(true)} 
                 style={{backgroundColor: `${translating ? 'indigo' : 'blue'}`}}
            >
              <Icon src={`/toolbar-icons/drag.svg`} width='90%' height='90%'/>
            </div> : <div style={{display: 'none'}}></div>
          }
      </div>
    )
}
/*
<div className='grid grid-rows-3 grid-cols-1' style={{width: '100%', height: '60px'}}>
                  <div id='move-handle' className='edit-buttons row-start-1' 
                       onDragStart={(e) => e.preventDefault()}
                       onMouseDown={()=>toggleMoving(true)} 
                       style={{backgroundColor: `${translating ? 'red' : 'blue'}`}}
                  ></div>
                  <div id='post-button' className='edit-buttons row-start-2'></div>
                  <div id='cancel-button' className='edit-buttons row-start-3'></div>
                </div>
*/
export default Note