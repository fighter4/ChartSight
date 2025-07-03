'use server';

/**
 * @fileOverview A collaborative chart analysis AI agent that uses a debate mechanism.
 *
 * - collaborativeAnalysisFlow - A function that handles the collaborative chart analysis process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {AnalyzeChartImageOutputSchema} from '../schemas';

const DebateInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a crypto chart, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  tradingStyle: z
    .string()
    .optional()
    .describe("The user's preferred trading style."),
});

// AI Trader 1: The Bull
const bullishTrader = ai.definePrompt({
  name: 'bullishTrader',
  system: `You are "Bullish Brad," an aggressive, optimistic AI trader.
Your ONLY job is to find a reason to go LONG on this chart, tailored to the user's trading style.
- For a Scalper/Day Trader, find a short-term intraday setup.
- For a Swing/Position Trader, find a multi-day or multi-week setup.
You must ignore all bearish signals and construct the most compelling bullish trade setup you can find.
Your output must be a bulleted list containing:
- Entry: [Your proposed entry price]
- Stop-Loss: [Your proposed stop-loss price]
- Take-Profit: [Your proposed take-profit price]
- Justification: [A brief, confident reason for the trade based on the trading style]

If you absolutely cannot find a plausible bullish setup, you must state "No viable bullish setup found."`,
  input: {
    schema: DebateInputSchema,
  },
  prompt: `Trading Style: {{tradingStyle}}
Analyze this chart for a LONG setup: {{media url=photoDataUri}}`,
});

// AI Trader 2: The Bear
const bearishTrader = ai.definePrompt({
  name: 'bearishTrader',
  system: `You are "Bearish Barry," a cautious, pessimistic AI trader.
Your ONLY job is to find a reason to go SHORT on this chart, tailored to the user's trading style.
- For a Scalper/Day Trader, find a short-term intraday setup.
- For a Swing/Position Trader, find a multi-day or multi-week setup.
You must ignore all bullish signals and construct the most compelling bearish trade setup you can find.
Your output must be a bulleted list containing:
- Entry: [Your proposed entry price]
- Stop-Loss: [Your proposed stop-loss price]
- Take-Profit: [Your proposed take-profit price]
- Justification: [A brief, confident reason for the trade based on the trading style]

If you absolutely cannot find a plausible bearish setup, you must state "No viable bearish setup found."`,
  input: {
    schema: DebateInputSchema,
  },
  prompt: `Trading Style: {{tradingStyle}}
Analyze this chart for a SHORT setup: {{media url=photoDataUri}}`,
});


// AI Analyst 3: The Market Structure Expert
const marketStructureExpert = ai.definePrompt({
  name: 'marketStructureExpert',
  system: `You are an expert AI technical analyst specializing in market structure.
Your task is to analyze the provided chart and provide an objective, neutral report on:
1.  The overall market trend (e.g., Uptrend, Downtrend, Sideways/Ranging).
2.  Key supply (resistance) and demand (support) zones. Identify these as price ranges and grade their strength (e.g., 'Strong' based on multiple rejections, 'Weak' if untested).
3.  Important structural points like breaks of structure (BoS) or changes of character (ChoCH).
Your analysis should be influenced by the user's trading style (e.g., focusing on short-term structure for a Day Trader vs. long-term for a Swing Trader).
Do not provide any trade setups or final conclusions. Just provide a bulleted list of your findings.`,
  input: {
    schema: DebateInputSchema,
  },
  prompt: `
Trading Style: {{tradingStyle}}
Chart: {{media url=photoDataUri}}
`,
});

// AI Analyst 4: The Risk Manager
const riskManager = ai.definePrompt({
  name: 'riskManager',
  system: `You are a professional risk manager for a trading desk.
Your job is to analyze the provided chart to identify potential risks objectively.
Focus on volatility, potential for fakeouts, strength/weakness of key levels, and any signs of instability or exhaustion.
Tailor your risk assessment to the user's trading style. A scalper's risks (e.g., spread, slippage, sudden volatility) are different from a position trader's risks (e.g., major trend reversals, fundamental shifts).
Do not provide a trade plan. Provide a brief, bulleted list of the top 2-3 potential risks.`,
  input: {
    schema: DebateInputSchema,
  },
  prompt: `
Trading Style: {{tradingStyle}}
Chart: {{media url=photoDataUri}}
`,
});


// AI Analyst 5: The Head Analyst (Synthesizer)
const headAnalyst = ai.definePrompt({
  name: 'headAnalyst',
  input: {
    schema: z.object({
      photoDataUri: z
        .string()
        .describe(
          "A photo of a crypto chart, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
        ),
      bullishProposal: z.string(),
      bearishProposal: z.string(),
      structureAnalysis: z.string(),
      riskAnalysis: z.string(),
      question: z.string().optional(),
      tradingStyle: z
        .string()
        .optional()
        .describe("The user's preferred trading style."),
      previousAnalysis: AnalyzeChartImageOutputSchema.optional().describe(
        'The previous analysis of the chart to provide context for follow-up questions.'
      ),
    }),
  },
  prompt: `You are "Major Tom," the Head Analyst at a top-tier trading firm. You have received conflicting trade proposals from two of your junior analysts, "Bullish Brad" and "Bearish Barry." You also have neutral reports from your Market Structure and Risk Management desks.

Your task is to:
1.  Review Brad's bullish case and Barry's bearish case.
2.  Consider the objective data from the other reports.
3.  "Moderate the debate": Explain the strengths and weaknesses of each proposed trade.
4.  Make a final, executive decision. This decision must be appropriate for the user's specified trading style. This can be:
    *   Approve Brad's LONG trade.
    *   Approve Barry's SHORT trade.
    *   Reject both and recommend "NO TRADE" if neither setup is high-probability for the given trading style.
    *   Propose a modified trade that improves upon one of the original ideas.
5.  Structure your final output clearly using Markdown, including your final recommendation and the reasoning behind your decision.

### The Debate Floor

**Bullish Brad's Proposal:**
{{{bullishProposal}}}

**Bearish Barry's Proposal:**
{{{bearishProposal}}}

### Intelligence Reports

**Market Structure Desk:**
{{{structureAnalysis}}}

**Risk Management Desk:**
{{{riskAnalysis}}}

{{#if question}}
**User's Specific Question:** {{{question}}}
---
Address this question within your final analysis.
{{/if}}

---
**Your Executive Decision & Report:**
Based on the debate and intel, produce your final, synthesized report now. Remember to keep the user's trading style of **{{tradingStyle}}** as your primary consideration for the final trade plan.

{{#if previousAnalysis}}
**Previous Analysis Context:**
You have already performed an initial analysis on this chart. Here is the summary of your findings:
- Trend: {{previousAnalysis.trend}}
- Structure: {{previousAnalysis.structure}}
- Recommendation: {{previousAnalysis.recommendation}}
Use this context to provide a more informed and consistent answer.
{{/if}}

**Chart:**
{{media url=photoDataUri}}
`,
});

// Define the collaborative analysis flow
export const collaborativeAnalysisFlow = ai.defineFlow(
  {
    name: 'collaborativeAnalysisFlow',
    inputSchema: z.object({
      image: z.string().describe('The chart image to analyze'),
      question: z.string().optional().describe('A specific question about the chart'),
      tradingStyle: z.string().optional().describe("The user's trading style"),
      previousAnalysis: AnalyzeChartImageOutputSchema.optional().describe('The previous analysis of the chart'),
    }),
    outputSchema: z.string().describe('The comprehensive analysis'),
  },
  async (input) => {
    try {
      // Step 1: Run specialist agents in parallel
      const [
        bullishResponse,
        bearishResponse,
        structureResponse,
        riskResponse
      ] = await Promise.all([
        bullishTrader({ photoDataUri: input.image, tradingStyle: input.tradingStyle }),
        bearishTrader({ photoDataUri: input.image, tradingStyle: input.tradingStyle }),
        marketStructureExpert({ photoDataUri: input.image, tradingStyle: input.tradingStyle }),
        riskManager({ photoDataUri: input.image, tradingStyle: input.tradingStyle }),
      ]);

      // Step 2: Synthesis and Strategy by the Head Analyst
      const finalAnalysisResponse = await headAnalyst({
        photoDataUri: input.image,
        bullishProposal: bullishResponse.text,
        bearishProposal: bearishResponse.text,
        structureAnalysis: structureResponse.text,
        riskAnalysis: riskResponse.text,
        question: input.question,
        tradingStyle: input.tradingStyle,
        previousAnalysis: input.previousAnalysis,
      });
      
      if (!finalAnalysisResponse.text) {
        throw new Error("The AI Head Analyst failed to produce a final report.");
      }

      return finalAnalysisResponse.text;
    } catch (error: any) {
        console.error('Error in collaborativeAnalysisFlow:', error);
        return `An error occurred during the collaborative analysis: ${error.message}. This could be due to one of the specialist AIs failing. Please try again.`;
    }
  }
);
