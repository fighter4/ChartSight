'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImageUploader } from '@/components/app/image-uploader';
import { useToast } from '@/hooks/use-toast';

export default function CollaborativeAnalysisPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [tradingStyle, setTradingStyle] = useState('Swing Trader');

  useEffect(() => {
    const storedStyle = localStorage.getItem('tradingStyle');
    if (storedStyle) {
      setTradingStyle(storedStyle);
    }
  }, []);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
  });

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setIsLoading(true);
    setAnalysis('');

    try {
      const imageBase64 = await toBase64(imageFile);

      const response = await fetch('/api/analyze-collaborative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageBase64, question, tradingStyle }),
      });
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to get analysis');
      }
      
      setAnalysis(result.analysis);

    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while analyzing the chart.',
        variant: 'destructive',
      });
      setAnalysis('Analysis failed. Please check the error message and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Collaborative Chart Analysis</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
           <ImageUploader
            onImageSelect={handleImageSelect}
            previewUrl={previewUrl}
            isLoading={isLoading}
          />
          {previewUrl && (
            <div className="mt-4">
              <Textarea
                placeholder="Ask a specific question about the chart (optional)"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full"
              />
            </div>
          )}
          <Button
            onClick={handleAnalyze}
            disabled={!previewUrl || isLoading}
            className="mt-4 w-full"
          >
            {isLoading ? 'Analyzing...' : 'Analyze with AI Team'}
          </Button>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">AI Analysis</h2>
          <div className="bg-background border rounded-md p-4 h-full min-h-[300px] whitespace-pre-wrap font-mono text-sm">
            {analysis || 'Your detailed analysis from the AI team will appear here.'}
          </div>
        </div>
      </div>
    </div>
  );
}
