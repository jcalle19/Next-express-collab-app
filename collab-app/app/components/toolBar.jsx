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
    const [sliderValue, changeSlider] = useState('0');
    const [previewWidth, changeWidth] = useState('2');
    const sliderPxRef = useRef(3);
    const { triggerUndo, triggerRedo, triggerLineTool, 
            triggerHighlight, triggerClear, triggerTextFlag, 
            highlightFlag, lineFlag, textEditFlag,
            sliderThumbColor, penInfoRef, addComment } = useStateContext();
    const iconFolder = 'toolbar-icons'
    const minSize = 3;
    const maxSize = 48;

    useEffect(() => {
        window.addEventListener('resize', percentToPixel);
    }, []);

    useEffect(() => {
        sliderPxRef.current = minSize + ((sliderValue / 100) * maxSize);
        changeWidth(penInfoRef.current.size  * penInfoRef.current.scale);
        penInfoRef.current.size = sliderPxRef.current; //multiplying by 2 to account for symmetry of radial gradient to make more accurate
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

    const handleSliderChange = (newVal) => {
        changeSlider(newVal);
    }

    const triggerAddComment = () => {
        addComment();
    }

    const percentToPixel = (percent) => {
        sliderPxRef.current = minSize + ((percent / 100) * maxSize);
        changeWidth(penInfoRef.current.size  * penInfoRef.current.scale);
    }

    return (
        <div ref={vantaRef} id='side-bar-container' className='grid grid-cols-1 grid-rows-[8fr_4fr]'>
            <div id='side-bar-overlay'>
                <section id='edit-section' className='grid grid-cols-1 grid-rows-[3fr_2fr]'>
                <div id='pen-row' className='grid grid-cols-2 grid-rows-1'>
                    <div id='pen-col-1' className='grid grid-cols-1 grid-rows-[1fr_2fr_4fr]'>
                        <div id='undo-redo-row' className='grid grid-cols-2 grid-rows-1'>
                            <div id='undo' className='col-start-1 glassy' onClick={triggerUndo}>
                                <Icon src={`/${iconFolder}/left-arrow.svg`} width='85%' height='85%'/>
                            </div>
                            
                            <div id='redo' className='col-start-2 glassy' onClick={triggerRedo}>
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
                        <div id='draw-mode-row' className='grid grid-cols-3 grid-rows-[1fr_2fr]'>
                            <div id='background-set' className='row-start-1 col-start-1 glassy'></div>
                            <div id='undetermined1-active' className='row-start-1 col-start-2 glassy'></div>
                            <div id='undetermined2-active' className='row-start-1 col-start-3 glassy'></div>
                            <div id='highlight-toggle' className={`row-start-2 col-start-1 glassy ${highlightFlag ? 'set-inspecting' : ''}`} onClick={triggerHighlight}>
                                <Icon src={`/${iconFolder}/marker-pen.svg`} width='35%' height='35%'/>
                            </div>
                            <div id='line-toggle' className={`row-start-2 col-start-2 glassy ${lineFlag ? 'set-inspecting' : ''}`} onClick={triggerLineTool}>
                                <Icon src={`/${iconFolder}/line.svg`} width='35%' height='35%'/>
                            </div>
                            <div id='text-edit-toggle' className={`row-start-2 col-start-3 glassy ${textEditFlag ? 'set-inspecting' : ''}`} onClick={triggerTextFlag}>
                                <Icon src={`/${iconFolder}/edit.svg`} width='35%' height='35%'/>
                            </div>
                        </div>
                    </div>
                    <div id='pen-col-2' className='relative glassy no-margin-right'>
                        <ColorPicker expanded={true}/>
                    </div>
                </div>
                <div id='comment-row' className='grid grid-cols-[1fr_10fr] grid-rows-1' onClick={triggerClear}>
                    <div id='clear-button' className='col-start-1 glassy'>
                        <Icon src={`/${iconFolder}/trash.svg`} width='50%' height='35%'/>
                    </div>
                    <div id='comment-window' className='col-start-2 glassy no-margin-right'></div>
                </div>
            </section>
            <section id='chat-section'>
                <ChatBox/>
            </section>
            </div>
        </div>
    )
}

export default ToolBar