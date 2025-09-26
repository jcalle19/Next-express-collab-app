import {useState, useEffect, useRef} from 'react'
import {useStateContext} from '../contexts/userState.jsx'
import '../css/note.css'
import Note from './note.jsx'

const NoteArea = () => {
    const {userObj, roomNotes} = useStateContext();

    useEffect(()=>{
        console.log(roomNotes);
    },[]);
    return (
        <div id='note-area'>
            
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
        </div>
    )
}

export default NoteArea
/*
            {[...roomNotes].map(([user, userInfo]) => 
                userInfo.id != userObj.current.id ? <UserIcon key={userInfo.id} x={userInfo.xCoord} y={userInfo.yCoord}/> : ''
                )
            }*/