
'use client'
import { useEffect, useRef, useState } from "react"
import Dim from "@/components/shared/Dim";
import Ledger from "@/components/shared/Ledger";
import { signOut, useSession } from "next-auth/react";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton, useWalletModal } from "@solana/wallet-adapter-react-ui";
import { handleSignIn } from "@/utils/client/auth";
import { Connection, PublicKey } from "@solana/web3.js";
import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/shared/Hero";
const Home = () => {

  //wallet and authorization states
  const { publicKey, wallet, disconnect, select, connected, signTransaction, signMessage } = useWallet();
  const owner = publicKey ? publicKey.toBase58() : '';
  const anchorWalletObj = useAnchorWallet();
  const walletModal = useWalletModal();
  const { data: session, status } = useSession();
  const [usingLedger, setUsingLedger] = useState(false);

  const toggleUsingLedger = () => {
    setUsingLedger(!usingLedger);
  };
  useEffect(() => {
    const handleConnect = async () => {
      if (wallet && wallet.readyState === 'NotDetected') {
        disconnect();
        select(null);
      }
    };
    const connectButton = document.getElementById('connect-button');
    if (connectButton) {
      connectButton.addEventListener('click', handleConnect);
    }
    return () => {
      if (connectButton) {
        connectButton.removeEventListener('click', handleConnect);
      }
    };
  }, [wallet]);

  console.log(usingLedger);


  const [CurrentScore, setCurrentScore] = useState(0);
  const [userBonkBalance, setuserBonkBalance] = useState(0);
  const [userSolBalance, setuserSolBalance] = useState(0)


  //content visibility states
  const [ShowContent, setShowContent] = useState(false);
  const [ShouldDim, setShouldDim] = useState(false);
  //content use effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 400);

    return () => {
      clearTimeout(timer);
    }
  }, [])


  return (

    <div className="w-[90%] max-w-6xl mx-auto z-[5]">
      <Hero></Hero>
      <div
        style={{
          opacity: ShowContent ? '1' : '0',
          transform: ShowContent ? 'translateY(0px)' : 'translateY(-30px)'
        }}
        className="my w-full transition-all duration-700">

        {(!session || !connected || owner != session.user?.name) ? (
          <div className=" w-[90%] max-w-6xl mx-auto mb-96 flex flex-col items-center justify-center gap-4">
            <div className="p-2 text-sm sm:text-2xl  text-variant-4">
              Sign In With Your Wallet
            </div>
            {
              owner === '' ? (
                <>
                  <div
                    onClick={() => walletModal.setVisible(true)}
                    className="bg-slate-500 bg-opacity-50 shadow-lg shadow-dark  w-[110px] sm:w-[130px] text-opacity-60 text-center rounded py-1 text-sm sm:text-lg hover:scale-[1.02] active:scale-[.98] cursor-pointer duration-300 transition-all">
                    Connect
                  </div>
                </>
              ) : (
                <>
                  <div onClick={() => {
                    if (status == 'loading') { return }
                    handleSignIn(
                      connected,
                      publicKey!,
                      signMessage!,
                      signTransaction!,
                      owner,
                      walletModal,
                      usingLedger,
                      (e: boolean) => { setShouldDim(e) }
                    )
                  }}
                    className={" text-center w-[110px] sm:w-[130px] bg-slate-500 bg-opacity-50 shadow-lg shadow-dark  text-opacity-60 rounded py-1 text-sm sm:text-lg hover:scale-[1.02] active:scale-[.98] cursor-pointer duration-300 transition-all flex items-center justify-center"}>
                    {status == 'loading' ? (
                      <Image
                        className="animate-spin opacity-70 aspect-auto max-md:w-[18px] max-md:h-[18px]"
                        loading="eager"
                        priority={true}
                        unoptimized
                        width={27}
                        height={27}
                        alt="auth loader"
                        src={'/icons/auth-loader.png'}
                      ></Image>
                    ) : (
                      "Sign In"
                    )}
                  </div>
                  <div onClick={() => {
                    disconnect()
                  }}
                    className=" text-center w-[110px] sm:w-[130px] bg-slate-500 bg-opacity-50 shadow-lg shadow-dark  text-opacity-60 rounded py-1 text-sm sm:text-lg hover:scale-[1.02] active:scale-[.98] cursor-pointer duration-300 transition-all">
                    Disconnect
                  </div>
                </>
              )
            }
            <Ledger toggleUsingLedger={toggleUsingLedger} usingLedger={usingLedger} />
          </div>
        ) : (
          <div>
          </div>
        )}
      </div>
    </div>

  )
}

export default Home