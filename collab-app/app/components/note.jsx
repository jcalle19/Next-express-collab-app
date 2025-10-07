import { useState, useEffect, useRef } from 'react'
import {useStateContext} from '../contexts/userState.jsx'
import Icon from '../components/icon.jsx'
import '../css/note.css'

const Note = ({id, isPreview, content, boxColor, textColor, fontSize, widthPercent, heightPercent, left, top}) => {
    const {textEditFlag, userObj, addNote, canvasOffsetRef, 
           canvasSizeRef, canvasSize, socketRef} = useStateContext();
    const [text, setText] = useState(content);
    const [resizing, toggleResizing] = useState(true);
    const [translating, toggleMoving] = useState(false);
    const [translateX, setXCoord] = useState(left); //percentage * pixel
    const [translateY, setYCoord] = useState(top);
    const [size, setSize] = useState({ width: widthPercent, height: heightPercent}); //%
    const areaOffsetRef = useRef({x: widthPercent * canvasSizeRef.current.width / 2, 
                                  y: heightPercent * canvasSizeRef.current.height / 2});
    const coordRef = useRef({x: left, y: top});
    const textareaRef = useRef(null);

    //change info -> transmit to server -> server relays map to clients -> map updates props -> comp syncs with new props
    useEffect(() => {
      setXCoord(left);
      setYCoord(top);
      setSize({ width: widthPercent, height: heightPercent});
      setText(content);
    }, [left, top, widthPercent, heightPercent, content]);

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

    const transmitInfo = () => {
      //package into image object
      //transmit to server
      
      const retObj = {
        boxColor: boxColor,
        fontSize: fontSize,
        height: size.height,
        left: coordRef.x,
        top: coordRef.y,
        text: text,
        textColor: textColor,
        width: size.width
      }
      if (!retObj.width || !retObj.height) {
        return;
      }
      else {
        socketRef.current.emit('update-notes', userObj.current.roomId, id, retObj);
      }
    }

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
        const transmitFlag = resizing || translating;
        toggleResizing(false);
        toggleMoving(false);
        if (transmitFlag) transmitInfo();
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

    useEffect(() => {
      coordRef.x = translateX;
      coordRef.y = translateY;
    }, [translateX, translateY]);

    const createNote = () => {
      //default note
      const noteInfo = {text: 'Edit Text', 
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
export default Note