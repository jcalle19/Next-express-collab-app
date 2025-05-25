"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { io } from 'socket.io-client';

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

export default function RoomPage() {
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    socket.emit('test', id);
    return () => {
        socket.disconnect(); // Clean up on component unmount
    };
  }, []);

  return (
    <div>
      <h1>Post ID: {id}</h1>
    </div>
  );
}