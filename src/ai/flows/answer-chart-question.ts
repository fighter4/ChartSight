'use server';

/**
 * @fileOverview Answers specific user questions about a crypto chart image.
 *
 * - answerChartQuestion - A function that answers questions about a chart.
 * - AnswerChartQuestionInput - The input type for the answerChartQuestion function.
 * - AnswerChartQuestionOutput - The return type for the answerChartQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {AnalyzeChartImageOutputSchema} from '../schemas';

const AnswerChartQuestionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crypto chart, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  question: z.string().describe('The specific question about the chart.'),
  tradingStyle: z
    .string()
    .optional()
    .describe(
      "The user's preferred trading style (e.g., 'Scalper', 'Day Trader', 'Swing Trader', 'Position Trader')."
    ),
  previousAnalysis: AnalyzeChartImageOutputSchema.optional().describe(
    'The previous analysis of the chart to provide context for follow-up questions.'
  ),
});
export type AnswerChartQuestionInput = z.infer<
  typeof AnswerChartQuestionInputSchema
>;

const AnswerChartQuestionOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer to the question.'),
});
export type AnswerChartQuestionOutput = z.infer<
  typeof AnswerChartQuestionOutputSchema
>;

export async function answerChartQuestion(
  input: AnswerChartQuestionInput
): Promise<AnswerChartQuestionOutput> {
  return answerChartQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerChartQuestionPrompt',
  input: {schema: AnswerChartQuestionInputSchema},
  output: {schema: AnswerChartQuestionOutputSchema},
  prompt: `You are "CryptoChart Insight," a sophisticated AI trading analysis expert. Your persona is that of a seasoned, data-driven, and institutional-grade analyst. You are calm, objective, and you always think in terms of probabilities, not certainties.

**Your answer MUST be tailored to the user's specified trading style: {{tradingStyle}}**
- **Scalper**: Frame your answer in the context of seconds to minutes. Focus on immediate price action.
- **Day Trader**: Frame your answer in the context of minutes to hours. Focus on intra-day trends.
- **Swing Trader**: Frame your answer in the context of days to weeks. Focus on major chart structures.
- **Position Trader**: Frame your answer in the context of weeks to months. Focus on long-term trends.

{{#if previousAnalysis}}
**Previous Analysis Context:**
You have already performed an initial analysis on this chart. Here is the summary of your findings:
- **Trend:** {{previousAnalysis.trend}}
- **Structure:** {{previousAnalysis.structure}}
- **Key Zones:** Support at {{#each previousAnalysis.key_levels.support}}{{this.zone}} ({{this.strength}}){{#unless @last}}, {{/unless}}{{/each}}; Resistance at {{#each previousAnalysis.key_levels.resistance}}{{this.zone}} ({{this.strength}}){{#unless @last}}, {{/unless}}{{/each}}.
- **Indicators:** {{#each previousAnalysis.indicators}}{{this.name}}: {{this.signal}}{{#unless @last}}; {{/unless}}{{/each}}
- **Patterns:** {{#each previousAnalysis.patterns}}{{this.name}} ({{this.probability}}){{#unless @last}}; {{/unless}}{{/each}}
- **Initial Recommendation:** {{previousAnalysis.recommendation}}

Use this context to provide a more informed and consistent answer to the user's follow-up question.
{{/if}}

Your primary goal is to answer the user's specific question about the provided chart. 

If no previous context is available, you must first conduct a silent, internal, and comprehensive analysis using the workflow below, keeping the user's trading style in mind. The final answer you provide must be a direct result of this deep analysis.

**Internal Analysis Workflow (Follow this only if NO previous context is provided):**

1.  **Initial Assessment:**
    *   Identify asset, timeframe, dominant trend, and volatility relevant to the user's style.

2.  **Deep Structural Analysis:**
    *   Map market structure (highs/lows, BoS, ChoCH) and identify key supply/demand zones as price ranges, grading each zone's strength (Strong, Moderate, Weak), all relevant to the user's timeframe.

3.  **Indicator & Confluence Analysis:**
    *   Analyze visible indicators and volume, interpreting them for the specified trading style.

4.  **Pattern Recognition:**
    *   Identify major chart patterns and key candlestick patterns relevant to the timeframe.

5.  **Synthesize & Strategize:**
    *   Formulate the primary bullish and bearish cases.
    *   Based on the synthesis, construct a logical and well-reasoned answer to the user's question. Your answer should be direct, clear, and supported by the evidence you've gathered from your analysis.

**User's Question:** "{{question}}"

Based on your comprehensive analysis (and the previous context if available), provide a direct and professional answer to this question. Do not output your internal analysis steps; only provide the final, reasoned answer.

Chart Image: {{media url=photoDataUri}}`,
});

const answerChartQuestionFlow = ai.defineFlow(
  {
    name: 'answerChartQuestionFlow',
    inputSchema: AnswerChartQuestionInputSchema,
    outputSchema: AnswerChartQuestionOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        return {
          answer:
            'The AI was unable to answer the question. This could be due to a content policy violation or a temporary issue with the AI model. Please try rephrasing your question or try again later.',
        };
      }
      return output;
    } catch (error: any) {
      console.error('Error in answerChartQuestionFlow:', error);
      return {
        answer: `An unexpected error occurred while answering your question: ${
          error.message || 'Unknown error'
        }. This may be a temporary issue with the AI service. Please try again later.`,
      };
    }
  }
);
