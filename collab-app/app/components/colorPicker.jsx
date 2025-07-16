import { useState, useEffect, useRef} from 'react'
import '../css/colorPicker.css'

const ColorPicker = () => {
    const [currentColor, updateColor] = useState('white');

    const colors = [
        'rgb(255,0,0)','rgb(255,96,0)','rgb(255,191,0)',
        'rgb(191,255,0)','rgb(96,255,0)','rgb(0,255,0)',
        'rgb(0,255,96)','rgb(0,255,191)','rgb(0,191,255)',
        'rgb(0,96,255)','rgb(0,0,255)','rgb(96,0,255)',
        'rgb(191,0,255)','rgb(255,0,191)','rgb(255,0,96)',
    ];
    
    const handleColorClick = (selectedColor) => {
        updateColor(selectedColor);
    }

    return (
        <div id='color-picker-container'>
            <div className='outer-circle' style={{background: `radial-gradient(${currentColor} 25%, transparent 25%)`}}>
                {colors.map((color, index) => (
                    <div key={index} className='color-bar' style={{transform: `rotate(${index * 24}deg)`}}>
                        <div className='color-wrapper' style={{zIndex: index}} onClick={() => handleColorClick(color)}>
                            <div className='color' style={{backgroundColor: color}}></div>
                        </div>
                    </div>
                ))}
            
            </div>
            <div id='black-white-container'>
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
