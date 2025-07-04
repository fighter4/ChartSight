const BINANCE_BASE_URL = 'https://api.binance.us';

function isServer() {
  return typeof window === 'undefined';
}

export interface KlineData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
  ignore: string;
}

export interface SymbolInfo {
  symbol: string;
  status: string;
  baseAsset: string;
  quoteAsset: string;
  pricePrecision: number;
  quantityPrecision: number;
}

export class BinanceService {
  private static async makeRequest(endpoint: string, params?: Record<string, string>) {
    if (isServer()) {
      // Server-side: call Binance API directly
      const serverUrl = new URL(`${BINANCE_BASE_URL}${endpoint}`);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          serverUrl.searchParams.append(key, value);
        });
      }
      const response = await fetch(serverUrl.toString(), {
        headers: {
          'X-MBX-APIKEY': process.env.BINANCE_API_KEY || '',
        },
      });
      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } else {
      // Client-side: call our Next.js API proxy
      const clientUrl = new URL('/api/binance-klines', window.location.origin);
      clientUrl.searchParams.append('endpoint', endpoint);
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          clientUrl.searchParams.append(key, value);
        });
      }
      const response = await fetch(clientUrl.toString());
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Proxy API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      return response.json();
    }
  }

  static async getKlines(symbol: string, interval: string, limit: number = 500): Promise<KlineData[]> {
    if (!symbol || !interval) {
      throw new Error('Missing required symbol or interval for getKlines');
    }
    const params = {
      symbol: symbol.toUpperCase(),
      interval,
      limit: limit.toString(),
    };
    const data = await this.makeRequest('/api/v3/klines', params);
    return data.map((kline: any[]) => ({
      openTime: kline[0],
      open: kline[1],
      high: kline[2],
      low: kline[3],
      close: kline[4],
      volume: kline[5],
      closeTime: kline[6],
      quoteAssetVolume: kline[7],
      numberOfTrades: kline[8],
      takerBuyBaseAssetVolume: kline[9],
      takerBuyQuoteAssetVolume: kline[10],
      ignore: kline[11],
    }));
  }

  static async getSymbolInfo(symbol: string): Promise<SymbolInfo | null> {
    try {
      const exchangeInfo = await this.makeRequest('/api/v3/exchangeInfo');
      const symbolInfo = exchangeInfo.symbols.find((s: any) => s.symbol === symbol.toUpperCase());
      
      if (!symbolInfo) return null;

      return {
        symbol: symbolInfo.symbol,
        status: symbolInfo.status,
        baseAsset: symbolInfo.baseAsset,
        quoteAsset: symbolInfo.quoteAsset,
        pricePrecision: symbolInfo.pricePrecision,
        quantityPrecision: symbolInfo.quantityPrecision,
      };
    } catch (error) {
      console.error('Error fetching symbol info:', error);
      return null;
    }
  }

  static async get24hrTicker(symbol: string) {
    if (!symbol) {
      throw new Error('Missing required symbol for get24hrTicker');
    }
    const params = { symbol: symbol.toUpperCase() };
    return this.makeRequest('/api/v3/ticker/24hr', params);
  }

  static async getTopSymbols(limit: number = 20) {
    const tickers = await this.makeRequest('/api/v3/ticker/24hr');
    
    // Filter for USDT pairs and sort by volume
    const usdtPairs = tickers
      .filter((ticker: any) => ticker.symbol.endsWith('USDT'))
      .sort((a: any, b: any) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
      .slice(0, limit);

    return usdtPairs.map((ticker: any) => ({
      symbol: ticker.symbol,
      priceChange: ticker.priceChange,
      priceChangePercent: ticker.priceChangePercent,
      lastPrice: ticker.lastPrice,
      volume: ticker.volume,
      quoteVolume: ticker.quoteVolume,
    }));
  }
}
