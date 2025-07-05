'use server';

/**
 * @fileOverview Recognizes technical patterns in a crypto chart image.
 *
 * - recognizeChartPatterns - A function that handles the pattern recognition process.
 * - RecognizeChartPatternsInput - The input type for the function.
 * - RecognizeChartPatternsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { PatternWithProbabilitySchema } from '../schemas';

const RecognizeChartPatternsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A crypto chart image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  tradingStyle: z.string().optional().describe("The user's preferred trading style (e.g., 'Scalper', 'Day Trader', 'Swing Trader', 'Position Trader')."),
});
export type RecognizeChartPatternsInput = z.infer<typeof RecognizeChartPatternsInputSchema>;

const RecognizeChartPatternsOutputSchema = z.object({
  patterns: z.array(PatternWithProbabilitySchema).describe('An array of recognized technical patterns, including their success probability and current status.'),
});
export type RecognizeChartPatternsOutput = z.infer<typeof RecognizeChartPatternsOutputSchema>;

export async function recognizeChartPatterns(input: RecognizeChartPatternsInput): Promise<RecognizeChartPatternsOutput> {
  return recognizeChartPatternsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recognizeChartPatternsPrompt',
  input: {schema: RecognizeChartPatternsInputSchema},
  output: {schema: RecognizeChartPatternsOutputSchema},
  prompt: `You are "CryptoChart Insight," a sophisticated AI trading analysis expert with a specialization in advanced pattern recognition. Your task is to identify high-probability technical analysis patterns in the provided chart image, including their current status.

**Your analysis MUST be tailored to the user's specified trading style: {{tradingStyle}}**
- A 5-minute bull flag is critical for a 'Scalper' but mostly irrelevant for a 'Position Trader'.
- A weekly Head and Shoulders pattern is critical for a 'Swing Trader' but too slow for a 'Day Trader'.
- Prioritize identifying patterns that are most relevant to the timeframe and typical hold period of the specified trading style.

**Pattern Identification & Status Task:**

Based on the chart's context, identify any of the following technical analysis patterns that are relevant to the user's trading style:
- Head and Shoulders (and Inverse)
- Double Top / Double Bottom
- Triangles (Ascending, Descending, Symmetrical)
- Flags and Pennants
- Wedges (Rising, Falling)
- Cup and Handle
- Key Candlestick Patterns at significant levels (e.g., Bullish/Bearish Engulfing, Hammer, Doji at a major support/resistance).

For each pattern you identify, you MUST provide:
1.  **Name**: The name of the pattern.
2.  **Probability**: The estimated probability of the pattern playing out successfully, as a percentage (e.g., "75%").
3.  **Status**: The current status of the pattern. This is a critical field. Use one of the following:
    *   **'Forming'**: The pattern is still developing and not yet complete.
    *   **'Active'**: The pattern is complete and suggests an imminent move.
    *   **'Confirmed'**: A breakout in the expected direction has occurred.
    *   **'Invalidated'**: The pattern has clearly failed (e.g., price broke the neckline of a Head and Shoulders in the wrong direction).

**Crucially, you must actively look for and report on 'Invalidated' patterns.** A failed setup is often a strong signal in the opposite direction and is just as important as a successful pattern.

If no clear patterns (of any status) are visible, return an empty array. Your final output must be only the structured JSON.

Chart Image: {{media url=photoDataUri}}`,
});

const recognizeChartPatternsFlow = ai.defineFlow(
  {
    name: 'recognizeChartPatternsFlow',
    inputSchema: RecognizeChartPatternsInputSchema,
    outputSchema: RecognizeChartPatternsOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      // If the model fails to produce valid output, gracefully return an empty array of patterns
      // to prevent the entire analysis from failing.
      if (!output) {
        return { patterns: [] };
      }
      return output;
    } catch (error) {
      console.error("Error in recognizeChartPatternsFlow:", error);
      // Gracefully return an empty array of patterns to prevent the entire analysis from failing.
      return { patterns: [] };
    }
  }
);
