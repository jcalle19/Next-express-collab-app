import React from 'react'
import Icon from './icon.jsx'
import { useStateContext } from '../contexts/userState.jsx'
import '../css/globals.css'
import '../css/userPanel.css'

const UserPanel = ({user}) => {
    const { userObj, socketRef } = useStateContext();
    const iconFolder = 'toolbar-icons';

    const handleToggle = (permission, value, user) => {
        if (userObj.current.socketId === user.socketId) return; //can't act on yourself
        const userToken = sessionStorage.getItem('roomToken');
        const hostToken = sessionStorage.getItem('hostId');
        if (permission === 'toggle-admin' && userObj.current.isHost) { //only hosts can make admins
            console.log('Toggling admin');
            socketRef.current.emit(`toggle-admin`, !value, user.socketId, userObj.current.roomId, hostToken);
        }
        else if (userObj.current.isAdmin && !user.isHost) {
            console.log(`Toggling ${permission}`);
            socketRef.current.emit(`${permission}`, !value, user.socketId, userObj.current.roomId, userToken);
        }
    };

    const handleKick = (user) => {
        if (userObj.current.socketId === user.socketId) return; //can't act on yourself

        if (userObj.current.isAdmin) {
            socketRef.current.emit('kick-user', user.socketId);
        }
    }

    return (
        <div className='user-panel grid grid-cols-[1fr_1fr_1fr_1fr_1fr] grid-rows-1'>
            <div className='col-start-1'>{user.user}</div>
            <div className={`perm-button ${user.canDraw ? 'set-inspecting-borderless' : ''} col-start-2`} 
                 onClick={()=>handleToggle('toggle-drawing', user.canDraw, user)}>
                <Icon src={`/${iconFolder}/pen.svg`} width='65%' height='60%'/>
            </div>
            <div className={`perm-button ${user.canChat ? 'set-inspecting-borderless' : ''} col-start-3`} 
                 onClick={()=>handleToggle('toggle-chat', user.canChat, user)}>
                <Icon src={`/${iconFolder}/chat.svg`} width='65%' height='60%'/>
            </div>
            <div className={`perm-button ${user.isAdmin ? 'set-inspecting-borderless' : ''} col-start-4`} 
                 onClick={()=>handleToggle('toggle-admin', user.isAdmin, user)}
                 style={{backgroundColor: `${user.isHost ? 'gold' : ''}`}}
            >
                <Icon src={`/${iconFolder}/${user.isHost ? 'host' : 'admin'}.svg`} width='65%' height='60%'/>
            </div>
            { userObj.current.isAdmin || userObj.current.isHost ?
                <div className='perm-button col-start-5' onClick={()=>handleKick(user)}>
                    <Icon src={`/${iconFolder}/kick.svg`} width='65%' height='60%'/>
                </div> : <div></div>
            }
        </div>
    )
}

export default UserPanel