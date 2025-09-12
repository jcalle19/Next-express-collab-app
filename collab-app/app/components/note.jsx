import { useState, useEffect } from 'react'
import '../css/note.css'

const Note = ({isPreview}) => {
  return (
    <div id='note-container'>
        <textarea rows='5' cols='33' id='note-content'></textarea>
    </div>
  )
}

export default Note