"use client";

import { useState, useEffect } from 'react'
import { useStateContext } from '../contexts/userState.jsx'
import Message from './message.jsx'
import '../css/roomPage.css'

const ChatBox = () => {
    const [chatMsg, updateMsg] = useState('');
    const [expanded, changeSize] = useState(false);
    const { userObj, socketRef, roomUsersKeys, chatMessages, chatMessagesRef, addMessage } = useStateContext();

    const handleSubmit = () => {
        socketRef.current.emit('broadcast-msg', userObj.current, chatMsg);
        updateMsg('');
    }
    
    const handleToggleClick = (e) => {
        changeSize(!expanded);
    }


    return (
        <>
            <div id='chat-window-toggle' className={expanded ? 'chat-window chat-toggle-expanded' : 'chat-window'} onClick={handleToggleClick}></div>
            <div className={expanded ? 'chat-window chat-window-expanded grid grid-rows-5 gap-1' : 'chat-window transparent grid grid-rows-5 gap-1'}>
                <div id='users-drop-down'>
                    {roomUsersKeys.map((user) => (<div key={user.key}>{user.user}</div>))}
                </div>
                <section id='msg-container' className='row-start-2' >
                    <div id='msg-field' className={!expanded ? 'transparent' : ''}>
                        {
                            chatMessages.length > 0 ? chatMessages.map((chat) => (<Message key={chat.key} user={chat.username} message={chat.content}/>)) : ''
                        }
                    </div>
                    <div className={!expanded ? 'grid grid-cols-2 gap-4 transparent' : 'grid grid-cols-5 gap-4'}>
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
            </div>
        </>
  )
}

export default ChatBox