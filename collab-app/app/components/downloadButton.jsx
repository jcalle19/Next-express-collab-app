'use client'
import React from 'react'
import Icon from './icon.jsx'
import '../css/globals.css'
import '../css/downloadButton.css'
import { toPng } from 'html-to-image';
import html2canvas from 'html2canvas';

const DownloadButton = ({left, top, imageRef, size}) => {
    const download_unused = () => {
        if (!imageRef) return;
        const targetWidth = 3600;
        const targetHeight = 3000;

        // Get original size of the element
        const node = imageRef.current;
        console.log(size.width, size.height);
        toPng(imageRef.current, {
            cacheBust: true,
            pixelRatio: 1,
            width: size.width * 1.15,
            height: size.height * 1.15,
        }).then((dataUrl) => {
            const link = document.createElement('a');
            link.download = 'my-capture.png';
            link.href = dataUrl;
            link.click();
        }).catch((error) => {
            console.error('Error capturing image:', error);
        });
    }

    const download = () => {
        const node = imageRef.current;
        node.style.overflow = 'visible';
        html2canvas(node, {
            scale: 2,   // increase quality
            useCORS: true,
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'snapshot.png';
            link.href = canvas.toDataURL();
            link.click();
        });
        node.style.overflow = 'hidden';
    }
    
    return (
        <div id='download-button' style={{
                    left: `${left}%`,
                    top: `${top}%`,
                }}
            onDragStart={(e)=>{e.preventDefault()}}
            onClick={download}
        >
            <Icon src={`/toolbar-icons/download.svg`} width='75%' height='75%'/>
        </div>
    )
}

export default DownloadButton;