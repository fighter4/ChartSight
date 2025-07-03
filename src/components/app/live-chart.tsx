'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, ColorType } from 'lightweight-charts';
import { BinanceService, KlineData } from '@/lib/binance';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Pause, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LiveChartProps {
  onChartReady?: (chartImageDataUri: string) => void;
  tradingStyle?: string;
}

const INTERVALS = [
  { value: '1m', label: '1m' },
  { value: '3m', label: '3m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1h', label: '1h' },
  { value: '2h', label: '2h' },
  { value: '4h', label: '4h' },
  { value: '6h', label: '6h' },
  { value: '8h', label: '8h' },
  { value: '12h', label: '12h' },
  { value: '1d', label: '1d' },
  { value: '3d', label: '3d' },
  { value: '1w', label: '1w' },
  { value: '1M', label: '1M' },
];

const POPULAR_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT',
  'DOTUSDT', 'DOGEUSDT', 'AVAXUSDT', 'MATICUSDT', 'LINKUSDT'
];

export function LiveChart({ onChartReady, tradingStyle = 'Swing Trader' }: LiveChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1h');
  const [isLoading, setIsLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [lastPrice, setLastPrice] = useState<string>('');
  const [priceChange, setPriceChange] = useState<string>('');
  const [priceChangePercent, setPriceChangePercent] = useState<string>('');
  const [volume, setVolume] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const { toast } = useToast();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Only initialize if not already initialized
    if (!chartRef.current) {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 500,
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#d1d5db',
        },
        grid: {
          vertLines: { color: '#374151' },
          horzLines: { color: '#374151' },
        },
        crosshair: {
          mode: 1,
        },
        rightPriceScale: {
          borderColor: '#374151',
        },
        timeScale: {
          borderColor: '#374151',
          timeVisible: true,
          secondsVisible: false,
        },
      });
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#10b981',
        wickDownColor: '#ef4444',
        wickUpColor: '#10b981',
      });
      chartRef.current = chart;
      candlestickSeriesRef.current = candlestickSeries;

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };
      window.addEventListener('resize', handleResize);
      // Store cleanup for resize
      chartRef.current._resizeCleanup = () => window.removeEventListener('resize', handleResize);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (chartRef.current) {
        if (chartRef.current._resizeCleanup) chartRef.current._resizeCleanup();
        chartRef.current.remove();
        chartRef.current = null;
      }
      candlestickSeriesRef.current = null;
    };
  }, []);

  const fetchKlineData = useCallback(async (symbol: string, interval: string) => {
    try {
      setIsLoading(true);
      setError('');
      const klines = await BinanceService.getKlines(symbol, interval, 500);
      const chartData: CandlestickData[] = klines.map((kline: KlineData) => ({
        time: kline.openTime / 1000 as unknown as import('lightweight-charts').Time,
        open: parseFloat(kline.open),
        high: parseFloat(kline.high),
        low: parseFloat(kline.low),
        close: parseFloat(kline.close),
      }));
      if (candlestickSeriesRef.current) {
        candlestickSeriesRef.current.setData(chartData);
      }
      // Fetch 24hr ticker for price info
      const ticker = await BinanceService.get24hrTicker(symbol);
      setLastPrice(parseFloat(ticker.lastPrice).toFixed(2));
      setPriceChange(parseFloat(ticker.priceChange).toFixed(2));
      setPriceChangePercent(parseFloat(ticker.priceChangePercent).toFixed(2));
      setVolume(parseFloat(ticker.volume).toFixed(2));
    } catch (err: any) {
      console.error('Error fetching kline data:', err);
      setError(err.message);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch chart data. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const startLiveUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(async () => {
      try {
        const klines = await BinanceService.getKlines(symbol, interval, 1);
        if (
          klines.length > 0 &&
          candlestickSeriesRef.current &&
          chartRef.current
        ) {
          const latestKline = klines[0];
          const newCandle: CandlestickData = {
            time: latestKline.openTime / 1000 as unknown as import('lightweight-charts').Time,
            open: parseFloat(latestKline.open),
            high: parseFloat(latestKline.high),
            low: parseFloat(latestKline.low),
            close: parseFloat(latestKline.close),
          };
          candlestickSeriesRef.current.update(newCandle);
        }
        // Update price info
        const ticker = await BinanceService.get24hrTicker(symbol);
        setLastPrice(parseFloat(ticker.lastPrice).toFixed(2));
        setPriceChange(parseFloat(ticker.priceChange).toFixed(2));
        setPriceChangePercent(parseFloat(ticker.priceChangePercent).toFixed(2));
        setVolume(parseFloat(ticker.volume).toFixed(2));
      } catch (err) {
        console.error('Error updating live data:', err);
      }
    }, 5000) as unknown as NodeJS.Timeout;
  }, [symbol, interval]);

  const stopLiveUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const captureChartImage = useCallback(() => {
    if (chartRef.current && onChartReady) {
      // Create a canvas and capture the chart
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size to match chart
      canvas.width = chartContainerRef.current?.clientWidth || 800;
      canvas.height = 500;

      // Fill background
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Convert chart to image (this is a simplified approach)
      // In a real implementation, you might want to use html2canvas or similar
      const chartElement = chartContainerRef.current;
      if (chartElement) {
        // For now, we'll create a data URI representation
        const dataUri = canvas.toDataURL('image/png');
        onChartReady(dataUri);
      }
    }
  }, [onChartReady]);

  useEffect(() => {
    fetchKlineData(symbol, interval);
  }, [symbol, interval, fetchKlineData]);

  useEffect(() => {
    if (isLive) {
      startLiveUpdates();
    } else {
      stopLiveUpdates();
    }

    return () => stopLiveUpdates();
  }, [isLive, startLiveUpdates, stopLiveUpdates]);

  const handleSymbolChange = (newSymbol: string) => {
    if (symbol === newSymbol) return;
    setSymbol(newSymbol);
    if (isLive) {
      stopLiveUpdates();
      setTimeout(() => startLiveUpdates(), 100);
    }
  };

  const handleIntervalChange = (newInterval: string) => {
    if (interval === newInterval) return;
    setInterval(newInterval);
    if (isLive) {
      stopLiveUpdates();
      setTimeout(() => startLiveUpdates(), 100);
    }
  };

  const toggleLive = () => {
    setIsLive(!isLive);
  };

  const refreshData = () => {
    fetchKlineData(symbol, interval);
  };

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Live Chart
            {isLive && <Badge variant="secondary" className="animate-pulse">LIVE</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant={isLive ? "destructive" : "default"}
              size="sm"
              onClick={toggleLive}
            >
              {isLive ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Live
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Symbol:</span>
            <Select value={POPULAR_SYMBOLS.includes(symbol) ? symbol : POPULAR_SYMBOLS[0]} onValueChange={handleSymbolChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POPULAR_SYMBOLS.map((sym) => (
                  <SelectItem key={sym} value={sym}>
                    {sym}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Interval:</span>
            <Select value={INTERVALS.map(i => i.value).includes(interval) ? interval : INTERVALS[0].value} onValueChange={handleIntervalChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERVALS.map((int) => (
                  <SelectItem key={int.value} value={int.value}>
                    {int.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {lastPrice && (
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Price: </span>
              <span className="font-mono">${lastPrice}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Change: </span>
              <span className={`font-mono ${parseFloat(priceChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {priceChange} ({priceChangePercent}%)
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Volume: </span>
              <span className="font-mono">{volume}</span>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
            {error}
          </div>
        )}
        
        <div 
          ref={chartContainerRef} 
          className="w-full h-[500px] relative"
        />
        
        {onChartReady && (
          <div className="mt-4 flex justify-center">
            <Button onClick={captureChartImage} variant="outline">
              Capture Chart for AI Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 