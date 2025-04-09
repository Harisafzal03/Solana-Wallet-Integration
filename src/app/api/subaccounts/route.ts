import { NextResponse } from 'next/server';
import { PublicKey, Keypair, Connection } from '@solana/web3.js';
import { DriftClient, Wallet } from '@drift-labs/sdk';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authorityString = searchParams.get('authority');

    if (!authorityString) {
      return NextResponse.json(
        { error: 'Missing "authority" query parameter.' },
        { status: 400 }
      );
    }

    let authorityPubkey: PublicKey;
    try {
      authorityPubkey = new PublicKey(authorityString);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid "authority" public key.' },
        { status: 400 }
      );
    }

    // Create a connection to Solana devnet
    const connection = new Connection('https://api.devnet.solana.com');
    
    // Create a read-only wallet with a dummy keypair
    const dummyWallet = new Wallet(Keypair.generate());

    // Initialize DriftClient on the server with the dummy wallet
    const driftClient = new DriftClient({
      connection,
      wallet: dummyWallet,
      env: 'devnet',
    });

    // Subscribe to the DriftClient
    await driftClient.subscribe();

    // Fetch user accounts for the authority
    const userAccounts = await driftClient.getUserAccountsForAuthority(authorityPubkey);

    // Unsubscribe to clean up resources
    await driftClient.unsubscribe();

    // Return user accounts data
    return NextResponse.json({ userAccounts });
  } catch (error: unknown) {
    console.error('Error fetching subaccounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subaccounts', details: (error as Error).message },
      { status: 500 }
    );
  }
}