import React from 'react'
import '@/styles/particles.css'

export const ParticlesBg = () => {
    return (
        <div className="space overflow-hidden w-full h-full fixed bg-transparent z-[-1]">
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
        </div>
    )
}
