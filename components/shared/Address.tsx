'use client'
import { useState, useEffect } from "react"
import Image from "next/image"

interface AddressProps {
    owner: string,
    userBalance: number,
    bonkBalance: number,
    toggleUsingLedger: () => void,
    usingLedger: boolean
}

const Address = ({ owner, userBalance, bonkBalance, usingLedger, toggleUsingLedger }: AddressProps) => {
    const [ShouldShow, setShouldShow] = useState(false)

    useEffect(() => {
        setTimeout(() => {
            setShouldShow(true);
        }, 1600);
    }, [])
    return (

        <div
            style={{ opacity: ShouldShow ? '1' : '0' }}
            className="w-[90%] mx-auto max-w-6xl flex mt-2 items-start justify-between max-sm:justify-between">

            {/** ledger part */}
            <div className="flex items-center justify-center">
                <span className="text-white mr-2">Ledger <span className=" font-sans">?</span></span>
                <div
                    className={`shadow-lg  w-[72px] h-6 ${usingLedger ? 'bg-primary brightness-[2] ' : ' bg-secondary '} rounded-full p-1 cursor-pointer ${usingLedger ? 'justify-end' : 'justify-start'
                        }`}
                    onClick={toggleUsingLedger}
                >
                    <div
                        className={`w-4 h-4 ${usingLedger ? ' bg-secondary' : ' bg-primary brightness-[2]  '} rounded-full transform ${usingLedger ? 'translate-x-12' : ''
                            } transition-transform duration-300`}
                    ></div>
                </div>
            </div>


            {/** address and balances part */}
            <div className="flex flex-col items-end justify-end">
                <div
                    onClick={() => navigator.clipboard.writeText(owner)}
                    className="cursor-pointer active:scale-[.97] transition-all flex group items-center justify-center gap-1">
                    <div
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
                    className=" max-sm:hidden">
                    <div style={{ opacity: ShouldShow ? '1' : '0' }}
                        className="mt-2 transition-all duration-500 text-sm text-white text-opacity-50 group-hover:text-opacity-75">{userBalance + " SOL"}
                    </div>

                </div>

                <div
                    className=" max-sm:hidden">
                    <div style={{ opacity: ShouldShow ? '1' : '0' }}
                        className="transition-all duration-500 text-sm text-white text-opacity-50 group-hover:text-opacity-75">{bonkBalance + " BONK"}
                    </div>

                </div>
            </div>


        </div>






    )
}

export default Address