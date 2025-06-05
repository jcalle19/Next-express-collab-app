"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useStateContext } from '../../contexts/userState.jsx'
import UserIcon from '../../components/userIcons.jsx';
import '../../css/roomPage.css';

export default function RoomPage() {
  const params = useParams();
  const { id } = params;
  const [coords, setCoords] = useState([0,0]);
  const [mapSnapshot, takeSnapshot] = useState(new Map());
  const {userObj, socketRef, roomUsers } = useStateContext();

  //Rendering snapshot of current user locations
  useEffect(()=>{
    const interval = setInterval(() => {
      takeSnapshot(new Map(roomUsers.current));
    }, 100);

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
    <div onMouseMove={getMouseLocation} className="test-border main-window">
      <UserIcon x={coords[0]} y={coords[1]}/>
      {[...mapSnapshot].slice(1).map(([user, userObj]) => 
        <UserIcon key={userObj.id} x={userObj.xCoord} y={userObj.yCoord}/>)
      }
      <h1>Post ID: {id}</h1>
    </div>
  );
}