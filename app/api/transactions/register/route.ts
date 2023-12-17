import { NextResponse } from "next/server";
import { NextURL } from "next/dist/server/web/next-url";
import { getHeldProjectNfts } from "@/utils/server";
import { Connection, Transaction } from "@solana/web3.js";
import { PublicKey } from "@metaplex-foundation/js";
import { getServerSession } from "next-auth";
import { validateUser } from "@/utils/server";
import base58 from "bs58";
import { Keypair } from "@solana/web3.js";
import { getSoarProgramInstance, hydrateTransaction } from "@/magicblock";
import { GameClient } from "@magicblock-labs/soar-sdk";
import { gamePubKey, leaderBoardsPubKey } from "@/constants";

export function getKeypair(bs58String: string): Keypair {
    const privateKeyObject = base58.decode(bs58String);
    const privateKey = Uint8Array.from(privateKeyObject);
    const keypair = Keypair.fromSecretKey(privateKey);
    return keypair
}


async function POST(req: Request) {
    try {


        const { isValid, address } = await validateUser();
        if (!isValid) {
            return NextResponse.json('Unauthorized');
        }


        const data = await req.json();
        const isPlayer = data.isPlayer;
        const isListed = data.isListed;
        const username = data.username;

        console.log(username, isListed, isPlayer);

        const connection = new Connection(process.env.RPC_URL as string);
        const transaction = new Transaction();
        const auth_key = getKeypair(process.env.GAME_AUTHORITY as string);

        const client = await getSoarProgramInstance(auth_key, connection);
        const game = new GameClient(client, new PublicKey(gamePubKey));

        await game.init();

        if (!isPlayer) {
            const initIx = await client.initializePlayerAccount(new PublicKey(address), username, Keypair.generate().publicKey);
            transaction.add(...initIx.transaction.instructions);
        }
        if (!isListed) {
            const registerIx = await game.registerPlayer(new PublicKey(address), new PublicKey(leaderBoardsPubKey));
            transaction.add(...registerIx.transaction.instructions);
        }
         console.log(transaction);
         await hydrateTransaction(transaction, connection, new PublicKey(address));
         transaction.partialSign(auth_key);
         
         const temp = transaction.serialize({ requireAllSignatures: false, verifySignatures: false })
         const transactionBase64 = Buffer.from(temp).toString('base64');
        return NextResponse.json(transactionBase64);
    } catch (e) {
        console.log(e)
        return NextResponse.json('failed');
    }
}
export {
    POST,
}

export const maxDuration = 180;

export const dynamic = 'force-dynamic'