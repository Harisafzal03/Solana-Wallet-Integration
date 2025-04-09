import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { subAccountId, orderType, direction, marketIndex, size, price } = await request.json();
    
    if (size <= 0) {
      return NextResponse.json(
        { error: 'Size must be greater than 0' },
        { status: 400 }
      );
    }

    if (orderType === 'limit' && (price === undefined || price <= 0)) {
      return NextResponse.json(
        { error: 'Limit orders require a valid price' },
        { status: 400 }
      );
    }

    // This endpoint would need authorization to get user's wallet
    // For now, just return a simulated response
    
    return NextResponse.json({ 
      success: true,
      message: `Simulated ${direction} ${orderType} order of size ${size} on market ${marketIndex} for subaccount ${subAccountId}`
    });
    
  } catch (error: unknown) {
    console.error('Error placing order:', error);
    return NextResponse.json(
      { error: 'Failed to place order', details: (error as Error).message },
      { status: 500 }
    );
  }
}