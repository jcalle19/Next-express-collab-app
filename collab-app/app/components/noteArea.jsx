import {useState, useEffect, useRef} from 'react'
import {useStateContext} from '../contexts/userState.jsx'
import '../css/note.css'
import Note from './note.jsx'

const NoteArea = () => {
    const {userObj, roomNotes} = useStateContext();

    return (
        <div id='note-area'>
            <Note isPreview={false} 
                  editable={true} 
                  content={'sample'} 
                  boxColor={'rgba(255,255,255,1)'} 
                  textColor={'rgba(255,40,255,1)'}
                  widthPercent={.5}
                  heightPercent={.5}
                  left={0}
                  top={0}
            />
        </div>
    )
}

export default NoteArea