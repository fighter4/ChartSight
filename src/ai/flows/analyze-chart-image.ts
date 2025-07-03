'use server';

/**
 * @fileOverview A crypto chart image analysis AI agent that uses prompt chaining.
 *
 * - analyzeChartImage - A function that handles the chart analysis process.
 * - AnalyzeChartImageInput - The input type for the analyzeChartImage function.
 * - AnalyzeChartImageOutput - The return type for the analyzeChartImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AnalyzeChartImageOutputSchema, KeyLevelWithStrengthSchema, PatternWithProbabilitySchema } from '../schemas';
import { recognizeChartPatterns } from './recognize-chart-patterns';
import { annotateChartImage } from './annotate-chart-image';


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

export async function analyzeChartImage(input: AnalyzeChartImageInput): Promise<AnalyzeChartImageOutput> {
  return analyzeChartImageFlow(input);
}


// Sub-task 1: Extract basic features from the chart
const featureExtractorOutputSchema = z.object({
  trend: AnalyzeChartImageOutputSchema.shape.trend,
  structure: AnalyzeChartImageOutputSchema.shape.structure,
  key_levels: AnalyzeChartImageOutputSchema.shape.key_levels,
  indicators: AnalyzeChartImageOutputSchema.shape.indicators,
});

const featureExtractorPrompt = ai.definePrompt({
  name: 'featureExtractorPrompt',
  input: {schema: AnalyzeChartImageInputSchema},
  output: {schema: featureExtractorOutputSchema},
  prompt: `You are a specialist AI technical analyst. Your task is to perform an initial assessment of the provided chart image, tailored to the user's trading style.
**Trading Style:** {{tradingStyle}}

You must extract the following features:
1.  **Dominant Trend:** (e.g., "Strong short-term uptrend on the 15-minute chart," "Consolidating in a weekly range").
2.  **Market Structure:** (e.g., "Clear higher highs and higher lows on the 4-hour," "Break of structure to the downside on the 1-hour").
3.  **Key Levels & Zones:** Pinpoint the most significant horizontal support and resistance zones. For each zone, provide the price range and assess its strength (e.g., 'Strong', 'Moderate', 'Weak') based on factors like freshness, number of historical touches, and the strength of price reactions from that zone.
4.  **Visible Indicators:** Analyze any indicators present on the chart (RSI, MACD, etc.) and describe their signals. If no indicators are visible, return an empty array.

Your output must be in the specified JSON format.

Chart Image: {{media url=photoDataUri}}`
});


// Sub-task 3: Synthesize features and patterns into a trade plan
const synthesizerInputSchema = featureExtractorOutputSchema.extend({
  photoDataUri: AnalyzeChartImageInputSchema.shape.photoDataUri,
  tradingStyle: AnalyzeChartImageInputSchema.shape.tradingStyle,
  patterns: z.array(PatternWithProbabilitySchema),
});

const synthesizerOutputSchema = z.object({
  entry: AnalyzeChartImageOutputSchema.shape.entry,
  stop_loss: AnalyzeChartImageOutputSchema.shape.stop_loss,
  take_profit: AnalyzeChartImageOutputSchema.shape.take_profit,
  RRR: AnalyzeChartImageOutputSchema.shape.RRR,
  recommendation: AnalyzeChartImageOutputSchema.shape.recommendation,
  reasoning: AnalyzeChartImageOutputSchema.shape.reasoning,
});

const synthesizerPrompt = ai.definePrompt({
    name: 'synthesizerPrompt',
    input: {schema: synthesizerInputSchema},
    output: {schema: synthesizerOutputSchema},
    prompt: `You are "CryptoChart Insight," a sophisticated AI trading analysis expert. You have received preliminary analysis from your specialist agents. Your task is to synthesize this information into a final, actionable trading plan.
**User's Trading Style:** {{tradingStyle}}

**Preliminary Analysis:**
- **Trend:** {{trend}}
- **Structure:** {{structure}}
- **Key Support Zones:** {{#each key_levels.support}}{{this.zone}} ({{this.strength}}){{#unless @last}}, {{/unless}}{{/each}}
- **Key Resistance Zones:** {{#each key_levels.resistance}}{{this.zone}} ({{this.strength}}){{#unless @last}}, {{/unless}}{{/each}}
- **Indicator Signals:** {{#if indicators.length}}{{#each indicators}}{{this.name}}: {{this.signal}}{{#unless @last}}; {{/unless}}{{/each}}{{else}}None provided.{{/if}}
- **Identified Patterns:** {{#if patterns.length}}{{#each patterns}}{{this.name}} (Status: {{this.status}}, Probability: {{this.probability}}){{#unless @last}}; {{/unless}}{{/each}}{{else}}None provided.{{/if}}

**Your Task:**
Based *only* on the preliminary analysis and the chart image, create the final components of the analysis. Your synthesis must consider the status of the identified patterns. An **'Invalidated'** pattern is a critical piece of information and should heavily influence your final recommendation, as it often signals strength in the opposite direction.
1.  **Primary Trade Setup:** Construct the most probable trade setup for the user's trading style.
    *   **Entry:** Define a specific entry point or zone.
    *   **Stop-Loss:** Define a logical stop-loss.
    *   **Take-Profit Levels:** Define at least two logical take-profit levels.
    *   **Risk-Reward Ratio (RRR):** Calculate the RRR for the trade to TP1.
2.  **Final Recommendation:** State a final, overall bias (e.g., "Cautiously Bullish on an intraday basis") and provide a concise summary.
3.  **Reasoning:** Provide a step-by-step explanation for your synthesis and final trade plan. This should explain how the preliminary data, especially the status of any patterns (confirmed, active, or invalidated), leads to your conclusion.

Your output must be in the specified JSON format.

Chart Image: {{media url=photoDataUri}}`
});


const analyzeChartImageFlow = ai.defineFlow(
  {
    name: 'analyzeChartImageFlow',
    inputSchema: AnalyzeChartImageInputSchema,
    outputSchema: AnalyzeChartImageOutputSchema,
  },
  async (input) => {
    try {
        // Step 1 & 2: Extract features and recognize patterns in parallel to save time.
        const [featureResult, patternResult] = await Promise.all([
            featureExtractorPrompt(input),
            recognizeChartPatterns(input), // This is the imported flow for sub-task 2
        ]);
        
        const features = featureResult.output;
        const patterns = patternResult.patterns;

        if (!features) {
            throw new Error("AI feature extraction failed.");
        }

        // Step 3: Synthesize the final analysis using the results from the previous steps.
        const synthesisInput = {
            ...input,
            ...features,
            patterns: patterns || [],
        };
        
        const { output: synthesisResult } = await synthesizerPrompt(synthesisInput);

        if (!synthesisResult) {
            throw new Error("AI synthesis failed.");
        }

        // Combine all parts into the final output object.
        const finalAnalysis: AnalyzeChartImageOutput = {
            ...features,
            patterns: patterns || [],
            ...synthesisResult,
        };

        // Step 4: Annotate image (optional step)
        try {
            const { annotatedPhotoDataUri } = await annotateChartImage({
                photoDataUri: input.photoDataUri,
                analysis: finalAnalysis,
            });
            finalAnalysis.annotatedPhotoDataUri = annotatedPhotoDataUri;
        } catch (annotationError: any) {
            console.warn("Image annotation failed, proceeding without it:", annotationError.message);
            // Don't throw an error here, just proceed without the annotated image.
        }

        return finalAnalysis;

    } catch(error: any) {
        console.error("Error in analyzeChartImageFlow:", error);
        // Return a structured error to be handled by the frontend.
        // This is better than throwing, which might crash the server route.
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
