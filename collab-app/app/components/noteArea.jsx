import {useState, useEffect, useRef} from 'react'
import {useStateContext} from '../contexts/userState.jsx'
import '../css/note.css'
import Note from './note.jsx'

const NoteArea = () => {
    const {userObj, roomNotes} = useStateContext();
    
    useEffect(()=>{
        console.log(roomNotes);
    },[roomNotes]);

    return (
        <div id='note-area'>         
            {Array.from(roomNotes).map(([key, noteInfo]) => 
                <Note key={key} isPreview={false}
                  id={key}
                  content={noteInfo.content} 
                  boxColor={noteInfo.boxColor} 
                  textColor={noteInfo.textColor}
                  widthPercent={noteInfo.width}
                  heightPercent={noteInfo.height}
                  fontSize={Number(noteInfo.fontSize)}
                  left={noteInfo.left}
                  top={noteInfo.top}
                />
            )}
        </div>
    )
}

export default NoteArea