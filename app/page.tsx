
'use client'
import { useEffect, useRef, useState } from "react"
import Dim from "@/components/shared/Dim";
import Ledger from "@/components/shared/Ledger";
import { signOut, useSession } from "next-auth/react";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton, useWalletModal } from "@solana/wallet-adapter-react-ui";
import { handleSignIn } from "@/utils/client/auth";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/shared/Hero";
import SepBar from "@/components/shared/SepBar";
import Address from "@/components/shared/Address";
import { createNewGameTx, getHighscore, getSoarProgramInstance, getUserTokenSupply, hydrateTransaction, send_transactions } from "@/utils/shared";
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


  const [CurrentScore, setCurrentScore] = useState(0);
  const [userBonkBalance, setuserBonkBalance] = useState(0);
  const [userSolBalance, setuserSolBalance] = useState(0);

  const [gameAddress, setgameAddress] = useState('');


  const [highScore, sethighScore] = useState(0);
  useEffect(() => {
    const highScore = getHighscore();
    sethighScore(highScore)
  }, []);


  const [newGameStarted, setnewGameStarted] = useState(false)

  useEffect(() => {
    const fetchBalances = async () => {
      if (!anchorWalletObj || !anchorWalletObj?.publicKey) { return }
      const devnetConnection = new Connection(process.env.NEXT_PUBLIC_DEVNET_RPC_URL as string);
      const mainnetConnection = new Connection(process.env.NEXT_PUBLIC_RPC_URL as string);
      const bonkBalance = await getUserTokenSupply(new PublicKey('BoNKzMN1E9jeBd3LzXJ9hnDb3B1FMwqL4ffyanYD6vo'), anchorWalletObj!.publicKey, devnetConnection);
      const solBalance = await mainnetConnection.getBalance(anchorWalletObj.publicKey, { commitment: 'confirmed' });
      setuserBonkBalance(bonkBalance);
      setuserSolBalance(parseFloat((solBalance / LAMPORTS_PER_SOL).toFixed(2)));
    }

    fetchBalances();
  }, [anchorWalletObj, anchorWalletObj?.publicKey])


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
    <>
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
            <div className="w-full">

              <div className="w-[90%] max-w-6xl mx-auto flex justify-end items-start max-sm:flex-col-reverse max-sm:items-end max-sm:gap-4">
                <div onClick={() => { disconnect(); signOut({ redirect: false }) }}
                  className=" text-center w-[110px] sm:w-[130px] bg-slate-500 bg-opacity-50 shadow-lg shadow-dark  text-opacity-60 rounded py-1 text-sm sm:text-lg hover:scale-[1.02] active:scale-[.98] cursor-pointer duration-300 transition-all">
                  Disconnect
                </div>
              </div>
              <SepBar width={90} />
              <Address userBalance={userSolBalance} bonkBalance={userBonkBalance} owner={owner} ></Address>


              {/**game section */}
              <div className="w-full flex items-center justify-center">
                {!newGameStarted ? (
                  <div onClick={async () => {
                    setShouldDim(true);
                    if (!anchorWalletObj) { return }
                    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL as string);
                    const soarInstance = await getSoarProgramInstance(anchorWalletObj!);
                    const temp = await createNewGameTx(anchorWalletObj.publicKey, soarInstance);

                    await hydrateTransaction(temp.transaction, connection, anchorWalletObj.publicKey);
                    const signedTransaction = await anchorWalletObj.signTransaction(temp.transaction);

                    const res = await send_transactions([signedTransaction], connection);

                    if (res[0] == 'failed') {
                      console.log('failed')
                    } else {
                      console.log('success');
                      setgameAddress(temp.newGame.toBase58());
                      setnewGameStarted(true);
                    }

                    console.log(soarInstance);
                  }}
                    className=" text-center p-3 my-20 bg-slate-500 bg-opacity-50 shadow-lg shadow-dark  text-opacity-60 rounded py-1 text-sm sm:text-lg hover:scale-[1.02] active:scale-[.98] cursor-pointer duration-300 transition-all">
                    Start New Game
                  </div>
                ) : (
                  <div onClick={() => { disconnect(); signOut({ redirect: false }) }}
                    className=" text-center p-3 my-20 bg-slate-500 bg-opacity-50 shadow-lg shadow-dark  text-opacity-60 rounded py-1 text-sm sm:text-lg hover:scale-[1.02] active:scale-[.98] cursor-pointer duration-300 transition-all">
                    Start New Game
                  </div>
                )}
              </div>


              {/**highscore */}
              <div className="w-full items-center justify-center flex flex-col gap-2">
                <div className="text-4xl max-sm:text-xl text-white">High Score</div>
                <div className="text-4xl max-sm:text-xl text-opacity-50">{highScore}</div>
              </div>

              {/**LeaderBoards */}
              <div className="my-16 w-full items-center justify-center flex flex-col">
                
                
              <div className="text-4xl mt-8 max-sm:text-xl text-white">LeaderBoards</div>

                <div className="mt-8 p-2 max-sm:w-[300px] overflow-y-auto bg-slate-600 bg-opacity-30 rounded-lg transition-all duration-200 border border-white sm:w-[500px] h-[800px] grid grid-cols-2">
                  <div className="text-lg text-white text-center mb-auto">Address</div>
                  <div className="text-lg text-white text-center mb-auto">Score</div>

                </div>
              </div>


            </div>
          )}
        </div>
      </div>
      {ShouldDim && <Dim />}
    </>
  )
}

export default Home