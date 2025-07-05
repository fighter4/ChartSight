import { NextRequest, NextResponse } from 'next/server';
import { multiTimeframeAnalysis } from '@/ai/flows/multi-timeframe-analysis';

export async function POST(req: NextRequest) {
  try {
    const { htfPhotoDataUri, mtfPhotoDataUri, ltfPhotoDataUri, tradingStyle } = await req.json();

    if (!htfPhotoDataUri) {
      return NextResponse.json({ error: 'At least one image URI is required' }, { status: 400 });
    }

    const analysisResult = await multiTimeframeAnalysis({ htfPhotoDataUri, mtfPhotoDataUri, ltfPhotoDataUri, tradingStyle });

    return NextResponse.json({ analysis: analysisResult });

  } catch (error: any) {
    console.error("Error in multi-timeframe analysis API:", error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
