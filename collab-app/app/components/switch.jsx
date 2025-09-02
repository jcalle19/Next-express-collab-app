import { useState, useEffect, useRef } from 'react'
import '../css/switch.css'

const Switch = ({state, target, func, action}) => {
    const skipFlag = useRef(true); 
    const [value, changeValue] = useState(state);


    const handleClick = () => {
        changeValue(!value);
    };

    useEffect(()=> {
        if (!skipFlag.current) {
            func(target, value);
            action();
        }
        else {
            skipFlag.current = false;
        }
    },[value]);

    return (
        <div className='switch-container' onClick={handleClick}>
            <div className='switch-toggle'
                style={{left: `${!value ? '0%' : '55%'}`}}
            ></div>
        </div>
    )
}

export default Switch