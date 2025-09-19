import { useState, useEffect, useRef } from 'react'
import {useStateContext} from '../contexts/userState.jsx'
import Icon from '../components/icon.jsx'
import '../css/note.css'

const Note = ({isPreview, editable, boxColor, textColor, fontSize, width, height, left, top}) => {
    const {textEditFlag, penInfoRef, userObj, addNote} = useStateContext();
    const [text, setText] = useState('Sample');
    const [isMoving, toggleMoving] = useState(false);
    const noteRef = useRef(null);

    useEffect(() => {
      window.addEventListener('mousemove', handleDragTranslate);
    },[]);

    useEffect(() => {
      console.log(isMoving);
    },[isMoving]);

    const handleDragTranslate = () => {
      if (isMoving) {
        console.log('hello');
      }
    }

    const createNote = () => {
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
           style={{position: `${isPreview ? 'relative' : 'absolute'}`}}
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
                  <div id='move-handle' className='edit-buttons row-start-1' onMouseDown={()=>toggleMoving(true)} onMouseUp={()=>toggleMoving(false)}></div>
                  <div id='post-button' className='edit-buttons row-start-2'></div>
                  <div id='cancel-button' className='edit-buttons row-start-3'></div>
                </div>
            }
          </div>
          <textarea readOnly={isPreview || !textEditFlag} ref={noteRef}
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