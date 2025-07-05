"use client";

import { useEffect, useRef, useState } from 'react';
import { Chart } from '@/components/ui/chart';
import { KlineData, BinanceService } from '@/lib/binance';
import { CandlestickData } from 'lightweight-charts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const INTERVALS = [
  '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '1d'
];

const LiveChart = () => {
  const [symbol, setSymbol] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selectedSymbol');
      return stored && stored.trim() ? stored : 'BTCUSDT';
    }
    return 'BTCUSDT';
  });
  const [interval, setInterval] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selectedInterval');
      return stored && stored.trim() ? stored : '1m';
    }
    return '1m';
  });
  const [symbols, setSymbols] = useState<string[]>([]);
  const [symbolSearch, setSymbolSearch] = useState('');
  const [initialData, setInitialData] = useState<CandlestickData[]>([]);
  const [update, setUpdate] = useState<CandlestickData | undefined>();
  const socket = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const heartbeatInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPong = useRef(Date.now());

  // Fetch all /USDT symbols from Binance on mount
  useEffect(() => {
    const fetchSymbols = async () => {
      // Use global Binance endpoint for all pairs
      let allSymbols: string[] = [];
      try {
        const exchangeInfo = await fetch('https://api.binance.com/api/v3/exchangeInfo').then(r => r.json());
        allSymbols = exchangeInfo.symbols
          .filter((s: any) => s.symbol.endsWith('USDT'))
          .map((s: any) => s.symbol);
      } catch (e) {
        // fallback to top symbols if fetch fails
        const info = await BinanceService.getTopSymbols(1000);
        allSymbols = info.map((s: any) => s.symbol);
      }
      setSymbols(allSymbols);
    };
    fetchSymbols();
  }, []);

  // Debug: Log initialData and updateData
  useEffect(() => {
    console.log('Initial Data:', initialData);
  }, [initialData]);
  useEffect(() => {
    if (update) console.log('Update Data:', update);
  }, [update]);

  // Improved WebSocket connection with reconnection and heartbeat
  useEffect(() => {
    let isUnmounted = false;
    let ws: WebSocket | null = null;

    const connect = () => {
      if (ws) ws.close();
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${interval}`);
      socket.current = ws;

      ws.onopen = () => {
        reconnectAttempts.current = 0;
        // Start heartbeat
        if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
        heartbeatInterval.current = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event: 'ping' }));
            // If no pong in 20s, reconnect
            if (Date.now() - lastPong.current > 20000) {
              ws.close();
            }
          }
        }, 10000);
      };

      ws.onmessage = (event) => {
        // Handle Binance kline message
        try {
          const message = JSON.parse(event.data);
          if (message.result === null || message.e === 'pong') {
            lastPong.current = Date.now();
            return;
          }
          const kline = message.k;
          if (!kline) return;
          const t = kline.t;
          console.log('Live candle:', new Date(t).toISOString(), t);
          const newCandle: CandlestickData = {
            time: (t / 1000) as any,
            open: parseFloat(kline.o),
            high: parseFloat(kline.h),
            low: parseFloat(kline.l),
            close: parseFloat(kline.c),
          };
          setInitialData(prevData => {
            if (prevData.length === 0) return [newCandle];
            const lastCandle = prevData[prevData.length - 1];
            if (lastCandle.time === newCandle.time) {
              return [...prevData.slice(0, -1), newCandle];
            } else {
              return [...prevData, newCandle];
            }
          });
          setUpdate(newCandle);
        } catch (e) {
          // Ignore parse errors
        }
      };

      ws.onerror = () => {
        ws?.close();
      };

      ws.onclose = () => {
        if (isUnmounted) return;
        if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
        // Exponential backoff for reconnection
        const delay = Math.min(10000, 1000 * 2 ** reconnectAttempts.current);
        setTimeout(() => {
          reconnectAttempts.current += 1;
          connect();
        }, delay);
      };
    };

    // Fetch historical data
    const fetchHistoricalData = async () => {
      if (!symbol || !interval) {
        console.warn('Symbol or interval is empty, skipping fetchHistoricalData');
        return;
      }
      const klines = await BinanceService.getKlines(symbol, interval, 200);
      const formattedData: CandlestickData[] = klines.map(kline => {
        const t = kline.openTime;
        console.log('Historical candle:', new Date(t).toISOString(), t);
        return {
          time: (t / 1000) as any,
          open: parseFloat(kline.open),
          high: parseFloat(kline.high),
          low: parseFloat(kline.low),
          close: parseFloat(kline.close),
        };
      });
      setInitialData(formattedData);
    };

    fetchHistoricalData();
    connect();

    return () => {
      isUnmounted = true;
      if (ws) ws.close();
      if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
    };
  }, [symbol, interval]);

  // Save symbol and interval to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedSymbol', symbol);
    }
  }, [symbol]);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedInterval', interval);
    }
  }, [interval]);

  // Filtered symbols for search
  const filteredSymbols = symbols.filter(s => s.toLowerCase().includes(symbolSearch.toLowerCase()));

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Live Chart</CardTitle>
        <div className="flex gap-4 mt-4">
          <div>
            <label className="block text-xs mb-1">Symbol</label>
            <input
              type="text"
              placeholder="Search symbol..."
              value={symbolSearch}
              onChange={e => setSymbolSearch(e.target.value)}
              className="mb-2 px-2 py-1 rounded border border-gray-300 w-32 text-black"
            />
            <Select value={symbol} onValueChange={val => { if (val && val.trim()) setSymbol(val); }}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filteredSymbols.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs mb-1">Interval</label>
            <Select value={interval} onValueChange={val => { if (val && val.trim()) setInterval(val); }}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVALS.map((i) => (
                  <SelectItem key={i} value={i}>{i}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Chart initialData={initialData} updateData={update} />
      </CardContent>
    </Card>
  );
};

export default LiveChart;
