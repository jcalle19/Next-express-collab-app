'use client'
import React from 'react'
import {useState, useEffect, useRef} from 'react'
import { useRouter } from 'next/navigation';
import { useRefContext } from '@/contexts/refContext.jsx'
import { useSocketContext } from '@/contexts/socketContext.jsx'
import { Work_Sans } from 'next/font/google'
import Icon from '@/components/icon.jsx'
import * as THREE from 'three'; // Import Three.js
import '@/css/homecomps.css'

const font = Work_Sans({
        subsets: ['latin'],
        fallback: ["system-ui", "Arial", "sans-serif"],
    });

const RoomForm = () => {
    const vantaRef = useRef(null);
    const vantaEffectRef = useRef(null);

    const { createRoom, joinRoom, leaveRoom } = useSocketContext();
    const { userObj, roomButtonsActive } = useRefContext();
    const [nameInput, updateUsername] = useState('');
    const [joinNameInput, updateJoinUsername] = useState('');
    const [searchCode, updateSearchCode] = useState('');

    useEffect(() => {
        if (!vantaRef.current || vantaEffectRef.current) return

        let destroyed = false

        import('vanta/dist/vanta.halo.min').then((VANTA) => {
            if (destroyed) return

            vantaEffectRef.current = VANTA.default({
                el: vantaRef.current,
                THREE,

                mouseControls: false,
                touchControls: false,
                gyroControls: false,

                baseColor: 0x0,
                backgroundColor: 0x0,

                amplitudeFactor: 0,
                size: 1.0,
            })
        })

        return () => {
            destroyed = true
            if (vantaEffectRef.current) {
                vantaEffectRef.current.destroy()
                vantaEffectRef.current = null
            }
        }
    }, [])

    useEffect(() => {
        const handleResize = () => {
            if (vantaEffectRef.current?.resize) {
                vantaEffectRef.current.resize();
            }
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [])


    useEffect(()=>{
        roomButtonsActive.current = true;
        if (userObj.current.roomId) leaveRoom();
    },[]);
    
    //Add user to room map in socket_handler.js
    const handleJoin = (e) => {
        e.preventDefault();
        if (joinNameInput === '' || searchCode === '') {
                alert('Name and room id are both required');
                return;
        }
        else if (!roomButtonsActive.current) return;
        roomButtonsActive.current = false;
        userObj.current.user = nameInput;
        joinRoom(searchCode);
    };

    const handleCreate = (e) => {
        e.preventDefault();
        if (nameInput === '') {
            alert('You must enter your username');
            return;
        }
        else if (!roomButtonsActive.current) return;
        roomButtonsActive.current = false;
        userObj.current.user = nameInput;
        createRoom();
    }

    return (
        <div ref={vantaRef} className={`home-form-container`}>
            <section id='home-title-section'>
                <div id='site-title'>Rec Room</div>
                <div id='site-description'>Collaborative canvas and chat application</div>
            </section>
            <div id='form-container' className={`${font.className}`}>
                <form className='grid grid-rows-[4fr_5fr] gap-2'>
                    <div id='room-create-section' className='grid grid-auto-rows-min row-start-1'>
                        <div className='section-header'>Create a room</div>
                        <div className='grid grid-auto-rows-min'>
                            <div className='input-title'>Enter Name:</div>
                            <input
                                type="text"
                                placeholder="Username"
                                value={nameInput}
                                onChange={(e)=>updateUsername(e.target.value)}
                            />
                        </div>
                        <button onClick={handleCreate} className="enter-btn">
                            Create Room
                        </button>
                    </div>
                    <div id='room-join-section' className='grid grid-auto-rows-min row-start-2'>
                        <div className='section-header'>Join a room</div>
                        <div className='grid grid-auto-rows-min'>
                            <div className='input-title'>Enter Name:</div>
                            <input
                                type="text"
                                placeholder="Username"
                                value={joinNameInput}
                                onChange={(e)=>updateJoinUsername(e.target.value)}
                            />
                            <div className='input-title'>Enter room code:</div>
                            <input 
                                type="text" 
                                placeholder="123456"
                                value={searchCode}
                                onChange={(e)=>updateSearchCode(e.target.value)}
                            />
                        </div>
                        <button onClick={handleJoin} className="enter-btn">
                            Join Room
                        </button>
                    </div>
                </form>
                <div id='instruction-section'>
                    <p>To host a new room or join with a code: </p>
                    <ol className='list-decimal pl-7'>
                        <li>Enter your username</li>
                        <li>If joining a room, enter the code</li>
                        <li>Confirm info</li>
                        <li>Make masterpieces with your friends {':)'}</li>
                    </ol>
                </div>
            </div>
            <section id='footer'>
                <div id='home-link-container' className='grid grid-cols-4'>
                    <div className='col-start-1 home-link'>
                        <a href={'https://github.com/jcalle19/Next-express-collab-app'}><Icon src={'/toolbar-icons/github.svg'} width={'75%'} height={'75%'}/></a>
                    </div>
                    <div className='col-start-2 home-link'>
                        <a href={'https://www.linkedin.com/in/jacob-allen-b4737a299/'}><Icon src={'/toolbar-icons/linkedin.svg'} width={'45%'} height={'45%'}/></a>
                    </div>
                    <div id='email-link' className='col-start-3 home-link'>
                        <a href={'mailto:jallenn0622@gmail.com'}><Icon src={'/toolbar-icons/email.svg'} width={'70%'} height={'70%'}/></a>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default RoomForm