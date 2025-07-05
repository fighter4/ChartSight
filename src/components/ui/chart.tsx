"use client"

import React, { useRef, useEffect } from 'react';
import { createChart, IChartApi, ISeriesApi, LineData, CandlestickData } from 'lightweight-charts';

// Define the props for the Chart component
export interface ChartProps {
  initialData: (LineData | CandlestickData)[];
  updateData?: LineData | CandlestickData;
  type?: 'line' | 'candlestick';
  lineWidth?: number;
  priceScaleId?: 'left' | 'right';
}

// Chart component
export const Chart: React.FC<ChartProps> = ({ 
  initialData,
  updateData,
  type = 'candlestick', 
  lineWidth = 2,
  priceScaleId = 'right'
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick" | "Line"> | null>(null);

  // Effect for initializing and resizing the chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize chart
    if (!chartRef.current) {
      chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 500,
        layout: {
          background: { color: '#222222' },
          textColor: 'rgba(255, 255, 255, 0.9)',
        },
        grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
        },
        rightPriceScale: {
          borderColor: 'rgba(255, 255, 255, 0.2)',
        },
        timeScale: {
          borderColor: 'rgba(255, 255, 255, 0.2)',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      // Add the series based on the type prop
      if (type === 'candlestick') {
        seriesRef.current = chartRef.current.addCandlestickSeries({
          upColor: '#39FF14',      // Accent Green from blueprint
          downColor: '#ef5350',    // A standard red for down candles
          borderVisible: false,     // Ensure body is filled
          wickUpColor: '#39FF14',
          wickDownColor: '#ef5350',
        });
      } else {
        seriesRef.current = chartRef.current.addLineSeries({ 
          color: '#2962FF', 
          lineWidth,
          priceScaleId,
        });
      }
    }
    
    // Handle chart resizing
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [type, lineWidth, priceScaleId]);

  // Effect for setting initial data
  useEffect(() => {
    if (seriesRef.current && initialData.length > 0) {
      seriesRef.current.setData(initialData as any);
      chartRef.current?.timeScale().fitContent();
    }
  }, [initialData]);

  // Effect for handling real-time updates
  useEffect(() => {
    if (seriesRef.current && updateData) {
      seriesRef.current.update(updateData as any);
    }
  }, [updateData]);

  return <div ref={chartContainerRef} style={{ position: 'relative' }} />;
};
