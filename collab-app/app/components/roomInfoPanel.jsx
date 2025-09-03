import '../css/roomInfo.css'
import Switch from './switch.jsx'
import { useState, useEffect, useRef } from 'react'
import { useStateContext } from '../contexts/userState.jsx'
import { useRouter } from 'next/navigation'

const RoomInfoPanel = () => {
    const { userObj, roomOptions, socketRef, leaveRoom } = useStateContext();
    const [rerender, forceRerender] = useState(false);
    const router = useRouter();

    const handleLeave = () => {
        leaveRoom();
        router.push('/home');
    }

    const handleToggleOptions = () => {
        const hostId = sessionStorage.getItem('hostId');
        socketRef.current.emit(`update-options`, userObj.current.roomId, roomOptions.current, hostId);
    }

    const mutateOptions = (key, value) => {
        roomOptions.current[key] = value;
        forceRerender(!rerender);
    };

    return (
        <div className='room-panel'>
            <div>Room ID: {userObj.current.roomId}</div>
            <div className='option-table grid grid-cols-2 grid-rows-3'>
                <div className='row-start-1'>
                    <div className='col-start-1'>Allow joining: {`${roomOptions.current.canJoin}`}</div>
                    {userObj.current.isHost ? 
                        <Switch className='col-start-2' 
                            state={roomOptions.current.canJoin} 
                            target={'canJoin'} func={mutateOptions}
                            action={handleToggleOptions}
                        /> : ''
                    }
                </div>
                <div className='row-start-2'>
                    <div className='col-start-1'>Allow drawing: {`${roomOptions.current.canDraw}`}</div>
                    {userObj.current.isHost ? 
                        <Switch className='col-start-2' 
                            state={roomOptions.current.canDraw} 
                            target={'canDraw'} func={mutateOptions} 
                            action={handleToggleOptions}
                        /> : ''
                    }
                    
                </div>
                <div className='row-start-3'>
                    <div className='col-start-1'>Allow chatting: {`${roomOptions.current.canChat}`}</div>
                    {userObj.current.isHost ?
                        <Switch className='col-start-2' 
                            state={roomOptions.current.canChat} 
                            target={'canChat'} func={mutateOptions} 
                            action={handleToggleOptions}
                        /> : ''
                    }
                </div>
            </div>
            <button className='leave-button' onClick={handleLeave}>Leave Room</button>
        </div>
    )
}

export default RoomInfoPanel