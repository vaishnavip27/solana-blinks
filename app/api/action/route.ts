import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
} from "@solana/actions";
import {
  Transaction,
  SystemProgram,
  PublicKey,
  Connection,
  clusterApiUrl,
} from "@solana/web3.js";

export async function GET(request: Request) {
  const responseBody: ActionGetResponse = {
    icon: "https://solana-asset-recovery.vercel.app/solandy-logo.png",
    description: "This is Solandy's demo blink",
    label: "Click me!",
    title: "DO BLINK!",
    error: { message: "This blink is not implemented yet" },
  };
  return Response.json(responseBody, {
    headers: ACTIONS_CORS_HEADERS,
  });
}

export async function POST(request: Request) {
  try {
    const requestBody: ActionPostRequest = await request.json();
    const userPubkey = new PublicKey(requestBody.account);
    console.log(userPubkey.toBase58());

    const connection = new Connection(clusterApiUrl("mainnet-beta"));
    const ix = SystemProgram.transfer({
      fromPubkey: userPubkey,
      toPubkey: new PublicKey("DroG2SgCdku4QstjQPvHYGSnTQEULHpt88cHvQpHSTPm"),
      lamports: 1,
    });
    const tx = new Transaction().add(ix);
    tx.feePayer = userPubkey;
    const { blockhash } = await connection.getLatestBlockhash("finalized");
    console.log("using blockhash: " + blockhash);
    tx.recentBlockhash = blockhash;

    const serialTX = tx
      .serialize({ requireAllSignatures: false, verifySignatures: false })
      .toString("base64");

    const postResponse: ActionPostResponse = {
      transaction: serialTX,
      message: "Hello " + userPubkey.toBase58(),
    };

    return Response.json(postResponse, { headers: ACTIONS_CORS_HEADERS });
  } catch (error) {
    console.error("Error in POST request:", error);
    return Response.json(
      { error: "An error occurred processing the request" },
      { status: 500, headers: ACTIONS_CORS_HEADERS }
    );
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, { headers: ACTIONS_CORS_HEADERS });
}
