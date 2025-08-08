"use client";

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useStateContext } from '../../contexts/userState.jsx';
import CursorArea from '../../components/cursorArea.jsx';
import ChatBox from '../../components/chatBox.jsx';
import RoomInfoPanel from '../../components/roomInfoPanel.jsx';
import ToolBar from '../../components/toolBar.jsx';
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

  //<ChatBox/>
  return (
    <div className='window-container'>
      <CursorArea id={id}/>
      
      <RoomInfoPanel/>
      <ToolBar/>
    </div>
  );
}