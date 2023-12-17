'use client'
import { useState, useEffect } from "react"
import Image from "next/image"

interface AddressProps {
    owner: string,
    userBalance: number,
    bonkBalance: number,
}

const Address = ({ owner, userBalance, bonkBalance }: AddressProps) => {
    const [ShouldShow, setShouldShow] = useState(false)

    useEffect(() => {
        setTimeout(() => {
            setShouldShow(true);
        }, 1600);
    }, [])
    return (
        <div className="w-[90%] mx-auto max-w-6xl flex flex-col items-end mt-2 justify-end">
            <div
                onClick={() => navigator.clipboard.writeText(owner)}
                className="cursor-pointer active:scale-[.97] transition-all flex group items-center justify-center gap-1">
                <div
                    style={{
                        opacity: ShouldShow ? '1' : '0'
                    }}
                    className="transition-all duration-500 text-sm text-variant-4 text-opacity-50 group-hover:text-opacity-75">{owner.substring(0, 6) + '...'}
                </div>
                <Image
                    style={{
                        opacity: ShouldShow ? '1' : '0'
                    }}
                    className="aspect-auto"
                    width={15}
                    height={15}
                    alt="copy"
                    src={'/icons/copy.png'}
                ></Image>
            </div>

            <div
                className="">
                <div style={{opacity: ShouldShow ? '1' : '0'}}
                    className="mt-2 transition-all duration-500 text-sm text-white text-opacity-50 group-hover:text-opacity-75">{ userBalance +" SOL"}
                </div>

            </div>

            <div
                className="">
                <div style={{opacity: ShouldShow ? '1' : '0'}}
                    className="transition-all duration-500 text-sm text-white text-opacity-50 group-hover:text-opacity-75">{ bonkBalance +" BONK"}
                </div>

            </div>
        </div>
    )
}

export default Address