'use server';

/**
 * @fileOverview Advanced Pattern Recognition Engine with institutional-grade pattern analysis, evolution tracking, and psychology insights.
 * - recognizeChartPatterns - A function that handles advanced pattern recognition with comprehensive validation.
 * - RecognizeChartPatternsInput - The input type for the function.
 * - RecognizeChartPatternsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { EnhancedPatternSchema } from '../schemas';

const RecognizeChartPatternsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A crypto chart image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  tradingStyle: z.string().optional().describe("The user's preferred trading style (e.g., 'Scalper', 'Day Trader', 'Swing Trader', 'Position Trader')."),
  timeframe: z.string().optional().describe("The timeframe of the chart (e.g., '1m', '5m', '15m', '1h', '4h', '1d', '1w')."),
});
export type RecognizeChartPatternsInput = z.infer<typeof RecognizeChartPatternsInputSchema>;

const RecognizeChartPatternsOutputSchema = z.object({
  patterns: z.array(EnhancedPatternSchema).describe("Array of identified patterns with comprehensive analysis"),
  pattern_summary: z.string().describe("Summary of all identified patterns"),
  market_context: z.string().describe("Overall market context based on pattern analysis"),
  trading_opportunities: z.array(z.string()).describe("Specific trading opportunities identified"),
});
export type RecognizeChartPatternsOutput = z.infer<typeof RecognizeChartPatternsOutputSchema>;

export async function recognizeChartPatterns(
  input: RecognizeChartPatternsInput
): Promise<RecognizeChartPatternsOutput> {
  return recognizeChartPatternsFlow(input);
}

// Advanced Pattern Recognition Engine
const advancedPatternRecognitionPrompt = ai.definePrompt({
    name: 'advancedPatternRecognitionPrompt',
    input: { schema: RecognizeChartPatternsInputSchema },
    output: { schema: RecognizeChartPatternsOutputSchema },
    prompt: `You are an elite pattern recognition specialist with 20+ years of institutional trading experience. Your task is to identify, validate, and predict the evolution of chart patterns with surgical precision.

**User's Trading Style:** {{tradingStyle}}
**Chart Timeframe:** {{timeframe}}

### Enhanced Pattern Analysis Framework

**Primary Analysis Categories:**

1. **Classical Patterns:**
   - Head & Shoulders (regular and inverted)
   - Triangles (ascending, descending, symmetrical, expanding)
   - Flags and Pennants (bull and bear)
   - Wedges (rising and falling)
   - Double/Triple Tops and Bottoms
   - Cup and Handle, Rounding patterns

2. **Advanced Patterns:**
   - Wyckoff Accumulation/Distribution phases
   - Elliott Wave structures (impulse and corrective waves)
   - Harmonic patterns (Gartley, Butterfly, Crab, Bat, Shark)
   - Fibonacci retracement and extension patterns
   - ABCD patterns and extensions

3. **Institutional Patterns:**
   - Order blocks (bullish and bearish)
   - Fair Value Gaps (FVG)
   - Liquidity sweeps and equal highs/lows
   - Smart Money Concepts (SMC)
   - Institutional order flow zones
   - Break of structure (BOS) and change of character (CHoCH)

4. **Volume-Based Patterns:**
   - Volume Profile imbalances
   - VPOC (Volume Point of Control) shifts
   - Volume Spread Analysis (VSA)
   - Accumulation/Distribution patterns
   - Volume climax patterns

**Pattern Validation Matrix:**
For each identified pattern, provide:
1. **Formation Quality (1-10)**: Rate the textbook accuracy and clarity
2. **Volume Confirmation (1-10)**: Volume pattern alignment with price action
3. **Market Context (1-10)**: How well it fits broader market structure
4. **Timeframe Confluence (1-10)**: Multi-timeframe validation
5. **Probability Score (1-100%)**: Likelihood of expected outcome

**Pattern Evolution Tracking:**
- **Stage 1**: Initial formation (0-25% complete) - Pattern structure emerging
- **Stage 2**: Development (25-75% complete) - Pattern taking shape
- **Stage 3**: Maturation (75-95% complete) - Pattern nearly complete
- **Stage 4**: Breakout/Breakdown imminent (95-100%) - Decision point
- **Stage 5**: Confirmed completion - Pattern has played out
- **Stage 6**: Target achievement or failure - Final outcome

**Advanced Pattern Psychology:**
Analyze the psychological dynamics:
- **Retail Sentiment**: What retail traders likely see and how they're positioned
- **Smart Money Activity**: Evidence of institutional positioning and accumulation/distribution
- **Liquidity Analysis**: Where stops and targets cluster, equal highs/lows
- **False Signal Probability**: Likelihood of fakeout/shakeout based on pattern quality

### Trading Style Adaptation Matrix

**Scalper (1-15 min timeframes):**
- Focus on micro-patterns, order flow, bid/ask dynamics
- Identify 5-pip to 20-pip opportunities
- Emphasize Level 2 data interpretation
- Flag patterns, mini-triangles, support/resistance bounces
- Volume profile micro-structures

**Day Trader (15min-4hr timeframes):**
- Classical patterns with intraday bias
- Confluence with session opens/closes (London, NY, Asia)
- News event pattern disruptions
- Momentum continuation patterns
- Gap trading setups

**Swing Trader (4hr-Daily timeframes):**
- Multi-day pattern development
- Weekly/monthly level interactions
- Earnings/event-driven pattern modifications
- Seasonal pattern tendencies
- Sector rotation patterns

**Position Trader (Daily-Weekly timeframes):**
- Major trend continuation/reversal patterns
- Macro-economic pattern influences
- Long-term Elliott Wave analysis
- Quarterly/annual pattern cycles
- Fundamental catalyst integration

### Pattern Recognition Instructions:

1. **Scan for Multiple Pattern Types**: Look for classical, advanced, institutional, and volume-based patterns simultaneously
2. **Validate Each Pattern**: Apply the validation matrix to every identified pattern
3. **Assess Evolution Stage**: Determine which stage each pattern is in
4. **Analyze Psychology**: Consider retail vs. smart money positioning
5. **Adapt to Trading Style**: Focus on patterns relevant to the user's timeframe
6. **Identify Confluences**: Look for multiple patterns confirming each other
7. **Assess Risk/Reward**: Calculate probability-weighted outcomes

**Chart Image:**
{{media url=photoDataUri}}

**Output Requirements:**
Provide a comprehensive pattern analysis including all identified patterns with their validation scores, evolution stages, psychological analysis, and trading opportunities. Focus on patterns most relevant to the user's trading style and timeframe.`
});

const recognizeChartPatternsFlow = ai.defineFlow(
  {
    name: 'recognizeChartPatternsFlow',
    inputSchema: RecognizeChartPatternsInputSchema,
    outputSchema: RecognizeChartPatternsOutputSchema,
  },
  async (input): Promise<RecognizeChartPatternsOutput> => {
    const {output} = await advancedPatternRecognitionPrompt(input);
    if (!output) {
      return { 
        patterns: [],
        pattern_summary: "No clear patterns identified",
        market_context: "Insufficient data for pattern analysis",
        trading_opportunities: []
      };
    }
    return output;
  }
);
