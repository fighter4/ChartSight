'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/app/header';
import { MultiImageUploader } from '@/components/app/multi-image-uploader';
import { AnalysisCard } from '@/components/app/analysis-card';
import { Button } from '@/components/ui/button';
import { type AnalyzeChartImageOutput } from '@/ai/flows/analyze-chart-image';
import { saveNewAnalysis } from '@/lib/firestore'; 

export default function MultiTimeframeAnalysisPage() {
  const { user } = useAuth();
  const [imageFiles, setImageFiles] = useState<(File | null)[]>([null, null, null]);
  const [analysis, setAnalysis] = useState<AnalyzeChartImageOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tradingStyle, setTradingStyle] = useState('Swing Trader');
  const { toast } = useToast();

  useEffect(() => {
    const storedStyle = localStorage.getItem('tradingStyle');
    if (storedStyle) {
      setTradingStyle(storedStyle);
    }
  }, []);

  const handleImagesChange = (files: (File | null)[]) => {
    setImageFiles(files);
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
  });

  const handleAnalyze = async () => {
    if (imageFiles.every(f => f === null)) {
        toast({ title: 'No Images', description: 'Please upload at least one chart image.', variant: 'destructive'});
        return;
    }
    if (!user) {
        toast({ title: 'Please log in', description: 'You must be logged in to analyze charts.' });
        return;
    }
    
    setIsLoading(true);
    setAnalysis(null);

    try {
      const imageBase64Promises = imageFiles.map(file => (file ? toBase64(file) : Promise.resolve(null)));
      const photoDataUris = await Promise.all(imageBase64Promises);
      const [htf, mtf, ltf] = photoDataUris;

      if (!htf) {
        toast({ title: 'HTF Chart Missing', description: 'The Higher Timeframe chart is required for analysis.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const payload = {
        tradingStyle,
        htfPhotoDataUri: htf,
        mtfPhotoDataUri: mtf || undefined,
        ltfPhotoDataUri: ltf || undefined,
      };

      const response = await fetch('/api/analyze-multi-timeframe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get analysis');
      }
      
      setAnalysis(result.analysis);

      await saveNewAnalysis({
          userId: user.uid,
          imageDataUri: htf,
          analysis: result.analysis,
        });

    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while analyzing the charts.',
        variant: 'destructive',
      });
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const canAnalyze = imageFiles.some(f => f !== null) && !isLoading;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Multi-Timeframe Analysis</h1>
            <p className="text-muted-foreground">Upload up to 3 charts (e.g., Daily, 4-Hour, 15-Min) for a comprehensive AI analysis.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="w-full space-y-4">
              <MultiImageUploader onImagesChange={handleImagesChange} isLoading={isLoading} />
              <Button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Analyzing...' : 'Run Multi-Timeframe Analysis'}
              </Button>
            </div>
            <div className="space-y-8">
              <AnalysisCard
                analysis={analysis}
                isLoading={isLoading}
                analysisId={null} // History for MTA not fully implemented yet
                onFeedbackSubmit={() => {}}
                feedbackSubmitted={true} // Disable feedback for now
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
