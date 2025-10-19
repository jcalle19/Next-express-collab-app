import {useEffect} from 'react';
import '../css/message.css';

const Message = ({user, message, self, showName}) => {

  return (
    <div style={{
          position: 'relative',
          paddingBottom: '2px',
         }}>
        {showName ? <div className={`fit-content name ${self ? 'self-info' : 'other-info'}`}>{user}</div> : ''}
        <div className={`fit-content message ${self ? 'self-info' : 'other-info'}`}
             style={{
              backgroundColor: `${self ? 'var(--electric-blue)' : 'var(--raspberry)'}`,
              borderRadius: `10px 10px ${self ? '0px 10px' : '10px 0px'}`,
             }}
        >
          {message === undefined ? 'error' : message}
        </div>
    </div>
  )
}

export default Message