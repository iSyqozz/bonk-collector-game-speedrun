'use client'
import { useState, useEffect } from "react"
const SepBar = ({width}:{width:number}) => {
    const [isvisible, setisvisible] = useState(false)
    useEffect(() => {
        setTimeout(() => {
            setisvisible(true)
        }, 1300);
    }, [])
    return (
        <div
            style={{
                width: isvisible ? width+'%' : '0'
            }}
            className="h-[2px] mt-6 ease-in-out duration-700 rounded-3xl bg-white bg-opacity-25 transition-all max-w-6xl mx-auto"></div>
    )
}
export default SepBar