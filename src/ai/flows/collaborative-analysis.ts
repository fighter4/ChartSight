'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AnalyzeChartImageOutputSchema } from '../schemas';

/**
 * @fileoverview A flow that uses a "team" of AI agents to analyze a chart from different perspectives, now with a more structured final analysis.
 * - collaborativeAnalysis - The main flow function.
 * - CollaborativeAnalysisInput - The Zod schema for the flow's input.
 */

export const CollaborativeAnalysisInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe("A crypto chart image as a data URI."),
  tradingStyle: z
    .string()
    .optional()
    .describe("The user's preferred trading style (e.g., 'Scalper', 'Day Trader', 'Swing Trader', 'Position Trader')."),
});

export type CollaborativeAnalysisInput = z.infer<typeof CollaborativeAnalysisInputSchema>;

// AI Trader 1: The Bull
const bullishTrader = ai.definePrompt({
  name: 'bullishTrader',
  system: `You are "Bullish Betty," an optimistic, aggressive AI trader. Your ONLY job is to find a reason to go LONG on this chart, tailored to the user's trading style. You must ignore all bearish signals and construct the most compelling bullish trade setup you can find. Your output must be a bulleted list containing: Entry, Stop-Loss, Take-Profit, and Justification.`
});

// AI Trader 2: The Bear
const bearishTrader = ai.definePrompt({
  name: 'bearishTrader',
  system: `You are "Bearish Barry," a cautious, pessimistic AI trader. Your ONLY job is to find a reason to go SHORT on this chart, tailored to the user's trading style. You must ignore all bearish signals and construct the most compelling bearish trade setup you can find. Your output must be a bulleted list containing: Entry, Stop-Loss, Take-Profit, and Justification.`
});

// The Final Arbiter: Synthesizes the arguments and the chart into a final, comprehensive analysis.
const finalArbiterPrompt = ai.definePrompt({
  name: 'finalArbiterPrompt',
  output: { schema: AnalyzeChartImageOutputSchema },
  system: `You are the "Final Arbiter," an expert AI analyst. You have received a bullish case and a bearish case from your specialist traders. Your task is to synthesize these viewpoints, conduct your own comprehensive analysis of the chart, and produce a single, final, and balanced trade plan.

**User's Trading Style:** {{tradingStyle}}

**Your analysis must follow this exact methodology and the output must be in the specified JSON format:**

**Part 1: Review and In-depth Analysis**
1.  **Hypothetical Sentiment:** First, generate a plausible, hypothetical sentiment analysis for the asset to frame the context. State an overall sentiment (e.g., Bullish, Bearish, Neutral) and invent 1-2 realistic news catalysts. This should be part of your final 'reasoning'.
2.  **Core Technicals:**
    *   **Trend & Structure:** In the 'trend' and 'structure' fields, describe the dominant trend and current market structure.
    *   **Key Levels:** In the 'key_levels' field, identify the most significant support and resistance zones.
    *   **Indicators:** In the 'indicators' field, analyze all visible indicators.
    *   **Chart Patterns:** In the 'patterns' field, identify any significant chart patterns.

**Part 2: Synthesis & Actionable Trade Plan**
3.  **Synthesize and Reason:** In the 'reasoning' field, provide a comprehensive explanation. Start with your hypothetical sentiment. Then, explicitly reference and weigh the arguments from Bullish Betty and Bearish Barry. Conclude by explaining how the technicals (trend, structure, levels, indicators, patterns) support your final decision over the traders' cases.
4.  **Final Recommendation:** In the 'recommendation' field, state your final, overall bias (e.g., "Siding with the Bull," "Leaning Bearish," "Neutral, waiting for confirmation").
5.  **Trade Plan:** Fill out the 'entry', 'stop_loss', 'take_profit', and 'RRR' fields with a precise and actionable trade plan. This can be an entirely new plan, or you can choose to adopt and refine one of the traders' proposals.

**Bullish Betty's Case:**
{{bullCase}}

**Bearish Barry's Case:**
{{bearCase}}

**Now, perform your full analysis of the chart and provide your final judgment.**
Chart Image: {{media url=photoDataUri}}
`
});

// The main flow that orchestrates the collaborative analysis
export const collaborativeAnalysis = ai.defineFlow(
  {
    name: 'collaborativeAnalysis',
    inputSchema: CollaborativeAnalysisInputSchema,
    outputSchema: AnalyzeChartImageOutputSchema,
  },
  async (input) => {
    try {
        // Run the specialist prompts in parallel
        const [bull, bear] = await Promise.all([
          bullishTrader({
            prompt: `Here is the chart. The user's trading style is: ${input.tradingStyle}. Formulate your bullish case. 
{{media url=${input.photoDataUri}}}`,
          }),
          bearishTrader({
            prompt: `Here is the chart. The user's trading style is: ${input.tradingStyle}. Formulate your bearish case. 
{{media url=${input.photoDataUri}}}`,
          }),
        ]);

        // Synthesize the results in the final arbiter prompt
        const { output } = await finalArbiterPrompt({
            tradingStyle: input.tradingStyle,
            bullCase: bull.text(),
            bearCase: bear.text(),
            photoDataUri: input.photoDataUri,
        });

        if (!output) {
            throw new Error("AI final arbiter failed to generate a result.");
        }

        return output;

    } catch(error: any) {
        console.error("Error in collaborativeAnalysis flow:", error);
        return {
          trend: "Error",
          structure: "An error occurred during collaborative analysis.",
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
