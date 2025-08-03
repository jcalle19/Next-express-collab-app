import { useState, useEffect } from 'react'
import { useStateContext } from '../contexts/userState.jsx'
import Comment from './comment.jsx'

const CommentArea = () => {
    const { roomCommentsRef } = useStateContext();

    return (
        <div 
            style={{width: '100vw', height: '100vh',}}
        >
            {[...roomCommentsRef.current].map(([commentKey, comment]) => 
                <Comment key={commentKey} commentInfo={comment}/>
            )}
        </div>
    )
}

export default CommentArea