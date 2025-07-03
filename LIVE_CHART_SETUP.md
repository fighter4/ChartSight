# Live Chart Feature Setup Guide

This guide will help you set up the live chart functionality with Binance API and Supabase integration.

## Features Added

1. **Real-time Live Charts** - Using TradingView's lightweight charts library
2. **Binance API Integration** - Real-time market data from Binance
3. **Supabase Backend** - For storing analysis history and backend functions
4. **AI Analysis Integration** - Live charts can be analyzed using the existing AI system
5. **Live Chart History** - View historical analysis from Supabase

## Prerequisites

1. **Supabase Account** - Create a free account at [supabase.com](https://supabase.com)
2. **Binance API Key** - Already provided in the code
3. **Node.js** - Version 18 or higher

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

#### Create a new Supabase project:
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

#### Create the database table:

Run this SQL in your Supabase SQL editor:

```sql
-- Create the live_chart_analyses table
CREATE TABLE live_chart_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL,
  interval TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  price DECIMAL NOT NULL,
  volume DECIMAL NOT NULL,
  trend TEXT NOT NULL,
  support_levels DECIMAL[] NOT NULL DEFAULT '{}',
  resistance_levels DECIMAL[] NOT NULL DEFAULT '{}',
  analysis_summary TEXT NOT NULL,
  trading_recommendation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_live_chart_analyses_symbol ON live_chart_analyses(symbol);
CREATE INDEX idx_live_chart_analyses_timestamp ON live_chart_analyses(timestamp);
CREATE INDEX idx_live_chart_analyses_created_at ON live_chart_analyses(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE live_chart_analyses ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows authenticated users to read all analyses
CREATE POLICY "Allow authenticated users to read live chart analyses" ON live_chart_analyses
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create a policy that allows authenticated users to insert their own analyses
CREATE POLICY "Allow authenticated users to insert live chart analyses" ON live_chart_analyses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### 3. Environment Variables

Create or update your `.env.local` file:

```env
# Existing Firebase variables (keep these)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Add these new Supabase variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Existing AI variables (keep these)
GOOGLE_GENAI_API_KEY=your_google_genai_api_key
```

### 4. Deploy Supabase Edge Function

#### Install Supabase CLI:
```bash
npm install -g supabase
```

#### Login to Supabase:
```bash
supabase login
```

#### Link your project:
```bash
supabase link --project-ref your_project_ref
```

#### Deploy the Edge Function:
```bash
supabase functions deploy analyze-live-chart
```

### 5. Update Next.js Configuration

The `next.config.ts` file has been updated to include the necessary image domains for TradingView charts.

## Usage

### Accessing the Live Chart Feature

1. **Navigation**: The live chart feature is accessible from the main navigation dropdown menu
2. **URL**: `/live-chart`

### Features Available

1. **Real-time Chart Display**
   - Select from popular cryptocurrency pairs
   - Choose from multiple timeframes (1m to 1M)
   - Live price updates every 5 seconds
   - Professional TradingView-style charts

2. **AI Analysis Integration**
   - Capture chart screenshots for AI analysis
   - Use existing AI analysis workflows
   - Q&A functionality for live charts
   - Feedback system

3. **Live Chart History**
   - View historical analyses stored in Supabase
   - Filter by symbol
   - Trend analysis with confidence scores
   - Price and volume change tracking

### Chart Controls

- **Symbol Selector**: Choose from popular USDT trading pairs
- **Interval Selector**: Select timeframe from 1 minute to 1 month
- **Live Toggle**: Start/stop real-time updates
- **Refresh Button**: Manually refresh chart data
- **Capture Button**: Take screenshot for AI analysis

### Analysis Features

- **Real-time Analysis**: Get instant technical analysis
- **Support/Resistance Levels**: Automatically detected
- **Trend Analysis**: Bullish/Bearish/Neutral with confidence
- **Trading Recommendations**: AI-generated suggestions
- **Historical Tracking**: Monitor analysis over time

## Technical Details

### Architecture

```
Frontend (Next.js) → Binance API → Live Chart Component
                    ↓
                Supabase Edge Function → Supabase Database
                    ↓
                AI Analysis (Existing System)
```

### Key Components

1. **`LiveChart` Component** (`src/components/app/live-chart.tsx`)
   - TradingView lightweight charts integration
   - Real-time data fetching from Binance
   - Chart controls and UI

2. **`BinanceService`** (`src/lib/binance.ts`)
   - Binance API integration
   - Kline data fetching
   - Symbol information

3. **`LiveChartService`** (`src/lib/live-chart-service.ts`)
   - Supabase integration
   - Analysis history management
   - Trend analysis

4. **Supabase Edge Function** (`supabase/functions/analyze-live-chart/index.ts`)
   - Backend analysis logic
   - Database operations
   - Technical analysis algorithms

### Data Flow

1. User selects symbol and interval
2. Component fetches historical data from Binance
3. Chart displays with TradingView library
4. Live updates every 5 seconds
5. User can capture chart for AI analysis
6. Analysis stored in Supabase for history
7. Historical data available for trend analysis

## Troubleshooting

### Common Issues

1. **Chart not loading**
   - Check Binance API connectivity
   - Verify symbol format (should be like "BTCUSDT")
   - Check browser console for errors

2. **Supabase connection issues**
   - Verify environment variables
   - Check Supabase project status
   - Ensure RLS policies are configured

3. **Edge Function errors**
   - Check function deployment status
   - Verify function logs in Supabase dashboard
   - Ensure proper authentication headers

### Performance Tips

1. **Limit live updates**: The default 5-second interval balances real-time updates with API rate limits
2. **Chart data caching**: Historical data is cached to reduce API calls
3. **Efficient rendering**: TradingView charts are optimized for performance

## Security Considerations

1. **API Key Protection**: Binance API key is embedded in the service (for public data access)
2. **Authentication**: Supabase RLS ensures data security
3. **Rate Limiting**: Built-in delays prevent API abuse
4. **Data Validation**: Input validation on all API calls

## Future Enhancements

1. **WebSocket Integration**: Real-time price streaming
2. **Advanced Indicators**: RSI, MACD, Bollinger Bands
3. **Alert System**: Price and pattern alerts
4. **Portfolio Integration**: Track multiple symbols
5. **Social Features**: Share analyses with other users

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure Supabase project is active
4. Check Binance API status

The live chart feature is now fully integrated with your existing ChartSight AI application! 