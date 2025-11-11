`use client`;

import { useState, useEffect, useRef } from 'react'
import { useRefContext } from '../contexts/refContext.jsx'
import { useDrawingContext } from '../contexts/drawingContext.jsx'
import { useSocketContext } from '../contexts/socketContext.jsx' 
import '../css/toolMenu.css'
import '../css/globals.css'
import ColorSelect from './colorSelect.jsx'
import Note from './note.jsx'
import ChatBox from './chatBox.jsx'
import Icon from './icon.jsx'
import * as THREE from 'three'; // Import Three.js
import HALO from 'vanta/dist/vanta.halo.min';

const ToolBar = () => {
    /*Vanta.js Background Stuff*/
    const vantaRef = useRef(null);
    const [vantaEffect, setVantaEffect] = useState(null);
    /*-------------------------*/
    const [sliderValue, changeSlider] = useState('0');
    const [previewWidth, changeWidth] = useState('2');
    const sliderPxRef = useRef(3);
    const { flagMap, penColor, boxColor, textColor, triggerFlag, previewFontSize, updateClear } = useDrawingContext();
    const { zoomIn, zoomOut, hostFlag } = useSocketContext();
    const { penInfoRef, clearFunctionRef } = useRefContext();
    const iconFolder = 'toolbar-icons'
    const minSize = 3;
    const maxSize = 48;

    useEffect(() => {
        window.addEventListener('resize', percentToPixel);
        console.log(clearFunctionRef.current);
    }, []);

    useEffect(() => {
        sliderPxRef.current = minSize + ((sliderValue / 100) * maxSize);
        changeWidth(penInfoRef.current.size  * penInfoRef.current.scale);
        penInfoRef.current.size = sliderPxRef.current; //multiplying by 2 to account for symmetry of radial gradient to make more accurate
    },[sliderValue, penColor]);

    /*Template Code*/
    useEffect(() => {
        if (!vantaEffect) {
            setVantaEffect(
                HALO({ 
                    el: vantaRef.current,
                    THREE: THREE,
                    mouseControls: true,
                    touchControls: true,
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    xOffset: 0.75,
                    baseColor: 0x0,
                    backgroundColor: 0x0,
                    amplitudeFactor: 3.00,
                    size: 3.00
                })
            );
        }
        return () => {
        if (vantaEffect) vantaEffect.destroy();
        };
    }, [vantaEffect]);
    /*-------------*/

    const handleSliderChange = (newVal) => {
        changeSlider(newVal);
    }

    const percentToPixel = (percent) => {
        sliderPxRef.current = minSize + ((percent / 100) * maxSize);
        changeWidth(penInfoRef.current.size  * penInfoRef.current.scale);
    }
    
    return (
        <div ref={vantaRef} id='side-bar-container'>
            <div id='side-bar-toggle'></div>
            <div id='side-bar-overlay' className='grid grid-cols-1 grid-rows-2'>
                <section id='edit-section' className='grid grid-cols-1 grid-rows-4'>
                    <div id='pen-row' className='grid grid-cols-2 grid-rows-1 row-start-1 row-span-3'>
                        <div id='pen-col-1' className='grid grid-cols-1 grid-rows-[1fr_2fr_4fr]'>
                            <div id='undo-redo-row' className='grid grid-cols-2 grid-rows-1'>
                                <div id='undo' className='col-start-1 glassy' onClick={()=>triggerFlag('undo')}>
                                    <Icon src={`/${iconFolder}/left-arrow.svg`} width='85%' height='85%'/>
                                </div>
                                
                                <div id='redo' className='col-start-2 glassy' onClick={()=>triggerFlag('redo')}>
                                    <Icon src={`/${iconFolder}/right-arrow.svg`} width='85%' height='85%'/>
                                </div>
                            </div>
                            <div id='width-row' className='grid grid-cols-1 grid-rows-[1fr_2fr]'>
                                <div className='row-start-1 glassy'>
                                    <div id='width-preview'
                                        style={{height: `${previewWidth ? previewWidth : '2'}px`,
                                                borderRadius: `${previewWidth / 2}px`,
                                                backgroundColor: `${penInfoRef.current.color}`
                                        }}
                                    ></div>
                                </div>
                                <div className='row-start-2 glassy'>
                                    <input 
                                        id="width-slider" 
                                        type="range" min="2" 
                                        max="100" value={sliderValue} 
                                        onChange={(e) => handleSliderChange(e.target.value)}
                                        style={{'--slider-thumb-color' : `${penInfoRef.current.color}`}}
                                    />
                                </div>
                            </div>
                            <div id='draw-mode-row' className={`grid grid-cols-1 grid-rows-[1fr_2fr]`}>
                                {hostFlag ? 
                                <div className='row-start-1 grid grid-cols-3'>
                                    <div id='background-set' className='col-start-1 glassy' onClick={clearFunctionRef.current}>
                                        <Icon src={`/${iconFolder}/image.svg`} width='55%' height='55%'/>
                                    </div>
                                    <div id='zoom-in' className='col-start-2 glassy' onClick={zoomIn}>
                                        <Icon src={`/${iconFolder}/zoom-in.svg`} width='55%' height='55%'/>
                                    </div>
                                    <div id='zoom-out' className='col-start-3 glassy' onClick={zoomOut}>
                                        <Icon src={`/${iconFolder}/zoom-out.svg`} width='55%' height='55%'/>
                                    </div>
                                </div> : 
                                <div className='row-start-1 glassy'>
                                    <Icon src={`/${iconFolder}/lock.svg`} width='55%' height='55%'/>
                                </div>
                                }
                                <div className='row-start-2 grid grid-cols-3'>
                                    <div id='highlight-toggle' className={`col-start-1 glassy ${flagMap.get('highlight')[0] ? 'set-inspecting' : ''}`} onClick={()=>triggerFlag('highlight')}>
                                        <Icon src={`/${iconFolder}/marker-pen.svg`} width='35%' height='35%'/>
                                    </div>
                                    <div id='line-toggle' className={`col-start-2 glassy ${flagMap.get('line')[0] ? 'set-inspecting' : ''}`} onClick={()=>triggerFlag('line')}>
                                        <Icon src={`/${iconFolder}/line.svg`} width='35%' height='35%'/>
                                    </div>
                                    <div id='text-edit-toggle' className={`col-start-3 glassy ${flagMap.get('text')[0] ? 'set-inspecting' : ''}`} onClick={()=>triggerFlag('text')}>
                                        <Icon src={`/${iconFolder}/edit.svg`} width='35%' height='35%' className='row-start-1'/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id='pen-col-2' className='relative col-start-2'>
                            <ColorSelect/>
                        </div>
                    </div>
                    <div id='comment-row' className='grid grid-cols-9 grid-rows-1 row-start-4' onClick={()=>triggerFlag('clear')}>
                        <div id='clear-button' className='col-start-1 col-span-1 glassy'>
                            <Icon src={`/${iconFolder}/clear.svg`} width='50%' height='35%'/>
                        </div>
                        <div id='comment-window' className='grid col-start-2 col-span-8 grid-cols-1'>
                            <Note isPreview={true} 
                                content={':D'}
                                boxColor={`rgba(${boxColor.red},${boxColor.green},${boxColor.blue},${boxColor.alpha})`}
                                textColor={`rgba(${textColor.red},${textColor.green},${textColor.blue},${textColor.alpha})`}
                                fontSize={previewFontSize}
                            />
                        </div>
                    </div>
                </section>
                <section id='chat-section' className='row-start-2'>
                    <ChatBox/>
                </section>
            </div>
        </div>
    )
}

export default ToolBar