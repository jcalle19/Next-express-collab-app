import React from 'react'
import {useState} from 'react'
import globals from '../css/globals.css'
import comps from '../css/homecomps.css'

const RoomForm = ({submitFunction}) => {
    const [searchCode, updateSearchCode] = useState('');
    return (
        <div className="grid home-form-container">
            <form onSubmit={submitFunction}>
                <input 
                    type="text" 
                    className="bg-black test-border"
                    placeholder="123456"
                    value={searchCode}
                    onChange={(e)=>updateSearchCode(e.target.value)}
                />
            </form>
            <button className="enter-btn test-border" type="submit">Join Room</button>
        </div>
    )
}

export default RoomForm