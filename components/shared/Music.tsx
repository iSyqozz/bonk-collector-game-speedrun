'use client'

import React, { useEffect, useRef, useState } from 'react'

const Music = () => {

    const [AudioPlaying, setAudioPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);


    //play or pause audio
    useEffect(() => {
        const audio = audioRef.current;

        const onAudioEnd = () => {
            audio!.currentTime = 0;
            audio!.play().then(() => { }).catch((err) => console.error(err));
        };

        if (audio) {
            if (AudioPlaying) {
                audio!.play().then(() => { }).catch((err) => console.error(err));
                audio!.addEventListener('ended', onAudioEnd);
            } else {
                audio!.pause();
            }
        }
        return () => {
            audio!.removeEventListener('ended', onAudioEnd);
        }

    }, [AudioPlaying])

    return (
        <div className='z-30 fixed w-[90%] max-w-6xl top-24 left-[50%] translate-x-[-50%] flex items-center justify-start  ' >
            <div
                onClick={() => {
                    setAudioPlaying(prev => !prev);
                }}
                className=' opacity-60 ml-3 relative rounded-full hover:scale-105 active:hover:scale-95 hover:bg-white bg-white bg-opacity-10 hover:bg-opacity-30 p-1 transition-all cursor-pointer'>
                <img src="/icons/audio.png" alt="audio" width={24} height={24} />
                {AudioPlaying || (
                    <svg
                        className='abs-center'
                        width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                        <line x1="1" y1="1" x2="17" y2="17" stroke="red" strokeWidth="2" />
                        <line x1="17" y1="1" x2="1" y2="17" stroke="red" strokeWidth="2" />
                    </svg>
                )}
            </div>
            <audio ref={audioRef} src='/assets/audio/bg-music.mp3' />
        </div>
    )
}

export default Music