import {useState, useEffect, useRef} from 'react'
import {useStateContext} from '../contexts/userState.jsx'
import Note from './note.jsx'

const NoteArea = () => {
    const {userObj, roomNotes} = useStateContext();

    return (
        <div style={{width: '100%', height: '100%'}}>
            {Array.from(roomNotes.entries()).map(([key, noteInfo]) => 
                <Note key={key} isPreview={false} 
                      editable={true}
                      boxColor={noteInfo.boxColor} 
                      textColor={noteInfo.textColor} 
                      fontSize={noteInfo.fontSize} 
                      width={noteInfo.width} 
                      height={noteInfo.height} 
                      left={noteInfo.left} 
                      top={noteInfo.top}
                />
            )}
        </div>
    )
}

export default NoteArea