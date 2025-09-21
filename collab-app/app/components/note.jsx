import { useState, useEffect, useRef } from 'react'
import {useStateContext} from '../contexts/userState.jsx'
import Icon from '../components/icon.jsx'
import '../css/note.css'

const Note = ({isPreview, editable, content, boxColor, textColor, fontSize, widthPercent, heightPercent, left, top}) => {
    const {textEditFlag, penInfoRef, userObj, addNote, canvasOffsetRef, 
           canvasSizeRef, canvasSize} = useStateContext();
    const [text, setText] = useState(content);
    const [translating, toggleMoving] = useState(false);
    const [translateX, setXCoord] = useState(left); //percentage * pixel
    const [translateY, setYCoord] = useState(top);
    const [size, setSize] = useState({ width: widthPercent, height: heightPercent}); //%
    const textareaRef = useRef(null);
    const handleRadius = 10;
    const noteRef = useRef(null);

    //detecting size change
    useEffect(() => {
      if (!textareaRef.current) return;

      // Create observer
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        const { width, height } = entry.contentRect;
        const { width: cw, height: ch } = canvasSizeRef.current;
        console.log(cw, ch);
      });
      observer.observe(textareaRef.current);
      return () => {
        observer.disconnect();
      };
    }, []);

    /*Defining functions here to avoid stale values*/
    useEffect(() => {
      const handleMouseMove = (e) => {
        if (translatingRef.current) {
          const xPixels = e.clientX - canvasOffsetRef.current.left - handleRadius;
          const yPixels = e.clientY - canvasOffsetRef.current.top - handleRadius;
          setXCoord(xPixels / canvasSizeRef.current.width);
          setYCoord(yPixels / canvasSizeRef.current.height);
        }
      };

      const handleMouseUp = () => {
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
                        editable: false, 
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
      <div id='note-container' ref={noteRef}
           className={`${isPreview ? 'preview-centered' : ''} grid grid-cols-[1fr_15fr]`}
           style={{position: `${isPreview ? 'relative' : 'absolute'}`, 
                   left: `${isPreview ? '' : `${100 * translateX / 2}%`}`, //divided by 2 to account for notearea size
                   top: `${isPreview ? '' : `${100 * translateY}%`}`,
                   maxWidth: `${canvasSizeRef.current.width}px`,
                   width: `${size.width * canvasSizeRef.current.width}px`,
                   height: `${size.height * canvasSizeRef.current.height}px`,
                  }}
      >
          <div id='button-area' className='col-start-1'>
            { isPreview ? 
                <div id='confirm-button' className='grid grid-rows-3 glassy' style={{borderColor: `${textColor}`}} onClick={createNote}>
                  <p>&lt;</p>
                  <p>&lt;</p>
                  <p>&lt;</p>
                </div>
              : 
                <div className='grid grid-rows-3 grid-cols-1' style={{width: '100%', height: '60px'}}>
                  <div id='move-handle' className='edit-buttons row-start-1' 
                       onDragStart={(e) => e.preventDefault()}
                       onMouseDown={()=>toggleMoving(true)} 
                       style={{backgroundColor: `${translating ? 'red' : 'blue'}`}}
                  ></div>
                  <div id='post-button' className='edit-buttons row-start-2'></div>
                  <div id='cancel-button' className='edit-buttons row-start-3'></div>
                </div>
            }
          </div>
          <textarea readOnly={isPreview || !textEditFlag} ref={textareaRef}
                    id='note-content' 
                    className='col-start-2'
                    value={text}
                    onChange={(e)=>setText(e.target.value)}
                    style={{border: `2px solid ${boxColor}`, 
                            backgroundColor: boxColor, 
                            color: textColor,
                            fontSize: `${fontSize * 1.75 * penInfoRef.current.scale}px`,
                            resize: `${isPreview ? 'none' : 'both'}`,
                          }}
          />
      </div>
    )
}

export default Note