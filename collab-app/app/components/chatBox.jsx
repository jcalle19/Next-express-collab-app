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
            <div className={expanded ? 'chat-window chat-window-expanded grid grid-rows-3 gap-1' : 'chat-window transparent grid grid-rows-3 gap-1'}>
                <div id='users-drop-down'>
                    {roomUsersKeys.map((user) => (<div key={user.key}>{user.user}</div>))}
                </div>
                <section className='row-start-2'>
                <div id='msg-field'>
                    {
                        chatMessages.length > 0 ? chatMessages.map((chat) => (<Message key={chat.key} user={chat.username} message={chat.content}/>)) : ''
                    }
                </div>
                <form id='msg-input'>
                    <input
                        type='text'
                        value={chatMsg}
                        onChange={(e)=>{updateMsg(e.target.value)}}
                        placeholder='Enter message'
                    />
                </form>
                <button id='msg-submit' onClick={handleSubmit}>Send</button>
            </section>
        </div>
    </>
  )
}

export default ChatBox