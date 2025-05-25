import React from 'react'
import globals from '../css/globals.css'
import comps from '../css/homecomps.css'

const CreateRoomButton = ({submitFunction}) => {
  return (
    <div>
        <button className='enter-btn' onClick={submitFunction}>Create New Room</button>
    </div>
  )
}

export default CreateRoomButton