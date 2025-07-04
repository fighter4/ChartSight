'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AnalyzeChartImageOutputSchema, PatternWithProbabilitySchema } from '../schemas';
import { annotateChartImage } from './annotate-chart-image';
import { recognizeChartPatterns } from './recognize-chart-patterns';

/**
 * @fileOverview A crypto chart image analysis AI agent that uses a comprehensive, single-prompt methodology.
 *
 * - analyzeChartImage - A function that handles the chart analysis process.
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

// This single, comprehensive prompt defines the AI's entire analysis process.
const comprehensiveAnalysisPrompt = ai.definePrompt({
    name: 'comprehensiveAnalysisPrompt',
    input: { schema: AnalyzeChartImageInputSchema.extend({ patterns: z.array(PatternWithProbabilitySchema) }) },
    output: { schema: AnalyzeChartImageOutputSchema },
    prompt: `You are an expert AI technical analyst. Your task is to conduct a comprehensive analysis of the provided cryptocurrency chart image and synthesize a complete trade plan, tailored to the user's trading style.

**User's Trading Style:** {{tradingStyle}}

**Your analysis must follow this exact methodology and the output must be in the specified JSON format:**

**Part 1: Full-Spectrum Analysis**
1.  **Hypothetical Sentiment:** First, generate a plausible, hypothetical sentiment analysis for the asset. State an overall sentiment (e.g., Bullish, Bearish, Neutral) and invent 1-2 realistic news catalysts. This should be part of your final 'reasoning'.
2.  **Core Technicals:**
    *   **Trend & Structure:** In the 'trend' and 'structure' fields, describe the dominant trend and current market structure.
    *   **Key Levels:** In the 'key_levels' field, identify the most significant support and resistance zones, assessing their strength.
    *   **Indicators:** In the 'indicators' field, analyze all visible indicators (RSI, MACD, MAs, etc.), describing their readings and implications.
    *   **Chart Patterns:** In the 'patterns' field, use the pre-identified list of patterns provided below. The status of a pattern (e.g., 'Invalidated', 'Confirmed') is critical.

**Part 2: Synthesis & Actionable Trade Plan**
3.  **Synthesize and Reason:** In the 'reasoning' field, provide a comprehensive explanation that synthesizes all the points above. Your reasoning must start with the hypothetical sentiment, then discuss how the technicals (trend, structure, levels, indicators, patterns) support your conclusion. You must also include a brief "Bull Case vs. Bear Case" summary within your reasoning.
4.  **Final Recommendation:** In the 'recommendation' field, state your final, overall bias (e.g., "Cautiously Bullish," "Strongly Bearish").
5.  **Trade Plan:** Fill out the 'entry', 'stop_loss', 'take_profit', and 'RRR' fields with a precise and actionable trade plan.

**Pre-Identified Patterns to Consider:**
{{#if patterns.length}}
{{#each patterns}}
- {{this.name}} (Status: {{this.status}}, Probability: {{this.probability}})
{{/each}}
{{else}}
- None pre-identified.
{{/if}}

**Chart Image:**
{{media url=photoDataUri}}
`,
});

// This flow orchestrates the analysis process.
export const analyzeChartImageFlow = ai.defineFlow(
  {
    name: 'analyzeChartImageFlow',
    inputSchema: AnalyzeChartImageInputSchema,
    outputSchema: AnalyzeChartImageOutputSchema,
  },
  async (input) => {
    try {
        // Step 1: Recognize patterns as a preliminary step.
        const patternResult = await recognizeChartPatterns(input);
        const patterns = patternResult.patterns || [];

        // Step 2: Run the comprehensive analysis, feeding it the identified patterns.
        const analysisInput = { ...input, patterns };
        const { output: analysisResult } = await comprehensiveAnalysisPrompt(analysisInput);

        if (!analysisResult) {
            throw new Error("AI analysis failed to generate a result.");
        }
        
        // Ensure the final object has the patterns, even if the LLM forgets to include them.
        analysisResult.patterns = patterns;

        // Step 3: Annotate the image with the final analysis.
        try {
            const { annotatedPhotoDataUri } = await annotateChartImage({
                photoDataUri: input.photoDataUri,
                analysis: analysisResult,
            });
            analysisResult.annotatedPhotoDataUri = annotatedPhotoDataUri;
        } catch (annotationError: any) {
            console.warn("Image annotation failed, proceeding without it:", annotationError.message);
        }

        return analysisResult;

    } catch(error: any) {
        console.error("Error in analyzeChartImageFlow:", error);
        // Return a structured error to be handled by the frontend.
        return {
          trend: "Error",
          structure: "An error occurred during analysis.",
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

// The main function exported for use in the application.
export async function analyzeChartImage(input: AnalyzeChartImageInput): Promise<AnalyzeChartImageOutput> {
  return analyzeChartImageFlow(input);
}
