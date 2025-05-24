"use client";

import React from 'react'
import {useState, useEffect} from 'react'
import RoomSearch from '../components/roomSearch.jsx'

const home = () => {
  return (
    <div>
      <p>Welcome to co.lab</p>
      <RoomSearch/>
    </div>
  )
}

export default home