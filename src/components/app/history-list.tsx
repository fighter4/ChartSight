'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserAnalyses, type AnalysisRecord } from '@/lib/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ThumbsDown, ThumbsUp, BookOpen } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

function HistoryItem({ item }: { item: AnalysisRecord }) {
  const [isShowingAnnotations, setIsShowingAnnotations] = useState(false);
  
  // Simplified check for valid analysis object
  const hasAnalysis = item.analysis && typeof item.analysis === 'object' && item.analysis.trend !== 'Error';
  const hasAnnotations = hasAnalysis && !!item.analysis.annotatedPhotoDataUri;

  // Default to showing annotations if available
  useEffect(() => {
    if (hasAnnotations) {
        setIsShowingAnnotations(true);
    }
  }, [hasAnnotations]);

  const currentImageUrl = isShowingAnnotations && hasAnnotations
    ? item.analysis.annotatedPhotoDataUri!
    : item.imageDataUri;


  return (
    <AccordionItem value={item.id!}>
      <AccordionTrigger className="p-4 hover:bg-muted/50 rounded-md">
        <div className="flex items-center gap-4 text-left w-full">
          <Image src={item.imageDataUri} alt="Chart thumbnail" width={100} height={56} className="rounded-md object-cover border" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold">Analysis from {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                { hasAnalysis ? `${item.analysis.patterns?.length ?? 0} patterns,`: 'Analysis failed.' } {item.qa?.length ?? 0} questions
              </p>
              {item.feedback === 'helpful' && (
                <Badge variant="secondary" className="border-green-400/50 bg-green-500/10 text-green-400 text-xs">
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  Helpful
                </Badge>
              )}
              {item.feedback === 'unhelpful' && (
                 <Badge variant="secondary" className="border-red-400/50 bg-red-500/10 text-red-400 text-xs">
                  <ThumbsDown className="w-3 h-3 mr-1" />
                  Not Helpful
                </Badge>
              )}
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-4 bg-background/50 rounded-b-md border-t-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="relative">
                    <Image src={currentImageUrl} alt="Chart for analysis" width={800} height={450} className="rounded-md object-contain border" />
                </div>
                {hasAnnotations && (
                    <div className="flex items-center justify-center space-x-2">
                        <Label htmlFor={`annotation-toggle-${item.id}`}>Original</Label>
                        <Switch
                            id={`annotation-toggle-${item.id}`}
                            checked={isShowingAnnotations}
                            onCheckedChange={setIsShowingAnnotations}
                        />
                        <Label htmlFor={`annotation-toggle-${item.id}`}>Annotated</Label>
                    </div>
                )}
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-primary mb-2">AI Analysis</h4>
                {hasAnalysis ? (
                  <div className='space-y-4 text-sm'>
                    <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed bg-background/30 p-3 rounded-md">{item.analysis.recommendation}</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                            <p className="font-medium text-muted-foreground">Trend</p>
                            <p>{item.analysis.trend}</p>
                      </div>
                      <div className="flex justify-between items-start">
                            <p className="font-medium text-muted-foreground">Structure</p>
                            <p className='text-right'>{item.analysis.structure}</p>
                      </div>
                       <div className="flex justify-between items-start gap-2">
                          <p className="font-medium text-muted-foreground">Support</p>
                          <div className="flex flex-wrap justify-end gap-1">
                              {item.analysis.key_levels.support.map((level, i) => (
                                  <Badge variant="outline" key={i} className="font-mono text-xs">{level.zone} ({level.strength})</Badge>
                              ))}
                          </div>
                      </div>
                      <div className="flex justify-between items-start gap-2">
                          <p className="font-medium text-muted-foreground">Resistance</p>
                          <div className="flex flex-wrap justify-end gap-1">
                              {item.analysis.key_levels.resistance.map((level, i) => (
                                  <Badge variant="outline" key={i} className="font-mono text-xs">{level.zone} ({level.strength})</Badge>
                              ))}
                          </div>
                      </div>
                      <div className="flex justify-between items-start">
                              <p className="font-medium text-muted-foreground">Entry</p>
                              <p className='text-right text-accent'>{item.analysis.entry}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-destructive">The AI analysis for this chart could not be retrieved or has failed.</p>
                )}
              </div>

              {hasAnalysis && item.analysis.patterns && item.analysis.patterns.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary mb-2">Recognized Patterns</h4>
                  <div className="flex flex-wrap gap-1">
                    {item.analysis.patterns.map(p => (
                      <Badge 
                        variant={p.status?.toLowerCase() === 'invalidated' ? 'destructive' : 'secondary'} 
                        key={p.name}
                        className="capitalize"
                      >
                        {p.name}
                        {p.status && ` - ${p.status}`}
                        {` (${p.probability})`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {item.qa && item.qa.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary mb-2">Q&A</h4>
                  <div className="space-y-3 text-sm max-h-40 overflow-y-auto">
                    {item.qa.map((qa, i) => (
                      <div key={i}>
                        <p className="font-semibold">Q: {qa.question}</p>
                        <p className="text-foreground/80">A: {qa.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
        </div>
        {hasAnalysis && item.analysis.reasoning && (
          <div className="mt-6">
            <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                AI Reasoning
            </h4>
            <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed bg-background/30 p-3 rounded-md max-h-60 overflow-y-auto">
                {item.analysis.reasoning}
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}


export function HistoryList() {
  const { user } = useAuth();
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getUserAnalyses(user.uid)
        .then(setHistory)
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
        // If user is not logged in after initial check, redirect to auth page.
        router.push('/auth');
    }
  }, [user, router]);

  if (isLoading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
        <h3 className="text-lg font-semibold text-foreground">No History Found</h3>
        <p>You haven't analyzed any charts yet.</p>
        <Button variant="link" onClick={() => router.push('/')}>Start Analyzing</Button>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full space-y-2">
      {history.map((item) => (
        <HistoryItem key={item.id} item={item} />
      ))}
    </Accordion>
  );
}
