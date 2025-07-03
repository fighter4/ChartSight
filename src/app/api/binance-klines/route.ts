import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get('endpoint');
  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
  }

  // Build the Binance API URL
  const binanceUrl = new URL(`https://api.binance.com${endpoint}`);
  // Forward all other query params except 'endpoint'
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') {
      binanceUrl.searchParams.append(key, value);
    }
  });

  const response = await fetch(binanceUrl.toString(), {
    headers: {
      'X-MBX-APIKEY': process.env.BINANCE_API_KEY || '',
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch from Binance', status: response.status }, { status: response.status });
  }

  const data = await response.json();
  return NextResponse.json(data);
} 