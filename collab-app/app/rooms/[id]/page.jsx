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
  const { userObj, socketRef } = useStateContext();

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
      <h1>Post ID: {id}</h1>
    </div>
  );
}