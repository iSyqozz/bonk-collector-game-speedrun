'use client'
import React from 'react'
import { useState, useEffect } from 'react'
const Hero = () => {

    const [ShowTitle, setShowTitle] = useState(false);
    const [ShowSubTitle, setShowSubTitle] = useState(false);

    useEffect(()=>{
        const timer = setTimeout(() => {
            setShowTitle(true);
        }, 100);

        const timer2 = setTimeout(() => {
            setShowSubTitle(true)
        }, 300);

        return ()=>{
            clearTimeout(timer);
            clearTimeout(timer2);
        }
    },[])
  
return (
    <div className='transition-all mt-32 w-full flex flex-col items-center justify-center gap-4'>
        <div
        style={{
            opacity:ShowTitle?'1':'0',
            transform: ShowTitle?'translateY(-50px)':'translate(0px)'
        }}
        className=' duration-500 ease-in-out transition-all  p-2 text-3xl md:text-5xl text-transparent lg:text-7xl bg-clip-text bg-secondary'>
            Bonk Collector
        </div>
        <div
        style={{
            opacity:ShowSubTitle?'0.5':'0',
            transform: ShowSubTitle?'translateY(-50px)':'translate(0px)'
        }}
        className=' duration-700 ease-in-out transition-all p-2 text-sm md:text-lg text-bg-secondary opacity-40 text-center'>💀 Death is Temporary 💙 <br /> Or is it?</div>
    </div>
  )
}

export default Hero