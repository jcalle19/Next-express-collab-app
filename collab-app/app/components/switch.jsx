import { useState, useEffect, useRef } from 'react'
import '../css/switch.css'

const Switch = ({state, target, func, action}) => {

    const handleClick = () => {
        func(target, !state);
        action();
    };

    return (
        <div className='switch-container' onClick={handleClick}>
            <div className='switch-toggle'
                style={{left: `${!state ? '0%' : '55%'}`}}
            ></div>
        </div>
    )
}

export default Switch