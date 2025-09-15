import {useState, useEffect} from 'react'
import {useStateContext} from '../contexts/userState.jsx'
import MyColorSlider from './myColorSlider.jsx'
import '../css/colorSelector.css'
import '../css/globals.css'

const ColorSelect = () => {
    const {penInfoRef, penColor, setPenColor, boxColor, setBoxColor, textColor, setTextColor} = useStateContext();
    const [currLabel, setLabel] = useState('pen');

    const [currColor, currSetter] = {
        'pen' : [penColor, setPenColor],
        'box' : [boxColor, setBoxColor],
        'text' : [textColor, setTextColor],
    }[currLabel];

    useEffect(()=> {
        penInfoRef.current.color = `rgba(${currColor.red},${currColor.green},${currColor.blue}, ${currColor.alpha})`;
    },[penColor]);
    
    return (
        <div className='grid grid-rows-[1fr_7fr_1fr] grid-cols-[repeat(15,minmax(0,1fr))] h-full'>
            <div className={`test-border col-start-1 col-span-5 row-start-1 glassy ${currLabel === 'pen' ? 'set-inspecting' : ''}`}
                 onClick={()=>{setLabel('pen')}}>Pen</div>
            <div className={`test-border col-start-6 col-span-5 row-start-1 glassy ${currLabel === 'box' ? 'set-inspecting' : ''}`} 
                 onClick={()=>{setLabel('box')}}>Box</div>
            <div className={`test-border col-start-11 col-span-5 row-start-1 glassy ${currLabel === 'text' ? 'set-ispecting' : ''}`} 
                 onClick={()=>{setLabel('text')}}>Text</div>

            <div className='col-start-1 col-span-3 row-start-2 glassy'>
                <MyColorSlider orientation="vertical" color={currColor} value={currColor} onChange={currSetter} channel="red"/>
            </div>
            <div className='col-start-4 col-span-3 row-start-2 glassy'>
                <MyColorSlider orientation="vertical" value={currColor} onChange={currSetter} channel="green"/>
            </div>
            <div className='col-start-7 col-span-3 row-start-2 glassy'>
                <MyColorSlider orientation="vertical" value={currColor} onChange={currSetter} channel="blue"/>
            </div>
            <div className='col-start-10 col-span-3 row-start-2 glassy'>
                <MyColorSlider orientation="vertical" value={currColor} onChange={currSetter} channel="alpha"/>
            </div>
            <div className='col-start-13 col-span-3 row-start-2 glassy'>
                <div id='color-preview' 
                    style={{backgroundColor: `rgba(${currColor.red}, ${currColor.green}, ${currColor.blue}, ${currColor.alpha})`}}>
                </div>
            </div>
            <div id='rgb-output' className='col-start-1 row-start-3 col-span-full glassy'>
                <p>R: {currColor.red} G: {currColor.green} B: {currColor.blue}</p>
            </div>
        </div>
    )
}
//H: {currColor.hue} S: {currColor.saturation} B: {currColor.brightness} A: {currColor.alpha}
export default ColorSelect;