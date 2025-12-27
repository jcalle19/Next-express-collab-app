import {useStateContext} from '@/contexts/stateContext.jsx'
import '@/css/note.css'
import Note from './note.jsx'

const NoteArea = () => {
    const {roomNotes} = useStateContext();

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