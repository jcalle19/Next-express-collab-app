"use client";

import { useState, useEffect } from 'react'
import { useStateContext } from '../contexts/userState.jsx'
import Message from './message.jsx'
import '../css/roomPage.css'

const ChatBox = () => {
    const [chatMsg, updateMsg] = useState('');
    const { userObj, socketRef, roomUsersKeys, chatMessages, chatMessagesRef, addMessage } = useStateContext();

    const handleSubmit = () => {
        socketRef.current.emit('broadcast-msg', userObj.current, chatMsg);
        updateMsg('');
    }
    
    return (
    <div className='chat-window col-start-5'>
        <div id='users-drop-down'>Create username drop down here
            {roomUsersKeys.map((user) => (<div key={user.key}>{user.user}</div>))}
        </div>
        <div id='msg-field'>
            {
                chatMessages.length > 0 ? chatMessages.map((chat) => (<Message key={chat.key} user={chat.username} message={chat.content}/>)) : ''
            }
        </div>
        <form>
            <input
                type='text'
                value={chatMsg}
                onChange={(e)=>{updateMsg(e.target.value)}}
                placeholder='Enter message'
            />
        </form>
        <button onClick={handleSubmit}>Send</button>
    </div>
  )
}

export default ChatBox