import {useState, useEffect, useRef} from 'react'
import {useStateContext} from '../contexts/userState.jsx'
import Note from './note.jsx'

const NoteArea = () => {
    const {userObj, roomNotes} = useStateContext();

    return (
        <div style={{width: '100%', height: '100%'}}>
            <Note isPreview={false} boxColor={'rgba(255,255,255,1)'} textColor={'rgba(255,40,255,1)'}/>
        </div>
    )
}

export default NoteArea