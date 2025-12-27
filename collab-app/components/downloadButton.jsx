'use client'
import React from 'react'
import Icon from './icon.jsx'
import '@/css/globals.css'
import '@/css/downloadButton.css'
import html2canvas from 'html2canvas';

const DownloadButton = ({left, top, imageRef}) => {

    const generateFormattedFileName = () => {
        const now = new Date();
        return `canvas_${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}.png`;
    };

    /*AI function, html2canvas was being too unpredictable and 
    i didnt really understand it enough to fix it myself*/
    const captureBackground = async () => {
        if (!imageRef?.current) return;

        await document.fonts.ready;

        const original = imageRef.current;

        // Clone entire tree
        const clone = original.cloneNode(true);
        clone.style.position = "fixed";
        clone.style.top = "0";
        clone.style.left = "0";
        clone.style.margin = "0";
        clone.style.transform = "none";
        clone.style.scale = "1";
        clone.style.width = `${original.offsetWidth}px`;
        clone.style.height = `${original.offsetHeight}px`;
        clone.style.zIndex = "-1";

        document.body.appendChild(clone);

        // --- 🔥 COPY CANVAS CONTENT HERE ---
        const originalCanvases = original.querySelectorAll("canvas");
        const clonedCanvases = clone.querySelectorAll("canvas");

        originalCanvases.forEach((orig, i) => {
            const cloned = clonedCanvases[i];
            if (!cloned) return;

            cloned.width = orig.width;    // match resolution
            cloned.height = orig.height;

            const ctx = cloned.getContext("2d");
            ctx.drawImage(orig, 0, 0);
        });
        // --- END FIX ---

        const canvas = await html2canvas(clone, {
            useCORS: true,
            allowTaint: true,
            foreignObjectRendering: true,
            backgroundColor: null,
            scale: 2,
        });

        document.body.removeChild(clone);

        const link = document.createElement("a");
        link.download = generateFormattedFileName();
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    return (
        <div id='download-button' style={{
                    left: `${left}%`,
                    top: `${top}%`,
                }}
            onDragStart={(e)=>{e.preventDefault()}}
            onClick={captureBackground}
        >
            <Icon src={`/toolbar-icons/download.svg`} width='75%' height='75%'/>
        </div>
    )
}

export default DownloadButton;