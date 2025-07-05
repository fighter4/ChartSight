import { NextRequest, NextResponse } from 'next/server';
import { collaborativeAnalysisFlow } from '@/ai/flows/collaborative-analysis';

export async function POST(req: NextRequest) {
  try {
    const { image, question, tradingStyle, previousAnalysis } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const analysisResult = await collaborativeAnalysisFlow({ image, question, tradingStyle, previousAnalysis });

    return NextResponse.json({ analysis: analysisResult });

  } catch (error: any) {
    console.error("Error in collaborative analysis API:", error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
