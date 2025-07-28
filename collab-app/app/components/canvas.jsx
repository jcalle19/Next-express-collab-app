import { useState, useEffect, useRef } from 'react'
import { useStateContext } from '../contexts/userState.jsx'

const Canvas = () => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const prevRef = useRef(null);
    const newRef = useRef(null);
    const drawingRef = useRef(false);
    const lineStorageRef = useRef([]);
    const removedLineRef = useRef([]);
    const currentLineRef = useRef([]);
    const scaleXRef = useRef(1);
    const scaleYRef = useRef(1);
    const [windowSizeX, changeWindowSize] = useState(0);
    const highLightFactors = {sizeFactor : 10, opacityFactor : .5};
    const { undoFlag, redoFlag, lineFlag, highlightFlag, clearFlag, penInfoRef } = useStateContext();

    useEffect(()=>{
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = 1000;
        canvas.height = 1000;
        ctxRef.current = canvas.getContext('2d');
        changeWindowSize(window.innerWidth);
        window.addEventListener('resize', windowResize);
    }, []);

    useEffect(()=>{
        const canvas = canvasRef.current;
        ctxRef.current = canvas.getContext('2d');
        ctxRef.current.lineCap = 'round';
        ctxRef.current.lineJoin = 'round';
        canvas.style.width = `${windowSizeX * (8.5 / 11) * .70}px`;
        canvas.style.height = `${windowSizeX * .70}px`;
        scaleXRef.current = canvas.width / canvas.clientWidth;
        scaleYRef.current = canvas.height / canvas.clientHeight;
        penInfoRef.current.scale = canvas.clientHeight / canvas.height;
    },[windowSizeX]);

    /*----- Menu Button Effects -----*/
    useEffect(()=> {
        let last = lineStorageRef.current.pop();
        
        if (last) {
            removedLineRef.current.push(last);
            console.log(`LS: ${lineStorageRef.current.length} RS:${removedLineRef.current.length}`);
            redrawCanvas();
        }
    },[undoFlag]);

    useEffect (()=> {
        let last = removedLineRef.current.pop();
        if (last) {
            lineStorageRef.current.push(last);
            console.log(`LS: ${lineStorageRef.current.length} RS:${removedLineRef.current.length}`);
            redrawCanvas();
        }
    },[redoFlag]);

    useEffect (() => {
        ctxRef.current.globalAlpha *= highlightFlag ? highLightFactors.opacityFactor :  1 / highLightFactors.opacityFactor;
        ctxRef.current.lineJoin = highlightFlag ? 'butt' : 'round';
        ctxRef.current.lineCap = highlightFlag ? 'butt' : 'round';
    },[highlightFlag]);

    useEffect (()=> {
        lineStorageRef.current.map((line) => {removedLineRef.current.push(line)});
        clearCanvas();
    },[clearFlag]);

    /*-------------------------------*/

    const windowResize = () => {
        changeWindowSize(window.innerWidth);
    }

    const handleMouseDown = (e) => {
        e.preventDefault();
        drawingRef.current = true;
        prevRef.current = { x: e.nativeEvent.offsetX * scaleXRef.current, y: e.nativeEvent.offsetY * scaleYRef.current};
    };

    const handleMouseMove = (e) => {
        if (!drawingRef.current || highlightFlag || lineFlag) return; //only draw line from point a to b if highlighting, otherwise, draw wherever mouse is
        newRef.current = { x: e.nativeEvent.offsetX * scaleXRef.current, y: e.nativeEvent.offsetY * scaleYRef.current};
        drawLine(prevRef.current, newRef.current, penInfoRef.current.color, penInfoRef.current.size, ctxRef.current.lineJoin, ctxRef.current.lineCap, ctxRef.current.globalAlpha, ctxRef.current); // local drawing
        //socket.emit('draw-line', { from: prevPos, to: newPos }); // send to others
        prevRef.current = newRef.current;
    };

    const handleMouseUp = (e) => {
        e.preventDefault();
        drawingRef.current = false;

        if (highlightFlag || lineFlag) {
            let lineScale = highlightFlag ? 10 : 1; //10 times size if highlight, regular if line tool
            newRef.current = { x: e.nativeEvent.offsetX * scaleXRef.current, y: e.nativeEvent.offsetY * scaleYRef.current};
            drawLine(prevRef.current, newRef.current, penInfoRef.current.color, penInfoRef.current.size * lineScale, ctxRef.current.lineJoin, ctxRef.current.lineCap, ctxRef.current.globalAlpha, ctxRef.current);
            prevRef.current = newRef.current;
        }

        lineStorageRef.current.push(currentLineRef.current);
        console.log(lineStorageRef.current.length);
        currentLineRef.current = [];
    };

    const drawLine = (from, to, color, size, join, cap, alpha, ctx) => {
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
        currentLineRef.current.push({prev: from, new: to, color: color, size: size, join: join, cap: cap, alpha: alpha});
    };

    const redrawCanvas = () => {
        clearCanvas();
        console.log(`redraw LS: ${lineStorageRef.current.length} RS:${removedLineRef.current.length}`);
        lineStorageRef.current.forEach(line => line.forEach(path => {
            drawLine(path.prev, path.new, path.color, path.size, path.join, path.cap, path.alpha, ctxRef.current);
            currentLineRef.current = [];
        }));
    }

    //AI function, keep an eye on this one
    const clearCanvas = () => {
        if (!ctxRef.current || !canvasRef.current) return;
            ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    return (
        <canvas ref={canvasRef} style={{width: `${8.5 / 11 * 70}vw`, height: '70vw',}}id='canvas-window' onMouseMove={handleMouseMove} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}></canvas>
    )
}

export default Canvas