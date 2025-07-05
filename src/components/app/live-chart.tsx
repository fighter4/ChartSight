"use client";

import { useEffect, useRef, useState } from 'react';
import { Chart } from '@/components/ui/chart';
import { KlineData, BinanceService } from '@/lib/binance';
import { CandlestickData } from 'lightweight-charts';

const LiveChart = ({ symbol, interval }: { symbol: string; interval: string }) => {
  const [initialData, setInitialData] = useState<CandlestickData[]>([]);
  const [update, setUpdate] = useState<CandlestickData | undefined>();
  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    // 1. Fetch historical data
    const fetchHistoricalData = async () => {
      const klines = await BinanceService.getKlines(symbol, interval, 1000);
      const formattedData: CandlestickData[] = klines.map(kline => ({
        time: (kline.openTime / 1000) as any,
        open: parseFloat(kline.open),
        high: parseFloat(kline.high),
        low: parseFloat(kline.low),
        close: parseFloat(kline.close),
      }));
      setInitialData(formattedData);
    };

    fetchHistoricalData();

    // 2. Establish WebSocket connection
    if (socket.current) {
        socket.current.close();
    }
    
    // Use wss://stream.binance.us:9443 for Binance US
    socket.current = new WebSocket(`wss://stream.binance.us:9443/ws/${symbol.toLowerCase()}@kline_${interval}`);

    // 3. Handle incoming messages
    socket.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const kline = message.k;

      const newCandle: CandlestickData = {
        time: (kline.t / 1000) as any,
        open: parseFloat(kline.o),
        high: parseFloat(kline.h),
        low: parseFloat(kline.l),
        close: parseFloat(kline.c),
      };
      
      setUpdate(newCandle);
    };

    // 4. Cleanup on component unmount
    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, [symbol, interval]);


  return (
    <div>
      <Chart initialData={initialData} updateData={update} />
    </div>
  );
};

export default LiveChart;
