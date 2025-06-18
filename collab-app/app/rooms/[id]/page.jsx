"use client";

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useStateContext } from '../../contexts/userState.jsx';
import CursorArea from '../../components/cursorArea.jsx';
import ChatBox from '../../components/chatBox.jsx';
import RoomInfoPanel from '../../components/roomInfoPanel.jsx';
import '../../css/roomPage.css';

export default function RoomPage() {
  const params = useParams();
  const { id } = params;
  const { socketReady, socketRefReady, loadRoomState } = useStateContext();

  useEffect(() => {
    if (socketRefReady.current) {
      console.log('Socket ready');
      loadRoomState(String(id));
    }
    else {
      console.log('Socket not ready');
    }
  }, [socketReady]);
  /*
  useEffect(() => {
    loadRoomState(String(id));
  }, []);
  */
  return (
    <div className='window-container grid grid-cols-5'>
      <CursorArea id={id}/>
      <ChatBox/>
      <RoomInfoPanel/>
    </div>
  );
}