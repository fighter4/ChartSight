'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { MessageSquare, Send } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';

type QaCardProps = {
  isImageUploaded: boolean;
  isLoading: boolean;
  answer: string | null;
  onQuestionSubmit: (question: string, tradingStyle: string) => void;
};

export function QaCard({
  isImageUploaded,
  isLoading,
  answer,
  onQuestionSubmit,
}: QaCardProps) {
  const [question, setQuestion] = useState('');
  const [tradingStyle, setTradingStyle] = useState('Swing Trader');

  useEffect(() => {
    const storedStyle = localStorage.getItem('tradingStyle');
    if (storedStyle) {
      setTradingStyle(storedStyle);
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onQuestionSubmit(question, tradingStyle);
      setQuestion('');
    }
  };

  return (
    <Card className={cn("bg-card/50 backdrop-blur-sm transition-opacity duration-500 ease-out", isImageUploaded ? 'opacity-100 animate-in fade-in' : 'opacity-50 pointer-events-none')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <MessageSquare className="w-6 h-6" />
          <span>Chat about the Chart</span>
        </CardTitle>
        <CardDescription>
          {isImageUploaded ? 'Ask for explanations or specific details about the chart.' : 'Upload a chart to enable chat.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., Explain the pattern on the right."
            disabled={!isImageUploaded || isLoading}
            className="bg-background/50"
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="flex-shrink-0 text-accent hover:bg-accent/20 hover:text-accent disabled:text-muted-foreground"
            disabled={!isImageUploaded || isLoading || !question.trim()}
          >
            <Send className="w-5 h-5" />
            <span className="sr-only">Submit question</span>
          </Button>
        </form>

        {(isLoading || answer) && (
          <div className="mt-6 p-4 rounded-lg bg-background/50">
            <h4 className="font-semibold mb-2 text-primary/80">Answer:</h4>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : (
              <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {answer}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
