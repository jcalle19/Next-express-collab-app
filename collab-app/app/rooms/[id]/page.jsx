"use client";

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRefContext } from '@/contexts/refContext.jsx';
import { useSocketContext } from '@/contexts/socketContext.jsx';
import CursorArea from '@/components/cursorArea.jsx';
import ToolBar from '@/components/toolBar.jsx';
import '@/css/roomPage.css';

export default function RoomPage() {
  const params = useParams();
  const { id } = params;
  //const { socketReady, socketRefReady, loadRoomState } = useStateContext();
  const { socketRefReady } = useRefContext();
  const { validFlag, socketReady, loadRoomState } = useSocketContext();

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
      <ToolBar/>
      <div id='loading-cover' style={{ display: `${validFlag ? 'none' : 'block'}`}}>Loading</div>
    </div>
  );
}