'use server';

/**
 * @fileOverview Enhanced Advanced Chart Annotation System with professional-grade visual storytelling capabilities.
 * - annotateChartImage - A function that handles the enhanced chart annotation process.
 * - AnnotateChartImageInput - The input type for the function.
 * - AnnotateChartImageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {AnalyzeChartImageOutputSchema, ComprehensiveAnalysisSchema, EnhancedComprehensiveAnalysisSchema} from '../schemas';
import Handlebars from 'handlebars';

const AnnotateChartImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'The original chart image, as a data URI that must include a MIME type and use Base64 encoding.'
    ),
  analysis: z.union([AnalyzeChartImageOutputSchema, ComprehensiveAnalysisSchema, EnhancedComprehensiveAnalysisSchema]).describe(
    'The analysis of the chart image, which will be used to generate enhanced annotations.'
  ),
});
export type AnnotateChartImageInput = z.infer<
  typeof AnnotateChartImageInputSchema
>;

const AnnotateChartImageOutputSchema = z.object({
  annotatedPhotoDataUri: z
    .string()
    .describe('The enhanced annotated chart image as a data URI.'),
});
export type AnnotateChartImageOutput = z.infer<
  typeof AnnotateChartImageOutputSchema
>;

export async function annotateChartImage(
  input: AnnotateChartImageInput
): Promise<AnnotateChartImageOutput> {
  return annotateChartImageFlow(input);
}

const annotateChartImageFlow = ai.defineFlow(
  {
    name: 'annotateChartImageFlow',
    inputSchema: AnnotateChartImageInputSchema,
    outputSchema: AnnotateChartImageOutputSchema,
  },
  async (input): Promise<AnnotateChartImageOutput> => {
    // Construct an enhanced prompt for the image generation model
    const enhancedAnnotationPrompt = `
      You are an expert technical analyst and professional chart annotator with institutional-grade visualization skills. Your task is to create professional-grade chart annotations that clearly communicate complex analysis through visual storytelling.

      ### Enhanced Annotation Framework

      **Visual Hierarchy System:**
      1. **Primary Elements** (Bold, prominent, high contrast):
         - Major trend lines and channels
         - Key support/resistance levels
         - Main pattern boundaries
         - Critical entry/exit points
         - Major market structure levels

      2. **Secondary Elements** (Medium weight, clear visibility):
         - Supporting trend lines
         - Minor support/resistance zones
         - Pattern completion targets
         - Secondary entry/exit points
         - Volume profile levels

      3. **Tertiary Elements** (Subtle, informative):
         - Educational notes and explanations
         - Probability percentages
         - Time-based annotations
         - Additional context and reasoning
         - Risk management notes

      **Advanced Color Psychology System:**
      - **Green** (#00FF00): Bullish elements, support levels, buy zones, positive signals, accumulation
      - **Red** (#FF0000): Bearish elements, resistance levels, sell zones, negative signals, distribution
      - **Blue** (#0066FF): Neutral elements, key levels, pattern boundaries, consolidation, fair value
      - **Orange** (#FF6600): Caution zones, decision points, breakout levels, warnings, high-risk areas
      - **Purple** (#9900FF): High-probability zones, confluence areas, premium signals, institutional levels
      - **Yellow** (#FFFF00): Watch points, potential setups, emerging patterns, alerts
      - **Pink** (#FF00FF): Fibonacci levels, harmonic patterns, advanced technical levels
      - **Cyan** (#00FFFF): Volume-based levels, VPOC, institutional order flow

      **Professional Annotation Types:**

      1. **Enhanced Trend Lines:**
         - Dynamic support/resistance with strength indicators
         - Arrows showing direction and momentum
         - Thickness based on importance (primary = thick, secondary = medium, tertiary = thin)
         - Color-coded by sentiment and strength
         - Breakout/breakdown confirmation markers

      2. **Advanced Zones:**
         - Support/resistance areas with probability shading
         - Opacity based on confidence level (high confidence = solid, low confidence = transparent)
         - Gradient fills for dynamic zones
         - Border styles indicating zone type (solid = strong, dashed = moderate, dotted = weak)
         - Volume-weighted zone highlighting

      3. **Pattern Boundaries:**
         - Clear pattern outlines with completion targets
         - Pattern type labels with probability scores
         - Stage indicators (forming, developing, mature, breakout)
         - Invalidation levels clearly marked
         - Target zones with probability shading

      4. **Precision Levels:**
         - Exact price levels with reasoning labels
         - Probability scores for each level
         - Time-based validity indicators
         - Volume confirmation markers
         - Institutional vs. retail level differentiation

      5. **Directional Arrows:**
         - Direction bias with probability percentages
         - Confidence levels indicated by arrow size
         - Momentum strength shown by arrow thickness
         - Color-coded by expected outcome
         - Time horizon indicators

      6. **Educational Text:**
         - Concise reasoning and probability assessments
         - Pattern explanations for educational value
         - Risk management notes
         - Market psychology insights
         - Trading strategy recommendations

      **Professional Standards:**

      **Clarity Standards:**
      - Annotations enhance understanding without cluttering
      - Clear visual separation between different annotation types
      - Consistent spacing and alignment
      - Readable text size and contrast
      - Logical flow from primary to tertiary elements

      **Consistency Standards:**
      - Uniform styling across all chart elements
      - Consistent color usage throughout
      - Standardized annotation formats
      - Predictable visual hierarchy
      - Professional appearance maintained

      **Actionability Standards:**
      - Clear entry/exit points marked with precision
      - Risk levels clearly indicated
      - Probability assessments for all major elements
      - Time-based validity for annotations
      - Specific price targets and stops

      **Probability Integration:**
      - All major elements include probability assessments
      - Confidence levels visually represented
      - Risk/reward ratios clearly displayed
      - Alternative scenarios marked
      - Invalidation criteria specified

      **Educational Enhancement:**
      - Brief explanations for key concepts
      - Pattern recognition training elements
      - Market psychology insights
      - Risk management lessons
      - Advanced technique demonstrations

      ### Analysis to Annotate:

      **Market Structure:**
      - Primary trend: {{analysis.trend}}
      - Market structure: {{analysis.structure}}

      **Key Levels:**
      - Support zones: {{#each analysis.key_levels.support}}[{{this.zone}}, {{this.strength}}]{{#unless @last}}, {{/unless}}{{/each}}
      - Resistance zones: {{#each analysis.key_levels.resistance}}[{{this.zone}}, {{this.strength}}]{{#unless @last}}, {{/unless}}{{/each}}

      **Technical Indicators:**
      {{#each analysis.indicators}}
      - {{this.name}}: {{this.signal}}
      {{/each}}

      **Patterns:**
      {{#each analysis.patterns}}
      - {{this.name}} ({{this.probability}}): {{this.status}}
      {{/each}}

      **Trade Plan:**
      - Entry: {{analysis.entry}}
      - Stop Loss: {{analysis.stop_loss}}
      - Take Profit: {{#each analysis.take_profit}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}
      - Risk/Reward: {{analysis.RRR}}

      **Recommendation:**
      {{analysis.recommendation}}

      **Enhanced Analysis (if available):**
      {{#if analysis.probability_framework}}
      - Technical Confidence: {{analysis.probability_framework.confidence_scoring.technical_confidence}}/10
      - Volume Confirmation: {{analysis.probability_framework.confidence_scoring.volume_confirmation}}/10
      - Market Context: {{analysis.probability_framework.confidence_scoring.market_context_alignment}}/10
      - Overall Confidence: {{analysis.probability_framework.confidence_scoring.overall_confidence}}/10
      {{/if}}

      {{#if analysis.context_awareness}}
      - Market Regime: {{analysis.context_awareness.market_regime.market_type}}
      - Sentiment: {{analysis.context_awareness.market_regime.sentiment}}
      - Volatility: {{analysis.context_awareness.market_regime.volatility_period}}
      {{/if}}

      ### Advanced Annotation Instructions:

      1. **Apply Visual Hierarchy**: Use primary elements for major trends and levels, secondary for supporting elements, tertiary for educational content

      2. **Implement Color Psychology**: Use the advanced color system to convey sentiment, probability, and importance

      3. **Create Professional Zones**: Draw support/resistance zones with appropriate opacity and border styles based on strength

      4. **Mark Pattern Boundaries**: Clearly outline patterns with completion targets and stage indicators

      5. **Add Precision Levels**: Mark exact price levels with probability scores and reasoning

      6. **Include Directional Arrows**: Show expected price movement with confidence levels

      7. **Provide Educational Content**: Add brief explanations for key concepts and patterns

      8. **Maintain Professional Standards**: Ensure clarity, consistency, actionability, and educational value

      9. **Integrate Probability Framework**: Include confidence scores and risk assessments throughout

      10. **Apply Context Awareness**: Adapt annotations to current market regime and sentiment

      **Output Requirements:**
      Create a professional, educational, and actionable annotated chart that clearly communicates the analysis while maintaining visual clarity and professional standards. The annotations should be institutional-grade with clear visual hierarchy, appropriate color psychology, and comprehensive educational value.`;

    const template = Handlebars.compile(enhancedAnnotationPrompt);
    const textPrompt = template({ analysis: input.analysis });

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [{media: {url: input.photoDataUri}}, {text: textPrompt}],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Enhanced image annotation failed to produce a valid image.');
    }

    return {annotatedPhotoDataUri: media.url};
  }
);
