"use client";

import { useParams } from 'next/navigation';
import CursorArea from '../../components/cursorArea.jsx';
import ChatBox from '../../components/chatBox.jsx';
import '../../css/roomPage.css';

export default function RoomPage() {
  const params = useParams();
  const { id } = params;
  
  return (
    <div className='window-container grid grid-cols-5'>
      <CursorArea id={id}/>
      <ChatBox/>
    </div>
  );
}