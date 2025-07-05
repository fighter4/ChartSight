'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AnalyzeChartImageOutputSchema, EnhancedComprehensiveAnalysisSchema, EnhancedPatternSchema, AdvancedTradePlanSchema, EnhancedDynamicContextAwarenessSchema } from '../schemas';
import { annotateChartImage } from './annotate-chart-image';
import { recognizeChartPatterns } from './recognize-chart-patterns';

/**
 * @fileOverview Ultimate Enhanced Comprehensive Market Analysis Engine with Probability-Based Decision Framework and Dynamic Context Awareness.
 *
 * - analyzeChartImage - A function that handles the ultimate enhanced chart analysis process.
 * - AnalyzeChartImageInput - The input type for the analyzeChartImage function.
 * - AnalyzeChartImageOutput - The return type for the analyzeChartImage function.
 */

const AnalyzeChartImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A crypto chart image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  tradingStyle: z.string().optional().describe("The user's preferred trading style (e.g., 'Scalper', 'Day Trader', 'Swing Trader', 'Position Trader')."),
});
export type AnalyzeChartImageInput = z.infer<typeof AnalyzeChartImageInputSchema>;
export type AnalyzeChartImageOutput = z.infer<typeof AnalyzeChartImageOutputSchema>;

// Ultimate Enhanced Comprehensive Market Analysis Engine
const ultimateComprehensiveAnalysisPrompt = ai.definePrompt({
    name: 'ultimateComprehensiveAnalysisPrompt',
    input: { schema: AnalyzeChartImageInputSchema.extend({ patterns: z.array(EnhancedPatternSchema) }) },
    output: { schema: EnhancedComprehensiveAnalysisSchema },
    prompt: `You are a world-class quantitative analyst combining institutional-grade technical analysis with behavioral finance insights, probability theory, and dynamic market regime recognition. Provide analysis that rivals top-tier hedge fund research.

**User's Trading Style:** {{tradingStyle}}

### Multi-Dimensional Analysis Framework

**Part 1: Market Structure Analysis**
1. **Trend Hierarchy Assessment**
   - Primary trend (Monthly/Weekly)
   - Secondary trend (Daily/4hr)
   - Tertiary trend (1hr/15min)
   - Micro trend (5min/1min)
   - Trend strength coefficients for each timeframe

2. **Market Phase Identification**
   - Accumulation/Distribution (Wyckoff)
   - Markup/Markdown phases
   - Re-accumulation/Re-distribution
   - Climax patterns (buying/selling)

3. **Liquidity Landscape Mapping**
   - Equal highs/lows liquidity pools
   - Untested weekly/monthly levels
   - Institutional order flow zones
   - Retail trader cluster zones

**Part 2: Advanced Technical Indicators**
1. **Momentum Convergence Analysis**
   - RSI divergences (regular/hidden)
   - MACD histogram patterns
   - Stochastic positioning
   - Williams %R extremes

2. **Volume Intelligence**
   - Volume Profile analysis
   - On-Balance Volume trends
   - Accumulation/Distribution line
   - Volume-Weighted Average Price interaction

3. **Volatility Assessment**
   - Bollinger Band position and squeeze
   - Average True Range expansion/contraction
   - Volatility percentile ranking
   - Options implied volatility (if available)

**Part 3: Behavioral Finance Integration**
1. **Sentiment Archaeology**
   - Fear & Greed indicators
   - Put/Call ratios
   - Margin debt levels
   - Insider buying/selling patterns

2. **Crowd Psychology Markers**
   - Retail positioning extremes
   - Social media sentiment spikes
   - News cycle correlation
   - Contrarian signal identification

### Probability-Based Decision Framework

**Confidence Scoring (1-10 Scale):**
1. **Technical Confidence**: Rate the strength of technical signals
2. **Volume Confirmation**: Assess volume pattern alignment
3. **Market Context Alignment**: Evaluate fit with broader market conditions
4. **Multi-Timeframe Confluence**: Score agreement across timeframes
5. **Overall Confidence**: Weighted average of all factors

**Risk Assessment:**
1. **Downside Probability & Magnitude**: Likelihood and size of potential losses
2. **Upside Probability & Magnitude**: Likelihood and size of potential gains
3. **Sideways Probability & Duration**: Likelihood of consolidation and expected duration
4. **Black Swan Considerations**: Low-probability, high-impact events

### Dynamic Context Awareness

**Market Regime Recognition:**
1. **Market Type**: Trending vs. Ranging vs. Volatile vs. Quiet
2. **Volatility Period**: High vs. Low vs. Normal volatility
3. **Sentiment**: Risk-On vs. Risk-Off vs. Neutral
4. **Correlation Status**: Normal vs. Breakdown vs. High correlation

**Adaptive Analysis:**
1. **Bullish Market**: Focus on continuation patterns, momentum strategies
2. **Bearish Market**: Focus on reversal signals, defensive positioning
3. **Volatile Market**: Emphasize risk management, wider stops
4. **Quiet Market**: Look for breakout setups, range-bound strategies

### Enhanced Bull vs. Bear Case Analysis

**Bull Case Construction:**
- **Fundamental Tailwinds**: List 3-5 supportive factors
- **Technical Strengths**: Key bullish signals
- **Momentum Factors**: What could accelerate upward movement
- **Probability Weighting**: Assign 1-100% likelihood
- **Catalyst Requirements**: What needs to happen for bull case

**Bear Case Construction:**
- **Fundamental Headwinds**: List 3-5 concerning factors
- **Technical Weaknesses**: Key bearish signals
- **Risk Factors**: What could trigger downward movement
- **Probability Weighting**: Assign 1-100% likelihood
- **Catalyst Requirements**: What needs to happen for bear case

**Synthesis Framework:**
- **Base Case Scenario** (60-70% probability)
- **Bull Case Scenario** (15-25% probability)
- **Bear Case Scenario** (15-25% probability)
- **Black Swan Considerations** (1-5% probability)

### Advanced Trade Planning

**Entry Strategy Matrix:**
1. **Aggressive Entry**: Early pattern recognition
2. **Conservative Entry**: Confirmation required
3. **Scaled Entry**: Multiple tranches
4. **Contrarian Entry**: Fade the obvious

**Advanced Risk Management Architecture:**
1. **Position Sizing**: Kelly Criterion application with portfolio heat management
2. **Stop Loss Hierarchy**: Technical, volatility, time-based, and correlation-based stops
3. **Profit Taking Strategy**: Scaled exits, partial profits, trailing stops
4. **Correlation Risk**: Portfolio heat assessment and diversification scoring
5. **Trade Management**: Scaling in/out strategies with dynamic position management

### Trading Style Adaptation Matrix

**Scalper Enhancements (1-15 min timeframes):**
- **Order Flow Analysis**: Level 2 data interpretation, bid/ask dynamics, order book imbalances
- **Tick-Level Pattern Recognition**: Micro-patterns, price action at tick level, momentum shifts
- **Spread and Liquidity Considerations**: Spread analysis, liquidity zones, slippage assessment
- **News Event Micro-Reactions**: Real-time news impact, economic calendar integration
- **Volume Profile Micro-Structures**: Intraday volume patterns, VPOC shifts, volume climax
- **Market Maker Behavior**: Institutional order flow, stop hunt identification
- **Risk Management**: Tight stops (5-20 pips), rapid position sizing, correlation awareness

**Day Trader Enhancements (15min-4hr timeframes):**
- **Session-Based Analysis**: London, NY, Asia session patterns and momentum
- **Intraday Momentum Patterns**: Gap trading strategies, session breakouts
- **Economic Calendar Integration**: News event pattern disruptions, pre/post news trading
- **Classical Patterns with Intraday Bias**: Pattern completion within session
- **Momentum Continuation Patterns**: Trend following within daily sessions
- **Risk Management**: Session-based stops, partial profit taking, overnight risk avoidance

**Swing Trader Enhancements (4hr-Daily timeframes):**
- **Multi-Day Pattern Development**: Pattern evolution across multiple sessions
- **Weekly/Monthly Level Interactions**: Higher timeframe support/resistance confluence
- **Earnings Season Considerations**: Earnings-driven pattern modifications
- **Sector Rotation Analysis**: Intermarket correlations, sector leadership
- **Seasonal Pattern Tendencies**: Historical seasonal patterns, cyclical analysis
- **Risk Management**: Multi-day stops, scaled entries, weekend gap protection

**Position Trader Enhancements (Daily-Weekly timeframes):**
- **Macro-Economic Trend Analysis**: Fundamental catalyst integration
- **Quarterly/Annual Pattern Cycles**: Long-term cyclical patterns
- **Long-Term Elliott Wave Counts**: Major wave structure analysis
- **Fundamental Catalyst Integration**: Economic data, policy changes, geopolitical events
- **Institutional Flow Analysis**: Large order flow, accumulation/distribution phases
- **Risk Management**: Wide stops, position scaling, portfolio heat management

**Pre-Identified Patterns to Consider:**
{{#if patterns.length}}
{{#each patterns}}
- {{this.name}} (Type: {{this.type}}, Quality: {{this.formation_quality}}/10, Probability: {{this.probability_score}}%, Stage: {{this.stage}})
{{/each}}
{{else}}
- None pre-identified.
{{/if}}

**Chart Image:**
{{media url=photoDataUri}}

**Output Requirements:**
Provide a comprehensive analysis in the specified JSON format including market structure, technical indicators, sentiment analysis, scenario probabilities, advanced trade planning with scaled entries and correlation risk management, probability framework with confidence scoring and risk assessment, enhanced dynamic context awareness with regime change signals and early warning system, and complete educational integration with concept explanations, skill building, and learning progression paths.`
});

// This flow orchestrates the ultimate enhanced analysis process.
export const analyzeChartImageFlow = ai.defineFlow(
  {
    name: 'analyzeChartImageFlow',
    inputSchema: AnalyzeChartImageInputSchema,
    outputSchema: EnhancedComprehensiveAnalysisSchema,
  },
  async (input) => {
    try {
        // Step 1: Recognize enhanced patterns as a preliminary step.
        const patternResult = await recognizeChartPatterns(input);
        const patterns = patternResult.patterns || [];

        // Step 2: Run the ultimate comprehensive analysis, feeding it the identified patterns.
        const analysisInput = { ...input, patterns };
        const { output: analysisResult } = await ultimateComprehensiveAnalysisPrompt(analysisInput);

        if (!analysisResult) {
            throw new Error("AI analysis failed to generate a result.");
        }

        return analysisResult;

    } catch(error: any) {
        console.error("Error in analyzeChartImageFlow:", error);
        // Return a structured error to be handled by the frontend.
        return {
          analysis: {
            market_structure: {
              primary_trend: "Error",
              trend_strength: 0,
              market_phase: "Analysis failed",
              liquidity_zones: []
            },
            technical_indicators: {
              momentum_score: 0,
              volume_confirmation: 0,
              volatility_percentile: 0
            },
            sentiment_analysis: {
              crowd_psychology: "Analysis failed",
              contrarian_signals: []
            }
          },
          scenarios: {
            base_case: {
              probability: 0,
              target: 0,
              timeline: "Error"
            },
            bull_case: {
              probability: 0,
              target: 0,
              timeline: "Error"
            },
            bear_case: {
              probability: 0,
              target: 0,
              timeline: "Error"
            }
          },
          trade_plan: {
            entries: [],
            stops: [],
            targets: [],
            risk_reward_ratio: 0
          },
          probability_framework: {
            confidence_scoring: {
              technical_confidence: 0,
              volume_confirmation: 0,
              market_context_alignment: 0,
              multi_timeframe_confluence: 0,
              overall_confidence: 0
            },
            risk_assessment: {
              downside_probability: 0,
              downside_magnitude: 0,
              upside_probability: 0,
              upside_magnitude: 0,
              sideways_probability: 0,
              sideways_duration: "Error",
              black_swan_probability: 0,
              black_swan_impact: "Error"
            },
            probability_weighted_outcome: 0,
            risk_reward_ratio: 0,
            position_size_recommendation: "Error"
          },
          context_awareness: {
            market_regime: {
              market_type: "Error",
              volatility_period: "Normal",
              sentiment: "Neutral",
              correlation_status: "Normal",
              regime_confidence: 0
            },
            adaptive_analysis: {
              recommended_focus: "Error",
              pattern_priority: [],
              risk_management_emphasis: "Error",
              entry_strategy: "Error",
              timeframe_preference: "Error"
            },
            regime_change_signals: [],
            adaptation_recommendations: []
          },
          education: {
            concept_explanation: {
              pattern_mechanism: "Error",
              market_psychology: "Error",
              historical_precedent: "Error",
              common_mistakes: [],
              success_factors: []
            },
            skill_building: {
              pattern_recognition_training: "Error",
              risk_management_lessons: "Error",
              market_psychology_insights: "Error",
              advanced_techniques: [],
              practice_exercises: []
            },
            learning_objectives: [],
            difficulty_level: "Beginner",
            time_to_master: "Error"
          }
        };
    }
  }
);

// The main function exported for use in the application.
export async function analyzeChartImage(input: AnalyzeChartImageInput): Promise<AnalyzeChartImageOutput> {
  const enhancedResult = await analyzeChartImageFlow(input);
  
  // Convert enhanced result to legacy format for backward compatibility
  return {
    trend: enhancedResult.analysis.market_structure.primary_trend,
    structure: enhancedResult.analysis.market_structure.market_phase,
    key_levels: {
      support: enhancedResult.analysis.market_structure.liquidity_zones.map(zone => ({ zone, strength: "Strong" })),
      resistance: []
    },
    indicators: [],
    patterns: [],
    entry: enhancedResult.trade_plan.entries[0]?.price?.toString() || "N/A",
    stop_loss: enhancedResult.trade_plan.stops[0]?.price?.toString() || "N/A",
    take_profit: enhancedResult.trade_plan.targets.map(t => t.price.toString()),
    RRR: enhancedResult.trade_plan.risk_reward_ratio.toString(),
    recommendation: enhancedResult.scenarios.base_case.probability > 50 ? "Bullish" : "Bearish",
    reasoning: `Enhanced analysis completed with ${enhancedResult.probability_framework.confidence_scoring.overall_confidence}/10 confidence. Market regime: ${enhancedResult.context_awareness.market_regime.market_type}.`
  };
}
