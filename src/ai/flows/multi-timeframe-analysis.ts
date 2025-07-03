'use server';

/**
 * @fileOverview A multi-timeframe chart analysis AI agent.
 *
 * - multiTimeframeAnalysis - A function that handles the multi-timeframe analysis process.
 * - MultiTimeframeAnalysisInput - The input type for the function.
 * - MultiTimeframeAnalysisOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AnalyzeChartImageOutputSchema } from '../schemas';

const MultiTimeframeAnalysisInputSchema = z.object({
  htfPhotoDataUri: z.string().describe("The highest timeframe chart image as a data URI."),
  mtfPhotoDataUri: z.string().optional().describe("The medium timeframe chart image as a data URI."),
  ltfPhotoDataUri: z.string().optional().describe("The lowest timeframe chart image as a data URI."),
  tradingStyle: z.string().optional().describe("The user's preferred trading style (e.g., 'Scalper', 'Day Trader', 'Swing Trader', 'Position Trader')."),
});
export type MultiTimeframeAnalysisInput = z.infer<typeof MultiTimeframeAnalysisInputSchema>;
export type MultiTimeframeAnalysisOutput = z.infer<typeof AnalyzeChartImageOutputSchema>;

export async function multiTimeframeAnalysis(input: MultiTimeframeAnalysisInput): Promise<MultiTimeframeAnalysisOutput> {
  return multiTimeframeAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'multiTimeframeAnalysisPrompt',
  input: {schema: MultiTimeframeAnalysisInputSchema},
  output: {schema: AnalyzeChartImageOutputSchema},
  prompt: `You are an expert technical analyst specializing in multi-timeframe analysis (MTA). Your task is to synthesize insights from up to three chart images, provided in order from highest timeframe (HTF) to lowest timeframe (LTF), to create a single, cohesive trade plan.

**Your analysis MUST be tailored to the user's specified trading style: {{tradingStyle}}**

**Multi-Timeframe Analysis Workflow:**
1.  **HTF Analysis (Primary Context):** Analyze the first image (HTF Chart) to determine the dominant, overarching trend, market structure, and key supply/demand zones. This sets the primary bias (bullish or bearish).
2.  **MTF Analysis (Refinement):** Analyze the second image (MTF Chart, if provided) to see how price is behaving within the HTF context. Look for secondary trends, structures, or reactions at HTF key levels.
3.  **LTF Analysis (Entry & Confirmation):** Analyze the third image (LTF Chart, if provided) to find specific, low-risk entry opportunities that align with the bias established by the higher timeframes. Look for chart patterns, candlestick confirmations, or changes of character.
4.  **Synthesis & Trade Plan:** Combine all insights into a single, unified analysis. The final trade plan (entry, stop-loss, take-profit) must be based on a confluence of factors across the timeframes. If there is no alignment between timeframes, recommend "NO TRADE" and explain why.
5.  **Fill all fields of the output schema**, including trend, structure, key levels, patterns (from any timeframe), the final trade setup, a recommendation, and detailed reasoning that explains your MTA process.

**Charts:**
- **HTF Chart:** {{media url=htfPhotoDataUri}}
{{#if mtfPhotoDataUri}}
- **MTF Chart:** {{media url=mtfPhotoDataUri}}
{{/if}}
{{#if ltfPhotoDataUri}}
- **LTF Chart:** {{media url=ltfPhotoDataUri}}
{{/if}}

Your output must be in the specified JSON format.`
});

const multiTimeframeAnalysisFlow = ai.defineFlow(
  {
    name: 'multiTimeframeAnalysisFlow',
    inputSchema: MultiTimeframeAnalysisInputSchema,
    outputSchema: AnalyzeChartImageOutputSchema,
  },
  async (input) => {
     try {
        const { output } = await prompt(input);
        
        if (!output) {
            throw new Error("AI multi-timeframe analysis failed to produce a result.");
        }
        
        return output;

    } catch(error: any) {
        console.error("Error in multiTimeframeAnalysisFlow:", error);
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
