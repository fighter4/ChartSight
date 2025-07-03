import { supabase } from './supabase';

export interface LiveChartAnalysis {
  id?: string;
  symbol: string;
  interval: string;
  timestamp: number;
  price: number;
  volume: number;
  trend: string;
  support_levels: number[];
  resistance_levels: number[];
  analysis_summary: string;
  trading_recommendation: string;
  created_at?: string;
}

export interface ChartDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export class LiveChartService {
  static async analyzeLiveChart(
    symbol: string,
    interval: string,
    price: number,
    volume: number,
    chartData: ChartDataPoint[]
  ): Promise<LiveChartAnalysis> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/analyze-live-chart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({
          symbol,
          interval,
          price,
          volume,
          chart_data: chartData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.analysis;
    } catch (error) {
      console.error('Error analyzing live chart:', error);
      throw error;
    }
  }

  static async getLiveChartHistory(symbol?: string, limit: number = 50): Promise<LiveChartAnalysis[]> {
    try {
      let query = supabase
        .from('live_chart_analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (symbol) {
        query = query.eq('symbol', symbol);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching live chart history:', error);
      throw error;
    }
  }

  static async saveLiveChartAnalysis(analysis: Omit<LiveChartAnalysis, 'id' | 'created_at'>): Promise<LiveChartAnalysis> {
    try {
      const { data, error } = await supabase
        .from('live_chart_analyses')
        .insert([analysis])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving live chart analysis:', error);
      throw error;
    }
  }

  static async getAnalysisBySymbol(symbol: string, limit: number = 20): Promise<LiveChartAnalysis[]> {
    try {
      const { data, error } = await supabase
        .from('live_chart_analyses')
        .select('*')
        .eq('symbol', symbol)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching analysis by symbol:', error);
      throw error;
    }
  }

  static async getTrendAnalysis(symbol: string, hours: number = 24): Promise<{
    trend: string;
    confidence: number;
    price_change: number;
    volume_change: number;
  }> {
    try {
      const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('live_chart_analyses')
        .select('*')
        .eq('symbol', symbol)
        .gte('timestamp', cutoffTime)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      if (!data || data.length < 2) {
        return {
          trend: 'neutral',
          confidence: 0,
          price_change: 0,
          volume_change: 0,
        };
      }

      const firstAnalysis = data[0];
      const lastAnalysis = data[data.length - 1];
      
      const priceChange = ((lastAnalysis.price - firstAnalysis.price) / firstAnalysis.price) * 100;
      const volumeChange = ((lastAnalysis.volume - firstAnalysis.volume) / firstAnalysis.volume) * 100;
      
      // Calculate trend confidence based on consistency
      const bullishCount = data.filter(a => a.trend === 'bullish').length;
      const bearishCount = data.filter(a => a.trend === 'bearish').length;
      const totalCount = data.length;
      
      let trend = 'neutral';
      let confidence = 0;
      
      if (bullishCount > bearishCount) {
        trend = 'bullish';
        confidence = (bullishCount / totalCount) * 100;
      } else if (bearishCount > bullishCount) {
        trend = 'bearish';
        confidence = (bearishCount / totalCount) * 100;
      }

      return {
        trend,
        confidence: Math.round(confidence),
        price_change: Math.round(priceChange * 100) / 100,
        volume_change: Math.round(volumeChange * 100) / 100,
      };
    } catch (error) {
      console.error('Error getting trend analysis:', error);
      throw error;
    }
  }
} 