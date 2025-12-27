import React from 'react'
import { useState } from 'react'
import '@/css/userIcons.css'

const UserIcon = ({x, y}) => {
    const [coords, setCoords] = useState([0,0]);
    if (x !== coords[0] || y !== coords[1]) {
        setCoords([x,y]);
    }
    return (
        <div className="icon" style={{left: coords[0], top: coords[1]}}></div>
    )
}

export default UserIcon