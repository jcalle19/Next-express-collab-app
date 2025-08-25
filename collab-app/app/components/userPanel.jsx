import React from 'react'
import Icon from './icon.jsx'
import { useStateContext } from '../contexts/userState.jsx'
import '../css/globals.css'
import '../css/userPanel.css'
import { userAgentFromString } from 'next/server.js'

const UserPanel = ({user}) => {
    const { userObj, socketRef } = useStateContext();
    const iconFolder = 'toolbar-icons';

    const handleToggle = (permission, value, userSocket) => {
        if (userObj.current.isAdmin) {
            console.log('toggling', permission);
            socketRef.current.emit(`${permission}`, !value, userSocket);
        }
    };

    const handleKick = (userSocket) => {
        if (userObj.current.isAdmin) {
            socketRef.current.emit('kick-user', userSocket);
        }
    }

    return (
        <div className='user-panel grid grid-cols-[1fr_2fr_2fr_2fr_2fr_1fr] grid-rows-1'>
            <div className='col-start-1'>{user.user}</div>
            <div className={`perm-button ${user.canDraw ? 'set-inspecting-borderless' : ''} col-start-2`} 
                 onClick={()=>handleToggle('toggle-drawing', user.canDraw, user.socketId)}>
                <Icon src={`/${iconFolder}/pen.svg`} width='85%' height='90%'/>
            </div>
            <div className={`perm-button ${user.canChat ? 'set-inspecting-borderless' : ''} col-start-3`} 
                 onClick={()=>handleToggle('toggle-chat', user.canChat, user.socketId)}>
                <Icon src={`/${iconFolder}/chat.svg`} width='85%' height='90%'/>
            </div>
            <div className={`perm-button ${user.isAdmin ? 'set-inspecting-borderless' : ''} col-start-4`} 
                 onClick={()=>handleToggle('toggle-admin', user.isAdmin, user.socketId)}>
                <Icon src={`/${iconFolder}/admin.svg`} width='85%' height='90%'/>
            </div>
            <div className='perm-button col-start-5' onClick={()=>handleKick(user.socketId)}>
                <Icon src={`/${iconFolder}/kick.svg`} width='85%' height='80%'/>
            </div>
        </div>
    )
}

export default UserPanel