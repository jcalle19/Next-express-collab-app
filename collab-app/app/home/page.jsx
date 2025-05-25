"use client";

import React from 'react'
import {useState, useEffect} from 'react'
import {io} from 'socket.io-client'
import RoomForm from '../components/roomSearch.jsx'
import CreateRoomButton from '../components/createRoomButton.jsx'
const home = () => {
  const joinRoom = () => {

  };

  const createRoom = () => {

  }
  
  return (
    <div>
      <p>Welcome to co.lab</p>
      <RoomForm /*give submit function*//>
      <CreateRoomButton /*give submit function*//>
    </div>
  )
}

export default home