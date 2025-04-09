import { NextResponse } from 'next/server';
import { Connection, Keypair } from '@solana/web3.js';
import { DriftClient, Wallet, PerpMarkets, PerpMarketConfig } from '@drift-labs/sdk';

interface EnhancedMarketData {
  symbol: string;
  price: number;
  volume24h: number;
  openInterest: number;
}

export async function GET() {
  try {
    // Initialize connection to Solana devnet
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com';
    const connection = new Connection(rpcUrl);

    // Create a read-only wallet with dummy keypair
    const wallet = new Wallet(Keypair.generate());

    // Initialize Drift client
    const driftClient = new DriftClient({
      connection,
      wallet,
      env: 'devnet',
    });

    await driftClient.subscribe();

    // Fetch enhanced market data
    const enhancedMarketData: EnhancedMarketData[] = await Promise.all(
      PerpMarkets['devnet'].map(async (market: PerpMarketConfig) => {
        const perpMarket = driftClient.getPerpMarketAccount(market.marketIndex);

        // Safety check with default values and proper type checking
        const rawPrice = perpMarket?.amm.historicalOracleData.lastOraclePriceTwap?.toNumber() || 0;
        const rawVolume24h = perpMarket?.amm.volume24H?.toNumber() || 0;
        const rawOpenInterest = perpMarket?.amm.baseAssetAmountWithAmm?.toNumber() || 0;

        return {
          symbol: market.symbol,
          price: rawPrice / 1e6,        // Convert to standard units
          volume24h: rawVolume24h / 1e6,
          openInterest: rawOpenInterest / 1e9,
        };
      })
    );

    await driftClient.unsubscribe();

    return NextResponse.json({ markets: enhancedMarketData });
  } catch (error) {
    console.error('Error fetching Drift data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch Drift data', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}