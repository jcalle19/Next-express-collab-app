import React from 'react'
import Icon from './icon.jsx'
import { useStateContext } from '../contexts/userState.jsx'
import '../css/globals.css'
import '../css/userPanel.css'
import { userAgentFromString } from 'next/server.js'

const UserPanel = ({user}) => {
    const { isAdmin, socketRef } = useStateContext();
    const iconFolder = 'toolbar-icons';

    const handleToggle = (permission, user) => {
        if (isAdmin.current) {
            socketRef.current.emit(`toggle-${permission}`, user.id);
        }
    };

    return (
        <div className='user-panel grid grid-cols-[1fr_2fr_2fr_2fr_2fr_1fr] grid-rows-1'>
            <div className='col-start-1'>{user.user}</div>
            <div className='perm-button set-inspecting col-start-2'><Icon src={`/${iconFolder}/pen.svg`} width='85%' height='90%'/></div>
            <div className='perm-button col-start-3'><Icon src={`/${iconFolder}/chat.svg`} width='85%' height='90%'/></div>
            <div className='perm-button col-start-4'><Icon src={`/${iconFolder}/admin.svg`} width='85%' height='90%'/></div>
            <div className='perm-button col-start-5'><Icon src={`/${iconFolder}/kick.svg`} width='85%' height='80%'/></div>
        </div>
    )
}

export default UserPanel