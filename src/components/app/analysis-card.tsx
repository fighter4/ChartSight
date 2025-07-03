import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, TrendingUp, KeyRound, GitCommitHorizontal, CheckCircle, XCircle, Target, ThumbsUp, ThumbsDown, BookOpen } from 'lucide-react';
import type { AnalyzeChartImageOutput } from '@/ai/flows/analyze-chart-image';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type AnalysisCardProps = {
  analysis: AnalyzeChartImageOutput | null;
  isLoading: boolean;
  analysisId: string | null;
  onFeedbackSubmit: (feedback: 'helpful' | 'unhelpful') => void;
  feedbackSubmitted: boolean;
};

const DataRow = ({ label, value }: { label: string, value: React.ReactNode }) => (
  <div className="flex justify-between items-start gap-4">
    <p className="text-sm font-medium text-muted-foreground shrink-0">{label}</p>
    <div className="text-sm text-right text-foreground">{value}</div>
  </div>
);

const TradeSetup = ({ analysis }: { analysis: AnalyzeChartImageOutput }) => (
    <div className="p-4 bg-background/50 rounded-lg space-y-3">
        <DataRow label="Entry" value={<span className="text-accent font-semibold">{analysis.entry}</span>} />
        <DataRow label="Stop Loss" value={<span className="text-destructive font-semibold">{analysis.stop_loss}</span>} />
        <DataRow label="Take Profit" value={<span className="text-green-400 font-semibold">{analysis.take_profit.join(' / ')}</span>} />
        <DataRow label="Risk/Reward" value={<span className="font-semibold">{analysis.RRR}</span>} />
    </div>
)

export function AnalysisCard({ analysis, isLoading, analysisId, onFeedbackSubmit, feedbackSubmitted }: AnalysisCardProps) {
  if (!isLoading && !analysis) {
    return null;
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm transition-all duration-500 ease-out animate-in fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Sparkles className="w-6 h-6" />
          <span>AI Technical Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Separator />
            <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
            </div>
          </div>
        ) : analysis ? (
          <>
            <div>
                <h3 className="font-semibold text-lg mb-2">Recommendation</h3>
                <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed bg-background/30 p-3 rounded-md">{analysis.recommendation}</p>
            </div>
            
            <Separator />

            <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Target className="w-5 h-5"/>Trade Setup</h3>
                <TradeSetup analysis={analysis} />
            </div>

            <Separator />

            <div>
                <h3 className="font-semibold text-lg mb-2">Key Signals</h3>
                <div className="space-y-3">
                    <DataRow label="Trend" value={<Badge variant={analysis.trend.toLowerCase() === 'bullish' ? 'default' : 'destructive'} className="bg-opacity-30 text-foreground">{analysis.trend}</Badge>} />
                    <DataRow label="Structure" value={analysis.structure} />
                    <DataRow 
                        label="Support" 
                        value={
                            <div className="flex flex-wrap justify-end gap-x-2 gap-y-1">
                                {analysis.key_levels.support.map((level, i) => (
                                    <Badge variant="outline" key={i} className="font-mono">{level.zone} <span className="ml-2 font-sans text-muted-foreground">({level.strength})</span></Badge>
                                ))}
                            </div>
                        } 
                    />
                     <DataRow 
                        label="Resistance" 
                        value={
                            <div className="flex flex-wrap justify-end gap-x-2 gap-y-1">
                                {analysis.key_levels.resistance.map((level, i) => (
                                    <Badge variant="outline" key={i} className="font-mono">{level.zone} <span className="ml-2 font-sans text-muted-foreground">({level.strength})</span></Badge>
                                ))}
                            </div>
                        } 
                    />
                </div>
            </div>

            {analysis.patterns && analysis.patterns.length > 0 && (
                <div>
                    <h4 className="font-semibold text-base mb-2">Patterns & Probabilities</h4>
                    <div className="space-y-2">
                        {analysis.patterns.map((pattern) => (
                            <DataRow 
                                key={pattern.name} 
                                label={pattern.name} 
                                value={
                                    <div className="flex items-center gap-2 justify-end flex-wrap">
                                        <Badge 
                                            variant={pattern.status.toLowerCase() === 'invalidated' ? 'destructive' : 'outline'}
                                            className="capitalize"
                                        >
                                            {pattern.status}
                                        </Badge>
                                        <span className="font-semibold text-primary">{pattern.probability}</span>
                                    </div>
                                }
                            />
                        ))}
                    </div>
                </div>
            )}
            
            {analysis.indicators && analysis.indicators.length > 0 && (
                 <div>
                    <h4 className="font-semibold text-base mb-2">Indicators</h4>
                     <div className="space-y-2">
                        {analysis.indicators.map((indicator) => <DataRow key={indicator.name} label={indicator.name.toUpperCase()} value={indicator.signal}/>)}
                    </div>
                </div>
            )}

            {analysis.reasoning && (
              <>
                <Separator />
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="reasoning">
                    <AccordionTrigger className="text-base font-semibold text-primary/90 hover:no-underline">
                       <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5"/>
                          Show AI Reasoning
                       </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed bg-background/30 p-3 rounded-md">
                        {analysis.reasoning}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
            )}

            {analysisId && !feedbackSubmitted && (
              <>
                <Separator/>
                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground mb-3">Was this analysis helpful?</p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => onFeedbackSubmit('helpful')}>
                      <ThumbsUp className="h-4 w-4" />
                      <span className="sr-only">Helpful</span>
                    </Button>
                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => onFeedbackSubmit('unhelpful')}>
                      <ThumbsDown className="h-4 w-4" />
                      <span className="sr-only">Not Helpful</span>
                    </Button>
                  </div>
                </div>
              </>
            )}

            {feedbackSubmitted && (
              <>
                <Separator/>
                <p className="text-sm text-center text-accent pt-4">Thank you for your feedback!</p>
              </>
            )}
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
