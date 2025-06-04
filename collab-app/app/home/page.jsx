"use client";

import React from 'react'
import {useState, useEffect} from 'react'
import RoomForm from '../components/roomSearch.jsx'
import { useStateContext } from '../contexts/userState.jsx'

const home = () => {
  return (
    <div>
      <p>Welcome to co.lab</p>
      <RoomForm/>
    </div>
  )
}

export default home