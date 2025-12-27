//UNUSED
import { useState, useEffect, useRef} from 'react'
import { useStateContext } from '@/contexts/userState.jsx';
import '@/css/colorPicker.css'

const ColorPicker = ({expanded}) => {
    const [currentColor, updateColor] = useState('white');
    const { newSliderColor, penInfoRef } = useStateContext();
    const colors = [
        'rgb(255,0,0)','rgb(255,96,0)','rgb(255,191,0)',
        'rgb(191,255,0)','rgb(96,255,0)','rgb(0,255,0)',
        'rgb(0,255,96)','rgb(0,255,191)','rgb(0,191,255)',
        'rgb(0,96,255)','rgb(0,0,255)','rgb(96,0,255)',
        'rgb(191,0,255)','rgb(255,0,191)','rgb(255,0,96)',
    ];
    
    const handleColorClick = (selectedColor) => {
        updateColor(selectedColor);
        newSliderColor(selectedColor);
        penInfoRef.current.color = selectedColor;
    }

    return (
        <div id='color-picker-container'>
            <div className={`outer-circle ${expanded ? 'outer-circle-expanded' : 'outer-circle-mini'}`} style={{background: `radial-gradient(${currentColor} 50%, transparent 50%)`}}>
                {colors.map((color, index) => (
                    <div key={index} className='color-bar' style={{transform: `rotate(${index * 24}deg)`}}>
                        <div className='color-wrapper' style={{zIndex: index}} onClick={() => handleColorClick(color)}>
                            <div className='color' style={{backgroundColor: color}}></div>
                        </div>
                    </div>
                ))}
            
            </div>
            <div id='black-white-container' className={`${expanded ? '' : 'transparent'}`}>
                <div className='color-wrapper' style={{display: 'inline-block', width: '50%', height: '100%'}} onClick={() => handleColorClick('white')}>
                    <div id='white'></div>
                </div>
                <div className='color-wrapper' style={{display: 'inline-block', width: '50%', height: '100%'}} onClick={() => handleColorClick('black')}>
                    <div id='black'></div>
                </div>
            </div>
        </div>
    )
}

export default ColorPicker
