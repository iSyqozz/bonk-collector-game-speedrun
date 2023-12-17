'use client'
import { useState, useEffect } from 'react'
import React from 'react'
import Image from 'next/image'

const Dim = () => {
    const [shouldShow, setshouldShow] = useState(false)
    useEffect(() => {
        setTimeout(() => {
            setshouldShow(true);
        }, 50);
    }, [])

    return (
        <div
            style={{
                opacity: shouldShow ? ('1') : ('0')
            }}
            className=" transition-all duration-500 flex justify-center items-center fixed top-0 left-0 z-[100] bg-black bg-opacity-80 w-full h-full">
            <Image
                className='transition-all animate-pulse'
                src={'/meta/favicon.ico'}
                alt='dim-loader'
                width={100}
                height={100}
                quality={100}
            ></Image>
        </div>
    )
}
export default Dim