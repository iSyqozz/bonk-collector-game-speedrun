
'use client'
import { FormEvent, useEffect, useRef, useState } from "react"
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
import { createNewGameTx, generate_transactions, getHighscore, getSoarProgramInstance, getUserTokenSupply, hydrateTransaction, send_transactions } from "@/utils/shared";
import { SoarProgram, GameType, Genre, GameClient } from "@magicblock-labs/soar-sdk";
import { leaderBoardsPubKey, gamePubKey } from "@/constants"
import { toast } from "react-toastify";


interface leaderBoardEntry {
  address: PublicKey,
  name: string,
  score: number,
}



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

  const [userPlayerAccount, setuserPlayerAccount] = useState<false | true>(false);
  const [userGameEnlistAccount, setuserGameEnlistAccount] = useState<false | true>(false);
  const [playerName, setplayerName] = useState('');

  const [createUserText, setcreateUserText] = useState('');

  const [highScore, sethighScore] = useState(0);
  useEffect(() => {
    const highScore = getHighscore();
    sethighScore(highScore)
  }, []);


  const [newGameStarted, setnewGameStarted] = useState(false);
  const [leaderboardEntries, setleaderboardEntries] = useState<leaderBoardEntry[]>([]);


  useEffect(() => {

    const fetchLeaderBoard = async () => {
      if (!anchorWalletObj || !anchorWalletObj?.publicKey) { return }

      const client = await getSoarProgramInstance(anchorWalletObj);
      const game = new GameClient(client, new PublicKey(gamePubKey));
      await game.init();

      const account = await client.fetchLeaderBoardAccount(new PublicKey('3Hzgbkx4D2APr4QUUAsJvDb4zzCZb5MU8XdVCaDMcSuj'));
      //console.log(account.address);
      const topEntries = await client.fetchLeaderBoardTopEntriesAccount(account.topEntries!);



      let finalRes: leaderBoardEntry[] = []

      for (let entry of topEntries.topScores) {

        if (finalRes.length == 10) { break };
        if (entry.player.toBase58() != '11111111111111111111111111111111') {
          finalRes.push({ address: entry.player, name: 'Anon', score: entry.entry.score.toNumber() })
        };
      }


      for (let i = 0; i < finalRes.length; i++) {
        const playerEntry = finalRes[i];
        const data = await client.fetchPlayerAccount(playerEntry.address);
        playerEntry.name = data.username;
        playerEntry.address = data.user;
      }
      setleaderboardEntries(finalRes.sort((a, b) => b.score - a.score));
    }


    fetchLeaderBoard()
  }, [anchorWalletObj, anchorWalletObj?.publicKey])



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



    const getUserRegistryAccounts = async () => {
      if (!anchorWalletObj || !anchorWalletObj?.publicKey) { return }

      const client = await getSoarProgramInstance(anchorWalletObj);
      const game = new GameClient(client, new PublicKey(gamePubKey));
      await game.init();


      const playerData = await client.fetchPlayerAccount(client.utils.derivePlayerAddress(anchorWalletObj.publicKey)[0]).catch(e => undefined)
      const playerListData = await client.fetchPlayerScoresListAccount(client.utils.derivePlayerScoresListAddress(anchorWalletObj.publicKey, new PublicKey(leaderBoardsPubKey))[0]).catch(e => undefined);

      if (playerData) { setplayerName(playerData.username); }

      setuserGameEnlistAccount(playerListData !== undefined);
      setuserPlayerAccount(playerData !== undefined);
    }

    getUserRegistryAccounts()
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
  }, []);




  //loading game
  useEffect(() => {

    // Game metadata
    const APP_NAME = "BONK Collecter";
    const APP_VERSION = "1.0.0";
    const APP_AUTHOR = "Turbo";
    const APP_DESCRIPTION = "Collect the BONK before you bite the death coin! Death is temporary! Play again and again!";
    const WASM_SRC = "./my_game.wasm"
    const RESOLUTION = [144, 256];

    const SPRITES = [
      "/sprites/heart.png",
      "/sprites/munch_dog.png",
      "/sprites/munch_cat.png",
      "/sprites/pepe.png",
    ];
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
              <Address
                usingLedger={usingLedger}
                toggleUsingLedger={toggleUsingLedger}
                userBalance={userSolBalance}
                bonkBalance={userBonkBalance}
                owner={owner}
              ></Address>


              {/**game section */}
              <div className="mt-12 w-full flex items-center justify-center">

                {(!userPlayerAccount || !userPlayerAccount) && (
                  <div className=" flex flex-col items-center justify-center gap-6">
                    <div className="text-3xl max-sm:text-xl text-white text-opacity-80">Create Your Account</div>

                    <form className="flex flex-col items-center justify-center gap-2" onSubmit={async (e: FormEvent) => {
                      try {

                        e.preventDefault();
                        setShouldDim(true);
                        if (!anchorWalletObj) { return }


                        const res = await fetch('/api/transactions/register', {
                          method: 'POST',
                          cache: 'no-store',
                          body: JSON.stringify({
                            isPlayer: userPlayerAccount,
                            isListed: userGameEnlistAccount,
                            username: createUserText,
                          })
                        }).then(e => e.json());
                        if (res == 'failed') {
                          toast('Registeration Failed', {
                            type: 'error',
                            className: 'toast-message',
                          })
                          return;
                        }

                        const tx = generate_transactions([res])[0];

                        const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL as string);
                        const signedTx = await anchorWalletObj.signTransaction(tx);
                        const sig = await send_transactions([signedTx], connection);

                        if (sig[0] != 'failed') {
                          toast('Registeration Successful', {
                            type: 'success',
                            className: 'toast-message',
                          })
                          setuserGameEnlistAccount(true);
                          setplayerName(createUserText);
                          setuserPlayerAccount(true);
                        } else {
                          toast('Registeration Failed', {
                            type: 'error',
                            className: 'toast-message',
                          })
                        }
                        setShouldDim(false);
                      } catch (e) {
                        console.log(e)
                        toast('Registeration Failed', {
                          type: 'error',
                          className: 'toast-message',
                        })
                        setShouldDim(false)
                      }
                    }}>
                      <label htmlFor="" className="text-white text-opacity-50 text-sm">Username:</label>
                      <input
                        className="rounded-lg p-2 text-center max-sm:text-[11px] max-sm:h-[25px] max-sm:w-[150px] text-sm text-black text-opacity-50 bg-white bg-opacity-50"
                        type="text"
                        name='name'
                        value={createUserText}
                        onChange={(e) => { setcreateUserText(e.target.value.substring(0, 8)) }}
                        required
                      />
                      <button
                        type="submit"
                        className="bg-slate-500 mt-4 bg-opacity-50 shadow-lg shadow-dark  w-[110px] sm:w-[130px] text-opacity-60 text-center rounded py-1 text-sm sm:text-lg hover:scale-[1.02] active:scale-[.98] cursor-pointer duration-300 transition-all">
                        Register
                      </button>
                    </form>


                  </div>
                )}


                {false && (
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
                    } else {
                      setnewGameStarted(true);
                    }

                  }}
                    className=" text-center p-3 my-20 bg-slate-500 bg-opacity-50 shadow-lg shadow-dark  text-opacity-60 rounded py-1 text-sm sm:text-lg hover:scale-[1.02] active:scale-[.98] cursor-pointer duration-300 transition-all">
                    Start New Game
                  </div>
                )}
              </div>


              {/**highscore */}
              {(userGameEnlistAccount && userPlayerAccount) && (
                <div className="w-full items-center mt-24 justify-center flex flex-col gap-2">
                  <div className="text-4xl max-sm:text-xl text-white">High Score</div>
                  <div className="text-4xl max-sm:text-xl text-opacity-50">{highScore}</div>
                </div>
              )}

              {/**LeaderBoards */}
              <div className="my-16 w-full items-center justify-center flex flex-col">
                <div className="text-4xl mt-8 max-sm:text-xl text-white">LeaderBoards</div>
                <div className="mt-8 p-2 max-sm:w-[300px] overflow-y-auto bg-slate-600 bg-opacity-30 rounded-lg transition-all duration-200 border border-white sm:w-[500px] h-[800px] grid grid-cols-2 place-content-start ">
                  <div className="text-lg text-white text-center mb-auto">Address</div>
                  <div className="text-lg text-white text-center mb-auto">Score</div>
                  <SepBar width={95}></SepBar>
                  <SepBar width={95}></SepBar>
                  {leaderboardEntries.map((e, _) => (
                    <>
                      <div key={e.address.toBase58()} className="truncate mx-auto text-lg my-4">{(_ + 1) + '.         '} <span className="ml-2">{e.name}</span> </div>
                      <div key={e.address.toBase58()} className="truncate mx-auto text-lg my-4">{e.score.toString().substring(0, 10)} </div>
                    </>
                  ))}
                  <div></div>
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