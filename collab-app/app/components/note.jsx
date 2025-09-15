import { useState, useEffect } from 'react'
import '../css/note.css'

const Note = ({isPreview, boxColor, textColor}) => {
    const [text, setText] = useState('');

    return (
      <div id='note-container' className={`${isPreview ? 'preview-centered' : ''}`}>
          <textarea rows='5' 
                    cols='33' 
                    id='note-content' 
                    value={text}
                    onChange={(e)=>setText(e.target.value)}
                    style={{border: `2px solid ${boxColor}`, backgroundColor: boxColor, color: textColor}}
          />
      </div>
    )
}

export default Note