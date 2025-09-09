import { useState, useEffect, useRef } from 'react'
import { useStateContext } from '../contexts/userState.jsx'
import Icon from './icon.jsx'
import '../css/backgroundBox.css'

const BackgroundBox = ({isVisible}) => {
    const { setBackground, triggerBackgroundFlag } = useStateContext();

    const [blackSelected, updateBlack] = useState(false);
    const [whiteSelected, updateWhite] = useState(false);
    const [urlValue, updateUrl] = useState('');

    const handleUrlSubmit = (e) => {
        e.preventDefault();
        setBackground(`url(${urlValue})`);
        e.target.value = '';
    }
    
    const handleColorSubmit = (e) => {
        e.preventDefault();
        let selected;
        selected = blackSelected ? 'black' : 'white';
        updateBlack(false);
        updateWhite(false);
        setBackground(selected);
    };

    const handleBlackSelect = (e) => {
        e.preventDefault();
        updateBlack(true);
        updateWhite(false);
    };

    const handleWhiteSelect = (e) => {
        e.preventDefault();
        updateWhite(true);
        updateBlack(false);
    };

    return (
        <div className='box-container grid grid-cols-1 grid-rows-[2fr_1fr_2fr_1fr_2fr]'>
            <button id='close-button' onClick={triggerBackgroundFlag}>
                <Icon src={`/toolbar-icons/right-arrow.svg`} width='100%' height='100%'/>
            </button>
            <form id='image-container' className='grid grid-cols-[1fr_2fr_8fr_3fr_1fr] grid-rows-1 row-start-2' onSubmit={handleUrlSubmit}>
                <label className='col-start-2'>Url</label>
                <input className='col-start-3' 
                       id='url-input'
                       type='text' 
                       value={urlValue} 
                       onChange={(e)=>{updateUrl(e.target.value)}}
                />
                <button className='url-submit col-start-4' type='submit'>
                    <Icon src={`/toolbar-icons/check.svg`} width='100%' height='100%'/>
                </button>
            </form>
            <form className='grid grid-cols-[1fr_2fr_4fr_4fr_3fr_1fr] grid-rows-1 row-start-4' onSubmit={handleColorSubmit}>
                <label className='col-start-2'>Blank</label>
                <button id='black-select' className={`select-button ${blackSelected ? 'selected' : ''} col-start-3`} onClick={handleBlackSelect}></button>
                <button id='white-select' className={`select-button ${whiteSelected ? 'selected' : ''} col-start-4`} onClick={handleWhiteSelect}></button>
                <button className='col-start-5 url-submit' type='submit'>
                    <Icon src={`/toolbar-icons/check.svg`} width='100%' height='100%'/>
                </button>
            </form>
        </div>
    )
}

export default BackgroundBox