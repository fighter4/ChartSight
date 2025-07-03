'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { analyzeChartImage, type AnalyzeChartImageOutput } from '@/ai/flows/analyze-chart-image';
import { answerChartQuestion } from '@/ai/flows/answer-chart-question';
import { useToast } from '@/hooks/use-toast';
import { AnalysisCard } from '@/components/app/analysis-card';
import { LiveChart } from '@/components/app/live-chart';
import { QaCard } from '@/components/app/qa-card';
import { Header } from '@/components/app/header';
import { saveNewAnalysis, addQuestionAnswer, saveAnalysisFeedback } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LiveChartPage() {
  const { user } = useAuth();
  const [capturedImageDataUri, setCapturedImageDataUri] = useState<string | null>(null);
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

  const handleChartCapture = async (chartImageDataUri: string) => {
    if (!user) {
      toast({ title: 'Please log in', description: 'You must be logged in to analyze charts.' });
      return;
    }

    setCapturedImageDataUri(chartImageDataUri);
    setAnalysis(null);
    setAnswer(null);
    setCurrentAnalysisId(null);
    setFeedbackSubmitted(false);
    setAnnotatedImageDataUri(null);
    setIsShowingAnnotations(false);

    setIsLoadingAnalysis(true);

    try {
      const analysisResult = await analyzeChartImage({ 
        photoDataUri: chartImageDataUri,
        tradingStyle,
      });

      setAnalysis(analysisResult);

      if (analysisResult.annotatedPhotoDataUri) {
        setAnnotatedImageDataUri(analysisResult.annotatedPhotoDataUri);
        setIsShowingAnnotations(true);
      }
      
      if (analysisResult.trend === 'Error') {
        return; 
      }

      const newAnalysisId = await saveNewAnalysis({
        userId: user.uid,
        imageDataUri: chartImageDataUri,
        analysis: analysisResult,
      });
      setCurrentAnalysisId(newAnalysisId);

      toast({
        title: 'Analysis Complete',
        description: 'AI analysis of the live chart is ready!',
      });

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

  const handleQuestionSubmit = async (question: string, style: string) => {
    if (!capturedImageDataUri || !user || !currentAnalysisId) return;

    setIsLoadingAnswer(true);
    setAnswer(null);

    try {
      const { answer: newAnswer } = await answerChartQuestion({
        photoDataUri: capturedImageDataUri,
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
                <h2 className="text-2xl font-bold text-primary mb-4">Live Chart Analysis</h2>
                <p className="text-muted-foreground mb-6">
                    Please log in or create an account to analyze live charts with AI.
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
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Live Chart Analysis</h1>
                    <p className="text-muted-foreground">
                        Monitor real-time cryptocurrency charts and get instant AI analysis
                    </p>
                </div>
                
                <Tabs defaultValue="chart" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="chart">Live Chart</TabsTrigger>
                        <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="chart" className="space-y-6">
                        <LiveChart 
                            onChartReady={handleChartCapture}
                            tradingStyle={tradingStyle}
                        />
                        
                        {capturedImageDataUri && (
                            <Card className="bg-card/50 backdrop-blur-sm">
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Captured Chart</h3>
                                    <div className="flex items-center justify-center space-x-2 mb-4">
                                        <Label htmlFor="annotation-toggle">Original</Label>
                                        <Switch
                                            id="annotation-toggle"
                                            checked={isShowingAnnotations}
                                            onCheckedChange={setIsShowingAnnotations}
                                            disabled={!annotatedImageDataUri}
                                        />
                                        <Label htmlFor="annotation-toggle">Annotated</Label>
                                    </div>
                                    <div className="flex justify-center">
                                        <img 
                                            src={isShowingAnnotations && annotatedImageDataUri ? annotatedImageDataUri : capturedImageDataUri}
                                            alt="Captured chart"
                                            className="max-w-full h-auto rounded-lg border border-border"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                    
                    <TabsContent value="analysis" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <AnalysisCard
                                    analysis={analysis}
                                    isLoading={isLoadingAnalysis}
                                    analysisId={currentAnalysisId}
                                    onFeedbackSubmit={handleFeedbackSubmit}
                                    feedbackSubmitted={feedbackSubmitted}
                                />
                            </div>
                            <div className="space-y-6">
                                <QaCard
                                    isImageUploaded={!!capturedImageDataUri}
                                    isLoading={isLoadingAnswer}
                                    answer={answer}
                                    onQuestionSubmit={handleQuestionSubmit}
                                />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        )}
      </main>
    </div>
  );
} 