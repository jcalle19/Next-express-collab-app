import React from 'react'

const Message = ({user, message}) => {
  return (
    <div>
        <p>{user}: </p>
        <p>{message === undefined ? 'error' : message}</p>
    </div>
  )
}

export default Message