'use client';

import { useState, useEffect } from 'react';
import { LiveChartService, LiveChartAnalysis } from '@/lib/live-chart-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, TrendingUp, TrendingDown, Minus, Clock, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const POPULAR_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT',
  'DOTUSDT', 'DOGEUSDT', 'AVAXUSDT', 'MATICUSDT', 'LINKUSDT'
];

export function LiveChartHistory() {
  const [analyses, setAnalyses] = useState<LiveChartAnalysis[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [trendAnalysis, setTrendAnalysis] = useState<{
    trend: string;
    confidence: number;
    price_change: number;
    volume_change: number;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyses();
  }, [selectedSymbol]);

  const loadAnalyses = async () => {
    setIsLoading(true);
    try {
      const symbol = selectedSymbol === 'all' ? undefined : selectedSymbol;
      const data = await LiveChartService.getLiveChartHistory(symbol, 20);
      setAnalyses(data);

      if (selectedSymbol !== 'all') {
        const trend = await LiveChartService.getTrendAnalysis(selectedSymbol, 24);
        setTrendAnalysis(trend);
      } else {
        setTrendAnalysis(null);
      }
    } catch (error: any) {
      console.error('Error loading analyses:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load analysis history.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'bearish':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'bearish':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Live Analysis History
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Symbols</SelectItem>
                {POPULAR_SYMBOLS.map((symbol) => (
                  <SelectItem key={symbol} value={symbol}>
                    {symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAnalyses}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Refresh'
              )}
            </Button>
          </div>
        </div>

        {trendAnalysis && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Trend:</span>
              <Badge variant="outline" className={getTrendColor(trendAnalysis.trend)}>
                {getTrendIcon(trendAnalysis.trend)}
                {trendAnalysis.trend}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Confidence:</span>
              <span className="font-mono">{trendAnalysis.confidence}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Price Change:</span>
              <span className={`font-mono ${trendAnalysis.price_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trendAnalysis.price_change >= 0 ? '+' : ''}{trendAnalysis.price_change}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Volume Change:</span>
              <span className={`font-mono ${trendAnalysis.volume_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trendAnalysis.volume_change >= 0 ? '+' : ''}{trendAnalysis.volume_change}%
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No analysis history found.
          </div>
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <Card key={analysis.id} className="bg-background/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{analysis.symbol}</span>
                        <Badge variant="outline" className="text-xs">
                          {analysis.interval}
                        </Badge>
                        <Badge variant="outline" className={getTrendColor(analysis.trend)}>
                          {getTrendIcon(analysis.trend)}
                          {analysis.trend}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">Price: </span>
                          <span className="font-mono">{formatPrice(analysis.price)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Volume: </span>
                          <span className="font-mono">{analysis.volume.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Support: </span>
                          <span className="font-mono">
                            {analysis.support_levels.length > 0 
                              ? analysis.support_levels.map(p => formatPrice(p)).join(', ')
                              : 'None'
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Resistance: </span>
                          <span className="font-mono">
                            {analysis.resistance_levels.length > 0 
                              ? analysis.resistance_levels.map(p => formatPrice(p)).join(', ')
                              : 'None'
                            }
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Analysis: </span>
                          <span className="text-sm text-muted-foreground">{analysis.analysis_summary}</span>
                        </div>
                        <div>
                          <span className="text-sm font-medium">Recommendation: </span>
                          <span className="text-sm text-muted-foreground">{analysis.trading_recommendation}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground ml-4">
                      <Clock className="h-3 w-3" />
                      {formatTime(analysis.timestamp)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 