import React from 'react'
import '../css/roomPage.css'
import { useStateContext } from '../contexts/userState.jsx'
import { useRouter } from 'next/navigation';

const RoomInfoPanel = () => {
    const { userObj, leaveRoom } = useStateContext();
    const router = useRouter();

    const handleLeave = () => {
        leaveRoom();
        router.push('/home');
    }

    return (
        <div className='room-panel'>
            <div>{userObj.current.roomId}</div>
            <button onClick={handleLeave}>Leave Room</button>
        </div>
    )
}

export default RoomInfoPanel