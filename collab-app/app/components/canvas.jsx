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
    const { undoFlag, redoFlag, penInfoRef } = useStateContext();

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
        canvas.style.width = `${windowSizeX * (8.5 / 11) * .70}px`;
        canvas.style.height = `${windowSizeX * .70}px`;
        scaleXRef.current = canvas.width / canvas.clientWidth;
        scaleYRef.current = canvas.height / canvas.clientHeight;
        penInfoRef.current.scale = canvas.clientHeight / canvas.height;
        console.log(penInfoRef.current.scale);
    },[windowSizeX]);

    useEffect(()=> {
        let last = lineStorageRef.current.pop();
        if (last) {
            removedLineRef.current.push(last);
        }
        redrawCanvas();
    },[undoFlag]);

    useEffect (()=> {
        let last = removedLineRef.current.pop();
        if (last) {
            lineStorageRef.current.push(last);
        }
        redrawCanvas();
    },[redoFlag]);

    const windowResize = () => {
        changeWindowSize(window.innerWidth);
    }

    const handleMouseDown = (e) => {
        e.preventDefault();
        drawingRef.current = true;
        prevRef.current = { x: e.nativeEvent.offsetX * scaleXRef.current, y: e.nativeEvent.offsetY * scaleYRef.current};
    };

    const handleMouseMove = (e) => {
        if (!drawingRef.current) return;
        newRef.current = { x: e.nativeEvent.offsetX * scaleXRef.current, y: e.nativeEvent.offsetY * scaleYRef.current};
        drawLine(prevRef.current, newRef.current, ctxRef.current); // local drawing
        //socket.emit('draw-line', { from: prevPos, to: newPos }); // send to others
        prevRef.current = newRef.current;
    };

    const handleMouseUp = (e) => {
        e.preventDefault();
        drawingRef.current = false;
        lineStorageRef.current.push(currentLineRef.current);
        currentLineRef.current = [];
    };

    const drawLine = (from, to, ctx) => {
        if (!ctx) return;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = penInfoRef.current.color;
        ctx.lineWidth = penInfoRef.current.size;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        currentLineRef.current.push({prev: from, new: to});
    };

    const redrawCanvas = () => {
        clearCanvas();
        lineStorageRef.current.forEach(line => line.forEach(path => drawLine(path.prev, path.new, ctxRef.current)));
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