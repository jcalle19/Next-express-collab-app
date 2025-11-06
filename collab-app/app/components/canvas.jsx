import { useState, useEffect, useRef } from 'react'
import { compressToUTF16, decompressFromUTF16 } from 'lz-string'
import { useRefContext } from '../contexts/refContext.jsx'
import { useDrawingContext } from '../contexts/drawingContext.jsx'
import { useCanvasContext } from '../contexts/canvasContext.jsx'
import { useSocketContext } from '../contexts/socketContext.jsx'
import { useStateContext } from '../contexts/stateContext.jsx'
import '../css/canvas.css'
import BackgroundBox from './backgroundBox.jsx'
import NoteArea from './noteArea.jsx'

const Canvas = () => {
    const canvasRef = useRef(null);
    const backgroundRef = useRef(null);
    const ctxRef = useRef(null);
    const prevRef = useRef(null);
    const newRef = useRef(null);
    const drawingRef = useRef(false);
    const lineStorageRef = useRef([]);
    const removedLineRef = useRef([]);
    const currentLineRef = useRef([]);
    const sendingLineRef = useRef([]);
    const lastEmitRef = useRef(0);
    const scaleXRef = useRef(1);
    const scaleYRef = useRef(1);
    const strokeCount = useRef(0);
    const lastStrokeCount = useRef(0);
    const highLightFactors = {sizeFactor : 10, opacityFactor : .5};
    const { userObj, penInfoRef, canvasOffsetRef, canvasSizeRef, incomingLineRef, socketRef, roomCanvasesRef } = useRefContext();
    const { highlightFlag, lineFlag, undoFlag, redoFlag, backgroundSelectFlag, clearFlag } = useDrawingContext();
    const { windowSizeX, windowSizeY, windowResize, updateSize } = useCanvasContext();
    const { canvasBackground, canvasZoom } = useSocketContext();
    const { redrawFlag, triggerRedraw } = useStateContext();
    

    const EMIT_INTERVAL = 16;

    useEffect(()=>{
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = 2600;
        canvas.height = 2000;
        ctxRef.current = canvas.getContext('2d');

        // render loop (runs ~60fps)
        let animId;
        const render = () => {
            animId = requestAnimationFrame(render);
            if (incomingLineRef.current.length > 0) { //could optimize with a while loop
                const stroke = incomingLineRef.current.shift();
                stroke.forEach((line, index) => {
                    drawLine(line.prev, line.new, line.color, line.size, line.join, line.cap, line.alpha, ctxRef.current, false);
                });
            }
        };
        render();

        windowResize();
        window.addEventListener('resize', windowResize);
        return ()=>{
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', windowResize);
            lineStorageRef.current = [];
            removedLineRef.current = [];
            currentLineRef.current = [];
            sendingLineRef.current = [];
        }
    }, []);

    useEffect(()=>{
        if (redrawFlag) {
            drawFromServer();
            triggerRedraw(false);
        }
    },[redrawFlag]);

    //Batched sending to server
    useEffect(()=>{
        const tick = () => {
            requestAnimationFrame(tick);
            const now = performance.now();
            if (now - lastEmitRef.current > EMIT_INTERVAL && sendingLineRef.current.length > 0) {
                socketRef.current.emit('draw-line', userObj.current.roomId, sendingLineRef.current); // send to others (add token check)
                sendingLineRef.current = [];
                lastEmitRef.current = now;
            }
        }
        tick();
    }, []);

    /* Need to make canvas scale equally with x and y */
    useEffect(() => {
        const canvas = canvasRef.current;
        const background = backgroundRef.current;
        ctxRef.current = canvas.getContext('2d');
        ctxRef.current.lineCap = 'round';
        ctxRef.current.lineJoin = 'round';
        if (windowSizeY < (1.2 * windowSizeX * .50)) {
            background.style.width = `${windowSizeY * 1.105}px`;
            background.style.height = `${windowSizeY * .85}px`;
            canvas.style.width = `${windowSizeY * 1.105}px`;
            canvas.style.height = `${windowSizeY * .85}px`;
        } else {
            background.style.width = `${windowSizeX * .65}px`;
            background.style.height = `${windowSizeX * .50}px`;
            canvas.style.width = `${windowSizeX * .65}px`;
            canvas.style.height = `${windowSizeX * .50}px`;
        }
        scaleXRef.current = canvas.width / canvas.clientWidth;
        scaleYRef.current = canvas.height / canvas.clientHeight;
        penInfoRef.current.scale = canvas.clientHeight / canvas.height;
        
        //Passed down to grandchild note components
        let canvasRect = canvas.getBoundingClientRect();
        canvasOffsetRef.current.left = canvasRect.left;
        canvasOffsetRef.current.top = canvasRect.top;
        canvasSizeRef.current.width = canvasRect.width;
        canvasSizeRef.current.height = canvasRect.height;
        updateSize({width: canvasRect.width, height: canvasRect.height});
    },[windowSizeX, windowSizeY]);

    /*----- Menu Button Effects -----*/
    useEffect(()=> {
        if (lineStorageRef.current.length >= 1) {
            let last = lineStorageRef.current.pop();
            removedLineRef.current.push(last);
            //redrawCanvas();
            storeCompressedCanvas();
            //triggerRedraw(true);
            socketRef.current.emit('request-sync', userObj.current.roomId); //can be slightly optimized by making a request-canvas funtion
        }
    },[undoFlag]);

    useEffect (()=> {
        if (removedLineRef.current.length >= 1) {
            let last = removedLineRef.current.pop();
            lineStorageRef.current.push(last);
            storeCompressedCanvas();
            socketRef.current.emit('request-sync', userObj.current.roomId);
        }
    },[redoFlag]);

    useEffect (() => {
        ctxRef.current.globalAlpha *= highlightFlag ? highLightFactors.opacityFactor :  1 / highLightFactors.opacityFactor;
        ctxRef.current.lineJoin = highlightFlag ? 'butt' : 'round';
        ctxRef.current.lineCap = highlightFlag ? 'butt' : 'round';
    },[highlightFlag]);

    useEffect (()=> {
        lineStorageRef.current.map((line) => {removedLineRef.current.push(line)});
        removedLineRef.current = lineStorageRef.current;
        lineStorageRef.current = [];
        storeCompressedCanvas();
        socketRef.current.emit('request-sync', userObj.current.roomId);
        //clearCanvas();
    },[clearFlag]);

    /*-------------------------------*/

    const storeCompressedCanvas = () => {
        let currToken = sessionStorage.getItem('roomToken');
        const compressed = compressToUTF16(JSON.stringify(lineStorageRef.current));
        socketRef.current.emit('update-canvas', userObj.current.roomId, currToken, compressed);
    }

    const handleMouseDown = (e) => {
        e.preventDefault();
        if (userObj.current.canDraw) {
            drawingRef.current = true;
            prevRef.current = { x: e.nativeEvent.offsetX * scaleXRef.current, y: e.nativeEvent.offsetY * scaleYRef.current};
        }
    };

    const handleMouseMove = (e) => {
        if (!drawingRef.current || highlightFlag || lineFlag) return; //only draw line from point a to b if highlighting, otherwise, draw wherever mouse is
        newRef.current = { x: e.nativeEvent.offsetX * scaleXRef.current, y: e.nativeEvent.offsetY * scaleYRef.current};
        drawLine(prevRef.current, newRef.current, penInfoRef.current.color, penInfoRef.current.size, ctxRef.current.lineJoin, ctxRef.current.lineCap, ctxRef.current.globalAlpha, ctxRef.current, true); // local drawing
        prevRef.current = newRef.current;
    };

    const handleMouseUp = (e) => {
        e.preventDefault();
        drawingRef.current = false;

        if (highlightFlag || lineFlag) {
            let lineScale = highlightFlag ? 10 : 1; //10 times size if highlight, regular if line tool
            newRef.current = { x: e.nativeEvent.offsetX * scaleXRef.current, y: e.nativeEvent.offsetY * scaleYRef.current};
            drawLine(prevRef.current, newRef.current, penInfoRef.current.color, penInfoRef.current.size * lineScale, ctxRef.current.lineJoin, ctxRef.current.lineCap, ctxRef.current.globalAlpha, ctxRef.current, true);
            prevRef.current = newRef.current;
        }

        lineStorageRef.current.push(currentLineRef.current);
        if (strokeCount.current - lastStrokeCount.current >= 10) {
            storeCompressedCanvas();
            lastStrokeCount.current = strokeCount.current;
        }
        currentLineRef.current = [];
    };

    const drawLine = (from, to, color, size, join, cap, alpha, ctx, transmit) => {
        if (!ctx) return;
        ctx.strokeStyle = color; //penInfoRef.current.color;
        ctx.lineWidth = size; //penInfoRef.current.size;
        ctx.lineJoin = join;
        ctx.lineCap = cap;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        const strokeInfo = {prev: from, new: to, color: color, size: size, join: join, cap: cap, alpha: alpha};

        if (transmit) {
            currentLineRef.current.push(strokeInfo);
            sendingLineRef.current.push(strokeInfo);
            strokeCount.current += 1;
        }
    };

    const drawEach = (list) => {
        list.forEach(line => line.forEach(path => {
            drawLine(path.prev, path.new, path.color, path.size, path.join, path.cap, path.alpha, ctxRef.current, false);
        }));
    }

    const drawFromServer = () => {
        const roomToken = sessionStorage.getItem('roomToken');
        const canvases = roomCanvasesRef.current;
        let decompressed;
        clearCanvas();
        canvases.forEach((compressed, key) => {
            decompressed = JSON.parse(decompressFromUTF16(compressed));
            lineStorageRef.current = (roomToken === key ? decompressed : lineStorageRef.current);
            drawEach(decompressed);
        });
    }

    const redrawCanvas = () => {
        clearCanvas();
        lineStorageRef.current.forEach(line => line.forEach(path => {
            drawLine(path.prev, path.new, path.color, path.size, path.join, path.cap, path.alpha, ctxRef.current, false);
            //currentLineRef.current = []; <- i don't think i need it but ill keep it here in case i do
        }));
        externalLineStorageRef.current.forEach(line => line.forEach(path => {
            drawLine(path.prev, path.new, path.color, path.size, path.join, path.cap, path.alpha, ctxRef.current, false);
        }));
        drawFromServer();
    }

    //AI function, keep an eye on this one
    const clearCanvas = () => {
        if (!ctxRef.current || !canvasRef.current) return;
            ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };
    return (
        <div id='canvas-container'>
            <div id='background-layer' ref={backgroundRef} 
                style={{
                    background: `${canvasBackground === '' ? 'black' : canvasBackground} center / ${canvasZoom}% no-repeat`,
                    overflow: `hidden`,
                }}
            >
                <canvas ref={canvasRef} 
                    id='canvas-window'
                    onMouseMove={handleMouseMove}
                    onMouseDown={handleMouseDown} 
                    onMouseUp={handleMouseUp}>
                </canvas>
                <NoteArea/>
                {backgroundSelectFlag ? <BackgroundBox isVisible={true}/> : ''}
            </div>
            
        </div>
    )
}

export default Canvas