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
                <Note isPreview={false} key={key}
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
/*
            {roomNotes.map(([id, noteInfo]) => 
                <Note isPreview={false} 
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
            
            <Note isPreview={false} 
                  content={'sample'} 
                  boxColor={'rgba(255,255,255,1)'} 
                  textColor={'rgba(255,40,255,1)'}
                  widthPercent={.5}
                  heightPercent={.5}
                  fontSize={50}
                  left={0}
                  top={0}
            />
            */