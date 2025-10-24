import '../css/globals.css'
import '../css/roomInfo.css'
import Switch from './switch.jsx'
import Icon from './icon.jsx'
import Image from 'next/image'
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

    const copyCode = () => {
        navigator.clipboard.writeText(userObj.current.roomId);
    };

    return (
        <div className='room-panel grid grid-rows-[1fr_3fr_1fr]'>
            <div className='row-start-1'>
                <div id='room-heading'>Room ID</div>
                <div id='id-button' className='grid grid-cols-11' onClick={copyCode}>
                    <div id='id-heading' className='col-start-1 col-span-10'>{userObj.current.roomId}</div>
                    <div className='col-start-11'>
                        <Icon src={`/toolbar-icons/copy.svg`} width='50%' height='50%'/>
                    </div>
                </div>
                
            </div>
            <div className='option-table grid grid-rows-3 row-start-2'>
                <div className='row-start-1'>
                    <div>Joining - {`${roomOptions.current.canJoin ? 'Enabled' : 'Disabled'}`}</div>
                    {userObj.current.isHost ? 
                        <Switch
                            state={roomOptions.current.canJoin} 
                            target={'canJoin'} func={mutateOptions}
                            action={handleToggleOptions}
                        /> : ''
                    }
                </div>
                <div className='row-start-2'>
                    <div>Drawing - {`${roomOptions.current.canDraw ? 'Enabled' : 'Disabled'}`}</div>
                    {userObj.current.isHost ? 
                        <Switch className='col-start-2' 
                            state={roomOptions.current.canDraw} 
                            target={'canDraw'} func={mutateOptions} 
                            action={handleToggleOptions}
                        /> : ''
                    }
                    
                </div>
                <div className='row-start-3'>
                    <div>Chatting - {`${roomOptions.current.canChat ? 'Enabled' : 'Disabled'}`}</div>
                    {userObj.current.isHost ?
                        <Switch 
                            state={roomOptions.current.canChat} 
                            target={'canChat'} func={mutateOptions} 
                            action={handleToggleOptions}
                        /> : ''
                    }
                </div>
            </div>
            <button id='leave-button' className='row-start-3' onClick={handleLeave}>Leave Room</button>
        </div>
    )
}

export default RoomInfoPanel