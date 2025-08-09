`use client`;

import { useState, useEffect, useRef } from 'react'
import { useStateContext } from '../contexts/userState.jsx'
import '../css/toolMenu.css'
import '../css/globals.css'
import ColorPicker from './colorPicker.jsx'
import Comment from './comment.jsx'
import ChatBox from './chatBox.jsx'
import Icon from './icon.jsx'
import * as THREE from 'three'; // Import Three.js
import HALO from 'vanta/dist/vanta.halo.min';

const ToolBar = () => {
    /*Vanta.js Background Stuff*/
    const vantaRef = useRef(null);
    const [vantaEffect, setVantaEffect] = useState(null);
    /*-------------------------*/
    const [expanded, changeSize] = useState(false);
    const [sliderValue, changeSlider] = useState('0');
    const [previewWidth, changeWidth] = useState('0');
    const sliderPxRef = useRef(2);
    const { triggerUndo, triggerRedo, triggerLineTool, 
            triggerHighlight, triggerClear, triggerTextFlag, 
            sliderThumbColor, penInfoRef, addComment } = useStateContext();
    const iconFolder = 'toolbar-icons'
    const minSize = 1;
    const maxSize = 7;

    useEffect(() => {
        penInfoRef.current.size = sliderPxRef.current * 2; //multiplying by 2 to account for symmetry of radial gradient to make more accurate
    },[sliderValue, sliderThumbColor]);

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

    const handleToggleClick = (e) => {
        changeSize(!expanded);
    }

    const handleSliderChange = (newVal) => {
        changeSlider(newVal);
        percentToPixel(newVal);
    }

    const triggerAddComment = () => {
        addComment();
    }

    const percentToPixel = (percent) => {
        sliderPxRef.current = minSize + Math.ceil((percent / 100) * maxSize * penInfoRef.current.scale);
        console.log(sliderPxRef.current);
        changeWidth(sliderPxRef.current * 1.8 * penInfoRef.current.scale);
    }

    return (
        <div ref={vantaRef} id='side-bar-container' className='grid grid-cols-1 grid-rows-[8fr_4fr]'>
            <div id='side-bar-overlay'>
                <section id='edit-section' className='grid grid-cols-1 grid-rows-[3fr_2fr]'>
                <div id='pen-row' className='grid grid-cols-2 grid-rows-1'>
                    <div id='pen-col-1' className='grid grid-cols-1 grid-rows-[1fr_2fr_4fr]'>
                        <div id='undo-redo-row' className='grid grid-cols-2 grid-rows-1'>
                            <div id='undo' className='col-start-1 glassy'>
                                <Icon src={`/${iconFolder}/left-arrow.svg`} width='85%' height='85%'/>
                            </div>
                            
                            <div id='redo' className='col-start-2 glassy'>
                                <Icon src={`/${iconFolder}/right-arrow.svg`} width='85%' height='85%'/>
                            </div>
                        </div>
                        <div id='width-row' className='grid grid-cols-1 grid-rows-[1fr_2fr]'>
                            <div className='row-start-1 glassy'>
                                <div id='width-preview'
                                    style={{height: `${previewWidth}px`}}
                                >

                                </div>
                            </div>
                            <div className='row-start-2 glassy'>
                                <input 
                                    id="width-slider" 
                                    type="range" min="2" 
                                    max="100" value={sliderValue} 
                                    onChange={(e) => handleSliderChange(e.target.value)}
                                    style={{'--slider-thumb-bg' : 
                                        `radial-gradient(${penInfoRef.current.color} 0px, 
                                        ${penInfoRef.current.color} ${sliderPxRef.current}px, 
                                        transparent  ${sliderPxRef.current}px, 
                                        transparent 100%)`
                                    }}
                                />
                            </div>
                        </div>
                        <div id='draw-mode-row' className='grid grid-cols-3 grid-rows-[1fr_2fr]'>
                            <div id='highlight-active' className='row-start-1 col-start-1 glassy'></div>
                            <div id='line-active' className='row-start-1 col-start-2 glassy'></div>
                            <div id='text-edit-active' className='row-start-1 col-start-3 glassy'></div>
                            <div id='highlight-toggle' className='row-start-2 col-start-1 glassy'>
                                <Icon src={`/${iconFolder}/marker-pen.svg`} width='35%' height='35%'/>
                            </div>
                            <div id='line-toggle' className='row-start-2 col-start-2 glassy'>
                                <Icon src={`/${iconFolder}/line.svg`} width='35%' height='35%'/>
                            </div>
                            <div id='text-edit-toggle' className='row-start-2 col-start-3 glassy'>
                                <Icon src={`/${iconFolder}/edit.svg`} width='35%' height='35%'/>
                            </div>
                        </div>
                    </div>
                    <div id='pen-col-2' className='relative glassy no-margin-right'>
                        <ColorPicker expanded={true}/>
                    </div>
                </div>
                <div id='comment-row' className='grid grid-cols-[1fr_10fr] grid-rows-1'>
                    <div id='clear-button' className='col-start-1 glassy'>
                        <Icon src={`/${iconFolder}/trash.svg`} width='35%' height='35%'/>
                    </div>
                    <div id='comment-window' className='col-start-2 glassy no-margin-right'></div>
                </div>
            </section>
            <section id='chat-section'>
                <ChatBox/>
            </section>
            </div>
        </div>
        /*
        <>
        <div id='tool-bar-container' className='grid grid-cols-[4fr_1fr]'>
            <div className={!expanded ? 'tool-bar tool-bar-expand' : 'tool-bar tool-bar-content'}>
                <div id='tool-grid' className={!expanded ? "transparent" : ""}>
                    <div className='grid grid-cols-[1fr_3fr]'>
                        <div className='grid-box'>width</div>
                        <div className='grid-box'>
                            <input 
                                id="width-slider" 
                                type="range" min="2" 
                                max="100" value={sliderValue} 
                                onChange={(e) => handleSliderChange(e.target.value)}
                                style={{'--slider-thumb-bg' : 
                                            `radial-gradient(${penInfoRef.current.color} 0px, 
                                            ${penInfoRef.current.color} ${sliderPxRef.current}px, 
                                            transparent  ${sliderPxRef.current}px, 
                                            transparent 100%)`
                                        }}
                            />
                        </div>
                    </div>
                    <div className='grid grid-cols-12 grid-rows-3'>
                        <div className="grid-box col-span-6" onClick={triggerHighlight}>highlight</div>
                        <div className="grid-box col-span-6" onClick={triggerClear}>clear</div>
                        <div className="grid-box col-span-3 row-start-2" onClick={triggerLineTool}>line</div>
                        <div className="grid-box col-span-5 row-start-2" onClick={triggerAddComment}>Comment</div>
                        <div className="grid-box col-span-4 row-start-2" onClick={triggerTextFlag}>Edit text</div>
                        <div className="grid-box col-span-6 row-start-3" onClick={triggerUndo}>undo</div>
                        <div className="grid-box col-span-6 row-start-3" onClick={triggerRedo}>redo</div>
                    </div>

                </div>
                <ColorPicker expanded={expanded}/>
            </div>
            <div className={!expanded ? 'tool-bar tool-bar-expand' : 'tool-bar tool-bar-close'} onClick={handleToggleClick}></div>
        </div>
        </>*/
    )
}

export default ToolBar