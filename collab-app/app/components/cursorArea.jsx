"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useStateContext } from '../contexts/userState.jsx'
import UserIcon from './userIcons.jsx';
import Canvas from './canvas.jsx';
import '../css/roomPage.css';

const CursorArea = ({id}) => {
  const [coords, setCoords] = useState([0,0]);
  const [mapSnapshot, takeSnapshot] = useState(new Map());
  const {userObj, socketRef, roomUsers } = useStateContext();

  //Rendering snapshot of current user locations
  useEffect(() => {
    //refreshing to display updated roomInfo
    const interval = setInterval(() => {
      takeSnapshot(new Map(roomUsers.current));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  //Gets client's location separately for smooth mouse.
  const getMouseLocation = (e) => {
    setCoords([e.clientX, e.clientY]);
    if (socketRef.current !== null) {
      userObj.current.xCoord = e.clientX;
      userObj.current.yCoord = e.clientY;
      socketRef.current.emit('update-room', userObj.current);
    }
  }
  
  return (
    <div onMouseMove={getMouseLocation} className="test-border cursor-window col-span-4">
      <UserIcon x={coords[0]} y={coords[1]}/>
      {[...mapSnapshot].map(([user, userInfo]) => 
          userInfo.id != userObj.current.id ? <UserIcon key={userInfo.id} x={userInfo.xCoord} y={userInfo.yCoord}/> : ''
        )
      }
      <Canvas/>
    </div>
  );
}

export default CursorArea;