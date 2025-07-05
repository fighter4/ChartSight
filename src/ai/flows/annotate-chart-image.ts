'use server';

/**
 * @fileOverview Annotates a chart image based on a provided analysis.
 * - annotateChartImage - A function that handles the chart annotation process.
 * - AnnotateChartImageInput - The input type for the function.
 * - AnnotateChartImageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {AnalyzeChartImageOutputSchema} from '../schemas';
import Handlebars from 'handlebars';

const AnnotateChartImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'The original chart image, as a data URI that must include a MIME type and use Base64 encoding.'
    ),
  analysis: AnalyzeChartImageOutputSchema.describe(
    'The analysis of the chart image, which will be used to generate annotations.'
  ),
});
export type AnnotateChartImageInput = z.infer<
  typeof AnnotateChartImageInputSchema
>;

const AnnotateChartImageOutputSchema = z.object({
  annotatedPhotoDataUri: z
    .string()
    .describe('The annotated chart image as a data URI.'),
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
  async (input) => {
    // Construct a detailed prompt for the image generation model
    const annotationPrompt = `
      You are an expert technical analyst. Your task is to annotate the provided chart image based on the analysis summary.
      Draw clean, clear, and professional-looking annotations directly on the image. Use arrows, lines, shaded rectangles for zones, and simple text labels.
      
      - Draw trend lines for: {{analysis.trend}}
      - Mark key market structure points: {{analysis.structure}}
      - Draw light transparent rectangles for support zones. For 'Strong' zones, make them slightly more opaque. Zones: {{#each analysis.key_levels.support}}[{{this.zone}}, {{this.strength}}]{{#unless @last}}, {{/unless}}{{/each}}
      - Draw light transparent rectangles for resistance zones. For 'Strong' zones, make them slightly more opaque. Zones: {{#each analysis.key_levels.resistance}}[{{this.zone}}, {{this.strength}}]{{#unless @last}}, {{/unless}}{{/each}}
      
      {{#if analysis.patterns}}
      - Annotate the following patterns.
      {{#each analysis.patterns}}
        - For the '{{this.name}}' pattern (Status: {{this.status}}): If the status is 'Invalidated', draw a large red "X" over the pattern area. Otherwise, circle or outline the pattern.
      {{/each}}
      {{/if}}

      - Mark the suggested Entry point with a green dot: {{analysis.entry}}
      - Mark the suggested Stop-Loss with a red dot: {{analysis.stop_loss}}
      - Mark the suggested Take-Profit levels with blue dots: {{#each analysis.take_profit}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

      Do not add any other text or commentary. Only output the annotated image.
    `;

    const template = Handlebars.compile(annotationPrompt);
    const textPrompt = template({ analysis: input.analysis });

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [{media: {url: input.photoDataUri}}, {text: textPrompt}],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
      throw new Error('Image annotation failed to produce a valid image.');
    }

    return {annotatedPhotoDataUri: media.url};
  }
);
