"use client";

import { useState, useEffect } from 'react'
import { useStateContext } from '../contexts/userState.jsx'
import Message from './message.jsx'
import '../css/globals.css'
import '../css/chatBox.css'

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
        <div className={'chat-window'}>
            <div id='users-drop-down' className='glassy'>
                {roomUsersKeys.map((user) => (<div key={user.key}>{user.user}</div>))}
            </div>
            <section id='msg-container' className=''>
                <div id='msg-field' className='glassy'>
                    {
                        chatMessages.length > 0 ? chatMessages.map((chat) => (<Message key={chat.key} user={chat.username} message={chat.content}/>)) : ''
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
        </div>
  )
}

export default ChatBox