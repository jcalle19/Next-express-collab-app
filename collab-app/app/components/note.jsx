import { useState, useEffect, useRef } from 'react'
import {useStateContext} from '../contexts/userState.jsx'
import Icon from '../components/icon.jsx'
import '../css/note.css'

const Note = ({id, isPreview, content, boxColor, textColor, fontSize, widthPercent, heightPercent, left, top}) => {
    const {textEditFlag, userObj, addNote, canvasOffsetRef, 
           canvasSizeRef, socketRef, noteDeleteFlag, triggerFlag} = useStateContext();
    const [text, setText] = useState(content);
    const [resizing, toggleResizing] = useState(true);
    const [translating, toggleMoving] = useState(false);
    const [translateX, setXCoord] = useState(left); //percentage * pixel
    const [translateY, setYCoord] = useState(top);
    const [size, setSize] = useState({ width: widthPercent, height: heightPercent}); //%
    const [noteFocused, setFocus] = useState(false);
    const areaOffsetRef = useRef({x: widthPercent * canvasSizeRef.current.width / 2, 
                                  y: heightPercent * canvasSizeRef.current.height / 2});
    const textareaRef = useRef(null);

    //change info -> transmit to server -> server relays map to clients -> map updates props -> comp syncs with new props
    useEffect(() => {
      setXCoord(left);
      setYCoord(top);
      setSize({ width: widthPercent, height: heightPercent });
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

    //sends update to text to the server
    useEffect(()=> {
      transmitInfo(translateX,translateY,size.width,size.height,text);
    },[text]);

    useEffect(()=> {
      //When user is done resizing -> store size value and transmit changes
      if (!resizing) {
        const { width, height } = textareaRef.current.getBoundingClientRect();
        const newWidth = width / canvasSizeRef.current.width;
        const newHeight = height / canvasSizeRef.current.height
        setSize({
          width: newWidth,
          height: newHeight,
        });
        transmitInfo(translateX, translateY, newWidth, newHeight);
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
      if (!translating) transmitInfo(translateX, translateY, size.width, size.height);
    }, [translating]);

    const transmitInfo = (x,y,width,height) => {
      console.log(content);
      //return on first component mount call
      if (!id) return;

      const retObj = {
        boxColor: boxColor,
        fontSize: fontSize,
        height: height,
        left: x,
        top: y,
        content: text,
        textColor: textColor,
        width: width,
      }
      
      socketRef.current.emit('update-notes', userObj.current.roomId, id, retObj);
    }

    const createNote = () => {
      //default note
      const noteInfo = {content: 'Edit Text', 
                        boxColor: boxColor, 
                        textColor: textColor, 
                        fontSize: fontSize,         
                        top: 0, left: 0,
                        width: .20, height: .20
                      };
      addNote(userObj.current, noteInfo);
    }

    const deleteNote = () => {
      if (noteDeleteFlag && noteFocused) socketRef.current.emit('delete-note', userObj.current.roomId, id);
    }

    return (
      <div id='note-container'
           onMouseDown={()=>toggleResizing(true)}
           onMouseEnter={()=>setFocus(true)}
           onMouseLeave={()=>setFocus(false)}
           onClick={deleteNote}
           className={`${isPreview ? 'grid grid-cols-3' : ''} `} //removed preview-centered due to pixel error
           style={{position: `${isPreview ? 'relative' : 'absolute'}`, 
                   left: `${isPreview ? '' : `${100 * translateX / 2}%`}`, //divided by 2 to account for notearea size
                   top: `${isPreview ? '' : `${100 * translateY}%`}`,
                   minHeight: `${isPreview ? '100%' : 'fit-content'}`,
                   minWidth: `${isPreview ? '100%' : ''}`,
                   userSelect: `${textEditFlag || noteDeleteFlag ? '' : 'none'}`,
                   outline: `${noteFocused && noteDeleteFlag && !isPreview ? '5px dashed red' : ``}`,
                   lineHeight: '0px',
                   zIndex: `${textEditFlag || isPreview || noteDeleteFlag ? '10' : '-1'}`,
                  }}
      >
          {isPreview ?
            <div id='button-area' className='grid grid-rows-2 col-start-1'>
              <div id='confirm-button' className='glassy row-start-1' onClick={createNote}>
                <Icon src={`/toolbar-icons/relocate.svg`} width='35%' height='35%'/>
              </div>
              <div id='trash-button' className={`glassy row-start-2 ${noteDeleteFlag ? 'set-inspecting' : ''}`}
                onClick={()=>triggerFlag('delete')}
              >
                <Icon src={`/toolbar-icons/trash.svg`} width='35%' height='35%'/>
              </div>
            </div> : ''
          }
          <textarea readOnly={isPreview || !textEditFlag || translating} //disable when dragEditFlag is true
                    ref={textareaRef}
                    id='note-content' 
                    className={`col-start-${isPreview ? '2 col-span-2' : '1'}`}
                    value={text}
                    onChange={(e)=>setText(e.target.value)}
                    style={{border: `1px solid ${boxColor}`,
                            backgroundColor: boxColor, 
                            color: textColor,
                            maxWidth: `${isPreview ? '100%' : `${canvasSizeRef.current.width}px`}`,
                            width: `${isPreview ? '100%' : `${Math.ceil(size.width * canvasSizeRef.current.width)}px`}`,
                            height: `${Math.ceil(size.height * canvasSizeRef.current.height)}px`,
                            fontSize: `${Math.ceil(fontSize / 1000 * canvasSizeRef.current.width)}px`,
                            letterSpacing: `0px`,
                            lineHeight: 'normal',
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