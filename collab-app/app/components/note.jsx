import { useState, useEffect, useRef } from 'react'
import {useStateContext} from '../contexts/userState.jsx'
import Icon from '../components/icon.jsx'
import '../css/note.css'

const Note = ({isPreview, editable, boxColor, textColor, fontSize, width, height, left, top}) => {
    const {textEditFlag, penInfoRef, userObj, addNote} = useStateContext();
    const [text, setText] = useState('Sample');
    const noteRef = useRef(null);

    useEffect(() => {
      const noteRect = noteRef.current.getBoundingClientRect();   
    },[]);

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
      <div id='note-container' className={`${isPreview ? 'preview-centered' : ''} grid grid-cols-[1fr_15fr]`}>
          <div id='button-area' className='col-start-1'>
            { isPreview ? 
                <div id='confirm-button' className='grid grid-rows-3 glassy' style={{borderColor: `${textColor}`}} onClick={createNote}>
                  <p>&lt;</p>
                  <p>&lt;</p>
                  <p>&lt;</p>
                </div>
              : 
                <div className='grid grid-rows-3 grid-cols-1' style={{width: '100%', height: '100%'}}>
                  <div id='move-handle' className='row-start-1'></div>
                  <div id='post-button' className='row-start-2'></div>
                  <div id='cancel-button' className='row-start-3'></div>
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