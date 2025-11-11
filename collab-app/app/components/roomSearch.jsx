import React from 'react'
import {useState, useEffect} from 'react'
import { useRouter } from 'next/navigation';
import { useRefContext } from '../contexts/refContext.jsx'
import { useSocketContext } from '../contexts/socketContext.jsx'
import globals from '../css/globals.css'
import comps from '../css/homecomps.css'

const RoomForm = () => {
    const { createRoom, joinRoom, leaveRoom } = useSocketContext();
    const { userObj } = useRefContext();
    const [nameInput, updateUsername] = useState('');
    const [searchCode, updateSearchCode] = useState('');
    const router = useRouter();

    useEffect(()=>{
        if (userObj.current.roomId) leaveRoom();
    },[]);
    
    //Add user to room map in socket_handler.js
    const handleJoin = (e) => {
        e.preventDefault();
        userObj.current.user = nameInput;
        joinRoom(searchCode);
        //router.push(`/rooms/${searchCode}`);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        userObj.current.user = nameInput;
        createRoom();
    }

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
                <button onClick={handleCreate} className="enter-btn test-border">
                    Create Room
                </button>
            </form>
        </div>
    )
}

export default RoomForm