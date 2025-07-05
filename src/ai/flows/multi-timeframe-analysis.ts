'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { MultiTimeframeAnalysisSchema, ConfluenceAnalysisSchema, UnifiedStrategySchema } from '../schemas';

/**
 * @fileOverview Enhanced Multi-Timeframe Synthesis Engine with fractal analysis, timeframe compression, and advanced MTF concepts.
 * - multiTimeframeAnalysis - A function that handles enhanced multi-timeframe analysis with advanced synthesis.
 * - MultiTimeframeAnalysisInput - The input type for the function.
 * - MultiTimeframeAnalysisOutput - The return type for the function.
 */

const MultiTimeframeAnalysisInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A crypto chart image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  tradingStyle: z.string().optional().describe("The user's preferred trading style (e.g., 'Scalper', 'Day Trader', 'Swing Trader', 'Position Trader')."),
  primaryTimeframe: z.string().optional().describe("The primary timeframe for analysis (e.g., '1h', '4h', '1d')."),
});
export type MultiTimeframeAnalysisInput = z.infer<typeof MultiTimeframeAnalysisInputSchema>;

const MultiTimeframeAnalysisOutputSchema = z.object({
  timeframe_analysis: z.object({
    monthly: MultiTimeframeAnalysisSchema.optional(),
    weekly: MultiTimeframeAnalysisSchema.optional(),
    daily: MultiTimeframeAnalysisSchema.optional(),
    four_hour: MultiTimeframeAnalysisSchema.optional(),
    one_hour: MultiTimeframeAnalysisSchema.optional(),
    fifteen_minute: MultiTimeframeAnalysisSchema.optional(),
    five_minute: MultiTimeframeAnalysisSchema.optional(),
    one_minute: MultiTimeframeAnalysisSchema.optional(),
  }).describe("Analysis for each timeframe"),
  confluence_analysis: ConfluenceAnalysisSchema,
  unified_strategy: UnifiedStrategySchema,
  fractal_analysis: z.object({
    fractal_patterns: z.array(z.string()).describe("Similar patterns across timeframes"),
    fractal_confidence: z.number().min(1).max(10).describe("Confidence in fractal analysis"),
    fractal_implications: z.string().describe("Implications of fractal patterns")
  }).describe("Fractal analysis results"),
  timeframe_compression: z.object({
    compression_zones: z.array(z.string()).describe("Zones where timeframes converge"),
    compression_strength: z.number().min(1).max(10).describe("Strength of timeframe compression"),
    compression_implications: z.string().describe("Trading implications of compression")
  }).describe("Timeframe compression analysis"),
  higher_timeframe_bias: z.object({
    bias_direction: z.string().describe("Higher timeframe bias direction"),
    bias_strength: z.number().min(1).max(10).describe("Strength of higher timeframe bias"),
    bias_implications: z.string().describe("Implications for lower timeframe decisions")
  }).describe("Higher timeframe bias analysis"),
  divergence_analysis: z.object({
    divergences: z.array(z.string()).describe("Timeframe divergences identified"),
    divergence_impact: z.string().describe("Impact of divergences on analysis"),
    resolution_strategy: z.string().describe("Strategy to resolve divergences")
  }).describe("Timeframe divergence analysis")
});
export type MultiTimeframeAnalysisOutput = z.infer<typeof MultiTimeframeAnalysisOutputSchema>;

export async function multiTimeframeAnalysis(
  input: MultiTimeframeAnalysisInput
): Promise<MultiTimeframeAnalysisOutput> {
  return multiTimeframeAnalysisFlow(input);
}

// Enhanced Multi-Timeframe Synthesis Engine
const enhancedMultiTimeframePrompt = ai.definePrompt({
    name: 'enhancedMultiTimeframePrompt',
    input: { schema: MultiTimeframeAnalysisInputSchema },
    output: { schema: MultiTimeframeAnalysisOutputSchema },
    prompt: `You are a master of multi-timeframe analysis, capable of synthesizing complex market dynamics across all relevant timeframes to provide a unified, actionable perspective with institutional-grade insights.

**User's Trading Style:** {{tradingStyle}}
**Primary Timeframe:** {{primaryTimeframe}}

### Enhanced MTF Framework

**Timeframe Hierarchy Analysis:**
1. **Macro View** (Monthly/Weekly): Long-term trend and structure, institutional positioning
2. **Swing View** (Daily/4hr): Intermediate-term patterns, major support/resistance
3. **Tactical View** (1hr/15min): Short-term execution levels, entry/exit timing
4. **Micro View** (5min/1min): Precise entry/exit timing, order flow analysis

**Advanced Cross-Timeframe Confluence Analysis:**
- **Trend Alignment Score**: How well trends align across timeframes (1-10 scale)
- **Support/Resistance Confluence**: Levels confirmed on multiple timeframes with strength ratings
- **Pattern Confirmation**: Patterns that appear across timeframes with probability scores
- **Volume Validation**: Volume patterns consistent across timeframes
- **Momentum Convergence**: Momentum indicators aligned across timeframes

### Advanced MTF Concepts

**1. Fractal Analysis:**
- **Fractal Pattern Recognition**: Similar patterns on different timeframes
- **Fractal Confidence Scoring**: Reliability of fractal patterns (1-10 scale)
- **Fractal Implications**: How fractal patterns influence trading decisions
- **Fractal Completion**: Expected completion of fractal patterns

**2. Higher Timeframe Bias:**
- **HTF Trend Influence**: How higher timeframe trends influence lower timeframe decisions
- **HTF Bias Strength**: Strength of higher timeframe influence (1-10 scale)
- **HTF Bias Direction**: Bullish, bearish, or neutral bias from higher timeframes
- **HTF Bias Implications**: Specific implications for lower timeframe trading

**3. Timeframe Compression:**
- **Compression Zone Identification**: When multiple timeframes converge on same levels
- **Compression Strength**: Strength of timeframe convergence (1-10 scale)
- **Compression Implications**: Trading opportunities from timeframe compression
- **Compression Breakout**: Expected outcomes when compression resolves

**4. Divergence Identification:**
- **Timeframe Divergences**: When timeframes disagree on direction
- **Divergence Impact**: How divergences affect trading decisions
- **Divergence Resolution**: Strategies to resolve timeframe conflicts
- **Divergence Probability**: Likelihood of divergence resolution

### Enhanced Trade Planning with MTF

**Entry Strategy with HTF Confirmation:**
- **HTF Confirmation**: Higher timeframe supports direction
- **LTF Precision**: Lower timeframe provides exact entry
- **Confluence Zones**: Multiple timeframe level alignment
- **Risk Assessment**: How much risk each timeframe suggests

**Advanced Risk Management:**
- **Multi-Timeframe Stops**: Stops based on multiple timeframe levels
- **Timeframe Correlation Risk**: Risk from timeframe misalignment
- **Fractal Risk Management**: Risk management based on fractal patterns
- **Compression Risk**: Risk management during timeframe compression

### Trading Style Adaptation

**Scalper MTF Focus:**
- Primary: 1min-5min patterns
- Secondary: 15min-1hr confluence
- Tertiary: 4hr bias for direction
- Emphasis: Order flow, micro-patterns, rapid execution

**Day Trader MTF Focus:**
- Primary: 15min-1hr patterns
- Secondary: 4hr-1d confluence
- Tertiary: Weekly bias for direction
- Emphasis: Session patterns, intraday momentum

**Swing Trader MTF Focus:**
- Primary: 4hr-1d patterns
- Secondary: 1d-1w confluence
- Tertiary: Monthly bias for direction
- Emphasis: Multi-day patterns, weekly levels

**Position Trader MTF Focus:**
- Primary: 1d-1w patterns
- Secondary: 1w-1m confluence
- Tertiary: Quarterly bias for direction
- Emphasis: Long-term trends, macro analysis

### Analysis Instructions:

1. **Analyze Each Timeframe**: Provide trend, key levels, and patterns for each relevant timeframe
2. **Identify Confluences**: Find levels and patterns that align across timeframes
3. **Detect Fractals**: Look for similar patterns across different timeframes
4. **Assess HTF Bias**: Determine higher timeframe influence on lower timeframes
5. **Find Compression**: Identify zones where timeframes converge
6. **Spot Divergences**: Identify when timeframes disagree
7. **Synthesize Strategy**: Create unified strategy incorporating all timeframes
8. **Adapt to Trading Style**: Focus on timeframes relevant to user's style

**Chart Image:**
{{media url=photoDataUri}}

**Output Requirements:**
Provide comprehensive multi-timeframe analysis including timeframe-specific analysis, confluence assessment, fractal patterns, higher timeframe bias, timeframe compression zones, divergence identification, and unified trading strategy adapted to the user's trading style.`
});

const multiTimeframeAnalysisFlow = ai.defineFlow(
  {
    name: 'multiTimeframeAnalysisFlow',
    inputSchema: MultiTimeframeAnalysisInputSchema,
    outputSchema: MultiTimeframeAnalysisOutputSchema,
  },
  async (input): Promise<MultiTimeframeAnalysisOutput> => {
    const {output} = await enhancedMultiTimeframePrompt(input);
    if (!output) {
      throw new Error("Multi-timeframe analysis failed to generate a result.");
    }
    return output;
  }
);
