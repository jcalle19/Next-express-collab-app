"use client";

import { useParams } from 'next/navigation';
import CursorArea from '../../components/cursorArea.jsx';
import '../../css/roomPage.css';

export default function RoomPage() {
  const params = useParams();
  const { id } = params;
  
  return (
    <div>
      <CursorArea id={id}/>
    </div>
  );
}