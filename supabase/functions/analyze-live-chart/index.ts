import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LiveChartAnalysis {
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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { symbol, interval, price, volume, chart_data } = await req.json()

    // Basic validation
    if (!symbol || !interval || !price || !volume) {
      throw new Error('Missing required parameters')
    }

    // Simple technical analysis logic
    const trend = analyzeTrend(chart_data)
    const support_levels = findSupportLevels(chart_data)
    const resistance_levels = findResistanceLevels(chart_data)
    const analysis_summary = generateAnalysisSummary(trend, support_levels, resistance_levels)
    const trading_recommendation = generateTradingRecommendation(trend, price, support_levels, resistance_levels)

    const analysis: LiveChartAnalysis = {
      symbol,
      interval,
      timestamp: Date.now(),
      price,
      volume,
      trend,
      support_levels,
      resistance_levels,
      analysis_summary,
      trading_recommendation,
    }

    // Store analysis in Supabase
    const { data, error } = await supabaseClient
      .from('live_chart_analyses')
      .insert([analysis])
      .select()

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, analysis: data[0] }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function analyzeTrend(chartData: any[]): string {
  if (!chartData || chartData.length < 2) return 'neutral'
  
  const recent = chartData.slice(-10)
  const prices = recent.map(candle => parseFloat(candle.close))
  
  const firstPrice = prices[0]
  const lastPrice = prices[prices.length - 1]
  const change = ((lastPrice - firstPrice) / firstPrice) * 100
  
  if (change > 2) return 'bullish'
  if (change < -2) return 'bearish'
  return 'neutral'
}

function findSupportLevels(chartData: any[]): number[] {
  if (!chartData || chartData.length < 20) return []
  
  const lows = chartData.map(candle => parseFloat(candle.low))
  const supportLevels: number[] = []
  
  // Simple support level detection (local minima)
  for (let i = 1; i < lows.length - 1; i++) {
    if (lows[i] < lows[i-1] && lows[i] < lows[i+1]) {
      supportLevels.push(lows[i])
    }
  }
  
  return supportLevels.slice(-3) // Return last 3 support levels
}

function findResistanceLevels(chartData: any[]): number[] {
  if (!chartData || chartData.length < 20) return []
  
  const highs = chartData.map(candle => parseFloat(candle.high))
  const resistanceLevels: number[] = []
  
  // Simple resistance level detection (local maxima)
  for (let i = 1; i < highs.length - 1; i++) {
    if (highs[i] > highs[i-1] && highs[i] > highs[i+1]) {
      resistanceLevels.push(highs[i])
    }
  }
  
  return resistanceLevels.slice(-3) // Return last 3 resistance levels
}

function generateAnalysisSummary(trend: string, supportLevels: number[], resistanceLevels: number[]): string {
  const trendText = trend === 'bullish' ? 'uptrend' : trend === 'bearish' ? 'downtrend' : 'sideways'
  
  return `The market is currently in a ${trendText}. Key support levels are at ${supportLevels.join(', ') || 'none identified'}. Key resistance levels are at ${resistanceLevels.join(', ') || 'none identified'}.`
}

function generateTradingRecommendation(trend: string, currentPrice: number, supportLevels: number[], resistanceLevels: number[]): string {
  const nearestSupport = supportLevels.length > 0 ? Math.max(...supportLevels.filter(s => s < currentPrice)) : null
  const nearestResistance = resistanceLevels.length > 0 ? Math.min(...resistanceLevels.filter(r => r > currentPrice)) : null
  
  if (trend === 'bullish' && nearestResistance) {
    return `Consider buying with target near ${nearestResistance}`
  } else if (trend === 'bearish' && nearestSupport) {
    return `Consider selling with target near ${nearestSupport}`
  } else {
    return 'Monitor for clearer signals'
  }
} 