import React from 'react'
import {useState} from 'react'
import { useRouter } from 'next/navigation';
import { useStateContext } from '../contexts/userState.jsx'
import globals from '../css/globals.css'
import comps from '../css/homecomps.css'

const RoomForm = () => {
    const [nameInput, updateUsername] = useState('');
    const [searchCode, updateSearchCode] = useState('');
    const { joinRoom, userObj } = useStateContext();
    const router = useRouter();

    //Add user to room map in socket_handler.js
    const handleJoin = (e) => {
        e.preventDefault();
        userObj.current.user = nameInput;
        joinRoom(searchCode);
        router.push(`/rooms/${searchCode}`);
    };

    return (
        <div className="grid home-form-container">
            <form>
                <input
                    type="text"
                    className="bg-black test-border"
                    placeholder="Enter name"
                    value={nameInput}
                    onChange={(e)=>updateUsername(e.target.value)}
                />
                <input 
                    type="text" 
                    className="bg-black test-border"
                    placeholder="123456"
                    value={searchCode}
                    onChange={(e)=>updateSearchCode(e.target.value)}
                /><br/>
                <button onClick={handleJoin} className="enter-btn test-border">
                    Join Room
                </button>
                <br/>
                <button onClick={handleJoin} className="enter-btn test-border">
                    Create Room
                </button>
            </form>
        </div>
    )
}

export default RoomForm