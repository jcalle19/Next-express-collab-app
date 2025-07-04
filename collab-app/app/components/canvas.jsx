import { useState, useEffect, useRef } from 'react'
import { useStateContext } from '../contexts/userState.jsx'

const Canvas = () => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const prevRef = useRef(null);
    const newRef = useRef(null);
    const drawingRef = useRef(false);
    const lineStorageRef = useRef([]);
    const currentLineRef = useRef([]);
    const scaleXRef = useRef(1);
    const scaleYRef = useRef(1);
    const [windowSizeX, changeWindowSize] = useState(0);
    const { userObj, socketRef, roomUsers} = useStateContext();

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
    },[windowSizeX]);

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
        console.log(currentLineRef.current);
        currentLineRef.current = [];
    };

    const drawLine = (from, to, ctx) => {
        if (!ctx) return;
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
        currentLineRef.current.push({prev: from, new: to});
    };

    const redrawCanvas = () => {
        lineStorageRef.foreach(line => line.foreach(path => drawLine(path.prev, path.new, ctxRef.current)));
    }

    return (
        <canvas ref={canvasRef} style={{width: `${8.5 / 11 * 70}vw`, height: '70vw',}}id='canvas-window' onMouseMove={handleMouseMove} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}></canvas>
    )
}

export default Canvas