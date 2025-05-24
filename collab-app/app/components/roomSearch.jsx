import React from 'react'
import {useState} from 'react';

const RoomSearch = () => {
    const [searchCode, updateSearchCode] = useState('');
    return (
        <div className="grid">
            <h1>Enter Room code:</h1>
            <form>
                <input 
                    type="text" 
                    className="bg-black"
                    placeholder="123456"
                    value={searchCode}
                    onChange={(e)=>updateSearchCode(e.target.value)}
                />
            </form>
            <button type="submit">Join Room</button>
        </div>
    )
}

export default RoomSearch