import { useState, useEffect, useRef } from 'react'
import { useStateContext } from '../contexts/userState.jsx'

const Canvas = () => {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const prevRef = useRef(null);
    const newRef = useRef(null);
    const drawingRef = useRef(false);
    const sizeRef = useRef({x: 0, y: 0});
    const { userObj, socketRef, roomUsers} = useStateContext();

    useEffect(()=>{
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        sizeRef.current.x = rect.left;
        sizeRef.current.y = rect.top;
        ctxRef.current = canvas.getContext('2d');

        canvas.style.height = `${Math.floor(rect.height)}px`;
        canvas.style.width = `${Math.floor(rect.width)}px`;
        console.log("CSS size:", canvas.getBoundingClientRect());
        console.log("Internal size:", canvas.width, canvas.height);
    }, []);

    const handleMouseDown = (e) => {
        e.preventDefault();
        drawingRef.current = true;
        prevRef.current = { x: e.clientX - sizeRef.current.x, y: e.clientY - sizeRef.current.y };
    };

    const handleMouseMove = (e) => {
        if (!drawingRef.current) return;
        newRef.current = { x: e.clientX - sizeRef.current.x, y: e.clientY - sizeRef.current.y };
        drawLine(prevRef.current, newRef.current, ctxRef.current); // local drawing
        //socket.emit('draw-line', { from: prevPos, to: newPos }); // send to others
        prevRef.current = newRef.current;
    };

    const handleMouseUp = (e) => {
        e.preventDefault();
        drawingRef.current = false;
    };

    const drawLine = (from, to, ctx) => {
        if (!ctx) return;
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
    };

    return (
        <canvas ref={canvasRef} style={{width: '100%', height: '100%',}}id='canvas-window' onMouseMove={handleMouseMove} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}></canvas>
    )
}

export default Canvas