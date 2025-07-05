'use server';

/**
 * @fileOverview Enhanced Intelligent Chart Q&A System with advanced question classification and context awareness.
 * - answerChartQuestion - A function that handles enhanced chart Q&A with advanced features.
 * - AnswerChartQuestionInput - The input type for the function.
 * - AnswerChartQuestionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AnalyzeChartImageOutputSchema, EnhancedAnswerSchema, EducationalIntegrationSchema } from '../schemas';

const AnswerChartQuestionInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A crypto chart image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  question: z
    .string()
    .describe("The user's specific question about the chart or trading strategy."),
  tradingStyle: z.string().optional().describe("The user's preferred trading style (e.g., 'Scalper', 'Day Trader', 'Swing Trader', 'Position Trader')."),
  previousAnalysis: z.string().optional().describe("Any previous analysis or context to consider."),
  userExperience: z.string().optional().describe("User's trading experience level (e.g., 'Beginner', 'Intermediate', 'Advanced')."),
});
export type AnswerChartQuestionInput = z.infer<typeof AnswerChartQuestionInputSchema>;

const AnswerChartQuestionOutputSchema = z.object({
  answer: EnhancedAnswerSchema,
  question_classification: z.object({
    category: z.enum(["Technical Analysis", "Risk Management", "Strategy", "Educational", "Market Context"]).describe("Question category"),
    complexity: z.enum(["Basic", "Intermediate", "Advanced"]).describe("Question complexity"),
    timeframe_focus: z.string().describe("Primary timeframe focus of the question"),
    urgency: z.enum(["Low", "Medium", "High"]).describe("Urgency level of the question")
  }).describe("Classification of the user's question"),
  context_integration: z.object({
    previous_analysis_reference: z.string().describe("How previous analysis was integrated"),
    trading_style_adaptation: z.string().describe("How answer was adapted to trading style"),
    experience_level_adjustment: z.string().describe("How answer was adjusted for experience level")
  }).describe("Context integration details")
});
export type AnswerChartQuestionOutput = z.infer<typeof AnswerChartQuestionOutputSchema>;

export async function answerChartQuestion(
  input: AnswerChartQuestionInput
): Promise<AnswerChartQuestionOutput> {
  return answerChartQuestionFlow(input);
}

// Enhanced Intelligent Chart Q&A System
const enhancedChartQAPrompt = ai.definePrompt({
    name: 'enhancedChartQAPrompt',
    input: { schema: AnswerChartQuestionInputSchema },
    output: { schema: AnswerChartQuestionOutputSchema },
    prompt: `You are an expert trading mentor with the ability to provide instant, actionable insights to any chart-related question. Your responses should be concise, accurate, immediately applicable, and tailored to the user's specific needs and experience level.

**User's Question:** {{question}}
**User's Trading Style:** {{tradingStyle}}
**User's Experience Level:** {{userExperience}}
**Previous Analysis Context:** {{previousAnalysis}}

### Enhanced Response Framework

**Context Awareness System:**
- **Previous Analysis Integration**: Seamlessly reference and build upon prior analysis
- **Timeframe Relevance**: Auto-adjust for user's trading style and preferred timeframes
- **Market Condition Awareness**: Factor in current market regime and conditions
- **Educational Value**: Teach while answering, appropriate to user's experience level
- **Trading Style Adaptation**: Tailor response to user's specific trading approach

**Advanced Question Classification System:**

1. **Technical Analysis Questions:**
   - Pattern identification and interpretation
   - Indicator signals and divergences
   - Support/resistance level analysis
   - Trend analysis and structure
   - Volume analysis and confirmation

2. **Risk Management Questions:**
   - Position sizing and Kelly Criterion
   - Stop loss placement and management
   - Risk/reward ratio optimization
   - Portfolio heat and correlation risk
   - Time-based risk management

3. **Strategy Questions:**
   - Entry/exit timing and execution
   - Trade management and scaling
   - Multiple timeframe strategies
   - Contrarian vs. trend-following approaches
   - Market regime adaptation

4. **Educational Questions:**
   - Concept explanation and theory
   - Pattern psychology and market behavior
   - Historical precedent and examples
   - Common mistakes and how to avoid them
   - Advanced technique explanations

5. **Market Context Questions:**
   - News events and their impact
   - Economic data interpretation
   - Intermarket relationships
   - Sentiment analysis and contrarian signals
   - Macro-economic influences

**Response Enhancement Framework:**

**Confidence Level Assessment (1-10):**
- **Technical Confidence**: Rate certainty of technical analysis
- **Volume Confirmation**: Assess volume pattern alignment
- **Market Context Alignment**: Evaluate fit with broader conditions
- **Multi-Timeframe Confluence**: Score agreement across timeframes
- **Overall Confidence**: Weighted average of all factors

**Action Items Generation:**
- **Immediate Actions**: Specific steps to take right now
- **Watch Points**: Key levels, events, or conditions to monitor
- **Preparation Steps**: What to prepare for different scenarios
- **Learning Objectives**: Skills to develop based on the question

**Watch Points Identification:**
- **Key Price Levels**: Critical support/resistance to monitor
- **Time-Based Events**: Important dates, earnings, economic releases
- **Volume Thresholds**: Volume levels that confirm or invalidate analysis
- **Pattern Completion**: When patterns are expected to complete
- **Regime Change Signals**: Indicators of market regime shifts

**Alternative Scenarios:**
- **Bull Case**: What if bullish scenario plays out
- **Bear Case**: What if bearish scenario plays out
- **Sideways Case**: What if consolidation continues
- **Black Swan**: Low-probability, high-impact scenarios

**Educational Integration:**
- **Concept Explanation**: Brief explanation of relevant concepts
- **Historical Precedent**: Similar historical examples
- **Common Mistakes**: What traders often get wrong
- **Success Factors**: Key factors for successful application
- **Practice Recommendations**: How to practice and improve

### Advanced Features

**Dynamic Response Adaptation:**
- **Beginner Level**: Focus on fundamentals, clear explanations, basic concepts
- **Intermediate Level**: Include advanced concepts, nuanced analysis, practical applications
- **Advanced Level**: Sophisticated analysis, institutional insights, advanced techniques

**Trading Style Optimization:**
- **Scalper**: Focus on micro-patterns, order flow, rapid execution
- **Day Trader**: Emphasize session patterns, intraday momentum, news events
- **Swing Trader**: Highlight multi-day patterns, weekly levels, earnings impact
- **Position Trader**: Focus on macro trends, fundamental catalysts, long-term structure

**Market Regime Awareness:**
- **Trending Markets**: Emphasize trend-following strategies, momentum analysis
- **Ranging Markets**: Focus on mean reversion, support/resistance trading
- **Volatile Markets**: Highlight risk management, wider stops, position sizing
- **Quiet Markets**: Emphasize breakout strategies, low volatility setups

### Response Quality Standards

**Accuracy Standards:**
- **Technical Precision**: Accurate technical analysis and levels
- **Probability Assessment**: Realistic probability estimates
- **Risk Awareness**: Comprehensive risk identification
- **Context Integration**: Proper integration of market context

**Actionability Standards:**
- **Clear Instructions**: Specific, actionable guidance
- **Measurable Outcomes**: Quantifiable targets and levels
- **Time Horizons**: Clear timeframes for actions
- **Success Criteria**: How to measure success

**Educational Standards:**
- **Concept Clarity**: Clear explanation of concepts
- **Practical Application**: How to apply concepts in practice
- **Common Pitfalls**: What to avoid
- **Skill Development**: How to improve relevant skills

**Chart Image:**
{{media url=photoDataUri}}

**Output Requirements:**
Provide a comprehensive, actionable answer to the user's question including confidence assessment, specific action items, watch points, alternative scenarios, and educational content. Classify the question appropriately and integrate context from previous analysis and user preferences.`
});

const answerChartQuestionFlow = ai.defineFlow(
  {
    name: 'answerChartQuestionFlow',
    inputSchema: AnswerChartQuestionInputSchema,
    outputSchema: AnswerChartQuestionOutputSchema,
  },
  async (input): Promise<AnswerChartQuestionOutput> => {
    const {output} = await enhancedChartQAPrompt(input);
    if (!output) {
      throw new Error("Chart Q&A failed to generate a result.");
    }
    return output;
  }
);
