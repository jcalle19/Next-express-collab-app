"use client";

import { useState, useEffect, useRef } from 'react';
import { useRefContext } from '@/contexts/refContext.jsx'
import UserIcon from './userIcons.jsx';
import Canvas from './canvas.jsx';
import '@/css/roomPage.css';

const CursorArea = ({id}) => {
  const [coords, setCoords] = useState([0,0]);
  const [mapSnapshot, takeSnapshot] = useState(new Map());
  //const {userObj, socketRef, roomUsers} = useStateContext();
  const { userObj, socketRef, roomUsers} = useRefContext();
  
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
    }
  }

  return (
    <div onMouseMove={getMouseLocation} className="cursor-window">
      <UserIcon x={coords[0]} y={coords[1]}/>
      <Canvas/>
    </div>
  );
}

export default CursorArea;