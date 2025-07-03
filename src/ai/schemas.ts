import {z} from 'genkit';

export const KeyLevelWithStrengthSchema = z.object({
  zone: z.string().describe('The price range of the zone (e.g., "45000-45500").'),
  strength: z.string().describe("The assessed strength of the zone (e.g., 'Strong', 'Moderate', 'Weak')."),
});

export const PatternWithProbabilitySchema = z.object({
  name: z
    .string()
    .describe(
      'The name of the identified pattern (e.g., "Bull Flag", "Doji").'
    ),
  probability: z
    .string()
    .describe(
      'The estimated probability of the pattern playing out successfully, as a percentage (e.g., "75%"). This should be based on general historical performance for this pattern type.'
    ),
  status: z
    .string()
    .describe(
      "The current status of the pattern (e.g., 'Active', 'Forming', 'Confirmed', 'Invalidated')."
    ),
});

export const AnalyzeChartImageOutputSchema = z.object({
  trend: z
    .string()
    .describe('The overall market trend (e.g., "Bullish", "Bearish", "Sideways").'),
  structure: z
    .string()
    .describe(
      'The current market structure (e.g., "Higher Highs, Higher Lows", "Lower Highs, Lower Lows").'
    ),
  key_levels: z
    .object({
      support: z
        .array(KeyLevelWithStrengthSchema)
        .describe(
          'Array of key support zones, including their price range and assessed strength.'
        ),
      resistance: z
        .array(KeyLevelWithStrengthSchema)
        .describe(
          'Array of key resistance zones, including their price range and assessed strength.'
        ),
    })
    .describe('Key support and resistance zones, graded by strength.'),
  indicators: z
    .array(
      z.object({
        name: z
          .string()
          .describe("The name of the indicator (e.g., 'RSI', 'MACD')."),
        signal: z
          .string()
          .describe(
            "The interpretation of the indicator's signal (e.g., 'Bullish Divergence', 'Bearish Cross')."
          ),
      })
    )
    .describe('An array of objects summarizing signals from visible indicators.'),
  patterns: z
    .array(PatternWithProbabilitySchema)
    .describe(
      'An array of identified chart or candlestick patterns, including their success probability and current status.'
    ),
  entry: z
    .string()
    .describe('A suggested entry point or zone for a potential trade.'),
  stop_loss: z.string().describe('A suggested stop-loss level for the trade.'),
  take_profit: z
    .array(z.string())
    .describe('An array of suggested take-profit levels (TP1, TP2, etc.).'),
  RRR: z
    .string()
    .describe('The calculated Risk-Reward Ratio for the trade setup (e.g., "1:3").'),
  recommendation: z
    .string()
    .describe('A final, concise recommendation and summary of the analysis.'),
  reasoning: z
    .string()
    .describe('A step-by-step explanation of the analysis process, outlining how the conclusion was reached. This should be formatted with Markdown for clarity (e.g., using headings and bullet points).'),
  annotatedPhotoDataUri: z
    .string()
    .optional()
    .describe(
      'A data URI of the chart image with annotations drawn on it by the AI.'
    ),
});
