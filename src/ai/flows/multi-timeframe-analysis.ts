'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AnalyzeChartImageOutputSchema } from '../schemas';

/**
 * @fileoverview A flow that synthesizes analysis from multiple chart timeframes using a comprehensive, single-prompt methodology.
 * - multiTimeframeAnalysis - The main flow function.
 * - MultiTimeframeAnalysisInput - The Zod schema for the flow's input.
 */

export const MultiTimeframeAnalysisInputSchema = z.object({
    photoDataUris: z.array(z.string()).max(3).describe('An array of up to 3 chart image data URIs, ordered from highest to lowest timeframe.'),
    tradingStyle: z.string().optional().describe("The user's preferred trading style (e.g., 'Scalper', 'Day Trader', 'Swing Trader', 'Position Trader')."),
});

export type MultiTimeframeAnalysisInput = z.infer<typeof MultiTimeframeAnalysisInputSchema>;

// This single, comprehensive prompt defines the AI's entire multi-timeframe analysis process.
const multiTimeframeAnalysisPrompt = ai.definePrompt({
    name: 'multiTimeframeAnalysisPrompt',
    input: {schema: MultiTimeframeAnalysisInputSchema},
    output: {schema: AnalyzeChartImageOutputSchema},
    prompt: `You are an expert AI technical analyst specializing in multi-timeframe analysis (MTA). Your task is to conduct a comprehensive analysis of the provided cryptocurrency chart images (from highest to lowest timeframe) and synthesize a complete trade plan, tailored to the user's trading style.

**User's Trading Style:** {{tradingStyle}}

**Your analysis must follow this exact methodology and the output must be in the specified JSON format:**

**Part 1: Full-Spectrum, Multi-Timeframe Analysis**
1.  **Hypothetical Sentiment:** First, generate a plausible, hypothetical sentiment analysis for the asset. State an overall sentiment (e.g., Bullish, Bearish, Neutral) and invent 1-2 realistic news catalysts. This should be part of your final 'reasoning'.
2.  **Top-Down Technicals:**
    *   **Trend & Structure:** In the 'trend' and 'structure' fields, synthesize your analysis from all timeframes. Start with the highest timeframe to establish the primary trend, then refine this with the lower timeframes to describe the current market structure.
    *   **Key Levels:** In the 'key_levels' field, identify the most significant support and resistance zones, noting if a level is significant on multiple timeframes.
    *   **Indicators:** In the 'indicators' field, summarize the signals from any visible indicators across all timeframes, noting any convergences or divergences.
    *   **Chart Patterns:** In the 'patterns' field, identify any significant chart patterns, noting which timeframe they appear on and their current status.

**Part 2: Synthesis & Actionable Trade Plan**
3.  **Synthesize and Reason:** In the 'reasoning' field, provide a comprehensive explanation that synthesizes all the points above. Your reasoning must start with the hypothetical sentiment, then provide a "Bull Case vs. Bear Case" summary, explaining how different timeframes might support each view. Finally, explain how the technicals from all timeframes confluence to support your final conclusion.
4.  **Final Recommendation:** In the 'recommendation' field, state your final, overall bias (e.g., "Cautiously Bullish," "Strongly Bearish"). This should be heavily influenced by the higher timeframe context.
5.  **Trade Plan:** Fill out the 'entry', 'stop_loss', 'take_profit', and 'RRR' fields with a precise and actionable trade plan, typically using the lowest timeframe for execution but in alignment with the higher timeframe analysis.

**Chart Images (Highest to Lowest Timeframe):**
{{#each photoDataUris}}
- Chart Image (Timeframe {{add @index 1}}): {{media url=this}}
{{/each}}
`
});

// This flow orchestrates the analysis process.
export const multiTimeframeAnalysis = ai.defineFlow(
  {
    name: 'multiTimeframeAnalysis',
    inputSchema: MultiTimeframeAnalysisInputSchema,
    outputSchema: AnalyzeChartImageOutputSchema,
  },
  async (input) => {
    try {
        const { output } = await multiTimeframeAnalysisPrompt(input);

        if (!output) {
            throw new Error("AI analysis failed to generate a result.");
        }
        
        return output;

    } catch (error: any) {
        console.error("Error in multiTimeframeAnalysis flow:", error);
        // Return a structured error to be handled by the frontend.
        return {
          trend: "Error",
          structure: "An error occurred during multi-timeframe analysis.",
          key_levels: { support: [], resistance: [] },
          indicators: [],
          patterns: [],
          entry: "N/A",
          stop_loss: "N/A",
          take_profit: [],
          RRR: "N/A",
          recommendation: `Analysis failed: ${error.message || 'Unknown error'}. Please try again.`,
          reasoning: `The analysis could not be completed due to an internal error: ${error.message}`,
        };
    }
  }
);
