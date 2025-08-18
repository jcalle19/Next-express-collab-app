"use client";

import { useState, useEffect } from 'react'
import { useStateContext } from '../contexts/userState.jsx'
import Message from './message.jsx'
import Icon from './icon.jsx'
import RoomInfoPanel from './roomInfoPanel.jsx'
import '../css/globals.css'
import '../css/chatBox.css'

const ChatBox = () => {
    const [chatMsg, updateMsg] = useState('');
    const [activeTab, setActiveTab] = useState('chat');
    const { userObj, socketRef, roomUsersKeys, chatMessages, chatMessagesRef, addMessage } = useStateContext();
    const iconFolder = 'toolbar-icons';

    const handleSubmit = () => {
        addMessage(userObj.current, chatMsg);
        updateMsg('');
    }

    const handleToggleTab = (tab) => {
        setActiveTab(tab);
    }

    /*
        <div id='users-drop-down' className='glassy'>
            {roomUsersKeys.map((user) => (<div key={user.key}>{user.user}</div>))}
        </div>
    */
    return (
        <div className={'chat-window'}>
            <section id='nav-menu' className='grid grid-cols-3 grid-rows-1'>
                <div className={`text-center glassy ${activeTab === 'chat' ? 'set-inspecting' : ''}`} onClick={() => handleToggleTab('chat')}>
                    <Icon src={`/${iconFolder}/chat.svg`} width='85%' height='60%'/>
                </div>
                <div className={`text-center glassy ${activeTab === 'people' ? 'set-inspecting' : ''}`} onClick={() => handleToggleTab('people')}>
                    <Icon src={`/${iconFolder}/people.svg`} width='85%' height='75%'/>
                </div>
                <div className={`text-center glassy ${activeTab === 'room' ? 'set-inspecting' : ''}`} onClick={() => handleToggleTab('room')}>
                    <Icon src={`/${iconFolder}/room.svg`} width='85%' height='60%'/>
                </div>
            </section>
            <section id='msg-container' className={`${activeTab === 'chat' ? '' : 'hidden'}`}>
                <div id='msg-field' className='glassy'>
                    {
                        chatMessages.length > 0 ? chatMessages.map((chat) => (<Message key={chat.key} user={chat.name} message={chat.msg}/>)) : ''
                    }
                </div>
                <div id='input-container' className='grid grid-cols-5 glassy'>
                    <form id='msg-input' className='col-span-4'>
                        <input
                            type='text'
                            value={chatMsg}
                            onChange={(e)=>{updateMsg(e.target.value)}}
                            placeholder='Enter message'
                        />
                    </form>
                    <button id='msg-submit' className='col-start-5' onClick={handleSubmit}>Send</button>
                </div>
            </section>
            <section id='people-container' className={`${activeTab === 'people' ? '' : 'hidden'}`}>
                <div id='people-field' className='glassy'>
                    {roomUsersKeys.map((user) => (
                        <div key={user.id} className='grid grid-cols-[2fr_2fr_2fr_2fr_2fr_5fr] grid-rows-1'>
                            <div className='col-start-1'>{user.user}</div>
                            <div className='col-start-2'><Icon src={`/${iconFolder}/pen.svg`} width='85%' height='70%'/></div>
                            <div className='col-start-3'><Icon src={`/${iconFolder}/chat.svg`} width='85%' height='70%'/></div>
                            <div className='col-start-4'><Icon src={`/${iconFolder}/admin.svg`} width='85%' height='70%'/></div>
                            <div className='col-start-5'><Icon src={`/${iconFolder}/kick.svg`} width='85%' height='70%'/></div>
                        </div>
                    ))}
                </div>
            </section>
            <section id='room-container' className={`${activeTab === 'room' ? '' : 'hidden'}`}>
                <div id='room-field' className='glassy'>
                    <RoomInfoPanel/>
                </div>
            </section>
        </div>
  )
}

export default ChatBox