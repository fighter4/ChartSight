'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { analyzeChartImage, type AnalyzeChartImageOutput } from '@/ai/flows/analyze-chart-image';
import { answerChartQuestion } from '@/ai/flows/answer-chart-question';
import { useToast } from '@/hooks/use-toast';
import { AnalysisCard } from '@/components/app/analysis-card';
import { ImageUploader } from '@/components/app/image-uploader';
import { QaCard } from '@/components/app/qa-card';
import { Header } from '@/components/app/header';
import { saveNewAnalysis, addQuestionAnswer, saveAnalysisFeedback } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function Home() {
  const { user } = useAuth();
  const [originalImageDataUri, setOriginalImageDataUri] = useState<string | null>(null);
  const [annotatedImageDataUri, setAnnotatedImageDataUri] = useState<string | null>(null);
  const [isShowingAnnotations, setIsShowingAnnotations] = useState(false);
  const [analysis, setAnalysis] = useState<AnalyzeChartImageOutput | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [tradingStyle, setTradingStyle] = useState('Swing Trader');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedStyle = localStorage.getItem('tradingStyle');
    if (storedStyle) {
      setTradingStyle(storedStyle);
    }
  }, []);

  const handleImageUpload = async (file: File) => {
    if (!user) {
      toast({ title: 'Please log in', description: 'You must be logged in to analyze charts.' });
      return;
    }

    setIsLoadingAnalysis(true);
    setAnalysis(null);
    setAnswer(null);
    setCurrentAnalysisId(null);
    setFeedbackSubmitted(false);
    setOriginalImageDataUri(null);
    setAnnotatedImageDataUri(null);
    setIsShowingAnnotations(false);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const dataUri = reader.result as string;
      setOriginalImageDataUri(dataUri);

      try {
        const analysisResult = await analyzeChartImage({ 
          photoDataUri: dataUri,
          tradingStyle,
        });

        setAnalysis(analysisResult);

        if (analysisResult.annotatedPhotoDataUri) {
          setAnnotatedImageDataUri(analysisResult.annotatedPhotoDataUri);
          setIsShowingAnnotations(true); // Switch to annotated view automatically
        }
        
        if (analysisResult.trend === 'Error') {
          return; 
        }

        const newAnalysisId = await saveNewAnalysis({
          userId: user.uid,
          imageDataUri: dataUri,
          analysis: analysisResult,
        });
        setCurrentAnalysisId(newAnalysisId);

      } catch (error: any) {
        console.error('AI processing failed:', error);
        toast({
          variant: 'destructive',
          title: 'AI Processing Failed',
          description: error.message || 'The AI could not process the chart. Please try again.',
        });
      } finally {
        setIsLoadingAnalysis(false);
      }
    };
    reader.onerror = (error) => {
      console.error('File reading failed:', error);
      toast({
        variant: 'destructive',
        title: 'File Error',
        description: 'Could not read the image file. Please try another image.',
      });
      setIsLoadingAnalysis(false);
    };
  };

  const handleQuestionSubmit = async (question: string, style: string) => {
    if (!originalImageDataUri || !user || !currentAnalysisId) return;

    setIsLoadingAnswer(true);
    setAnswer(null);

    try {
      const { answer: newAnswer } = await answerChartQuestion({
        photoDataUri: originalImageDataUri,
        question,
        tradingStyle: style,
        previousAnalysis: analysis || undefined,
      });
      setAnswer(newAnswer);
      await addQuestionAnswer(currentAnalysisId, { question, answer: newAnswer });
    } catch (error: any) {
      console.error('Answering question failed:', error);
      toast({
        variant: 'destructive',
        title: 'Q&A Failed',
        description: error.message || 'The AI could not answer the question. Please try again.',
      });
    } finally {
      setIsLoadingAnswer(false);
    }
  };

  const handleFeedbackSubmit = async (feedback: 'helpful' | 'unhelpful') => {
    if (!currentAnalysisId) return;
    try {
      await saveAnalysisFeedback(currentAnalysisId, feedback);
      setFeedbackSubmitted(true);
      toast({
        title: "Feedback Received",
        description: "Thank you for helping to improve the AI!",
      });
    } catch (error) {
      console.error('Failed to save feedback:', error);
      toast({
        variant: 'destructive',
        title: 'Feedback Error',
        description: 'Could not save your feedback. Please try again.',
      });
    }
  };

  const UnauthenticatedView = () => (
    <div className="container mx-auto flex flex-col items-center justify-center text-center py-16">
        <Card className="max-w-lg bg-card/50 backdrop-blur-sm">
            <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-primary mb-4">Welcome to ChartSight AI</h2>
                <p className="text-muted-foreground mb-6">
                    Please log in or create an account to upload charts, get AI-powered analysis, and save your history.
                </p>
                <Button asChild size="lg">
                    <Link href="/auth">Get Started</Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        {!user ? <UnauthenticatedView /> : (
            <div className="container mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="w-full space-y-4">
                        <ImageUploader
                          onImageSelect={handleImageUpload}
                          previewUrl={isShowingAnnotations && annotatedImageDataUri ? annotatedImageDataUri : originalImageDataUri}
                          isLoading={isLoadingAnalysis}
                        />
                        {annotatedImageDataUri && !isLoadingAnalysis && (
                          <div className="flex items-center justify-center space-x-2 animate-in fade-in">
                            <Label htmlFor="annotation-toggle">Original</Label>
                            <Switch
                              id="annotation-toggle"
                              checked={isShowingAnnotations}
                              onCheckedChange={setIsShowingAnnotations}
                            />
                            <Label htmlFor="annotation-toggle">Annotated</Label>
                          </div>
                        )}
                    </div>
                    <div className="space-y-8">
                        <AnalysisCard
                          analysis={analysis}
                          isLoading={isLoadingAnalysis}
                          analysisId={currentAnalysisId}
                          onFeedbackSubmit={handleFeedbackSubmit}
                          feedbackSubmitted={feedbackSubmitted}
                        />
                        <QaCard
                          isImageUploaded={!!originalImageDataUri}
                          isLoading={isLoadingAnswer}
                          answer={answer}
                          onQuestionSubmit={handleQuestionSubmit}
                        />
                    </div>
                </div>
            </div>
        )}
      </main>
      <footer className="p-4 border-t border-border/40 mt-auto">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          <p>Powered by Gemini AI. For educational purposes only.</p>
        </div>
      </footer>
    </div>
  );
}
