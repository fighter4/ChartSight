import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScanSearch } from 'lucide-react';

type Pattern = {
  name: string;
  description: string;
};

type PatternsCardProps = {
  patterns: Pattern[] | null;
  isLoading: boolean;
};

export function PatternsCard({ patterns, isLoading }: PatternsCardProps) {
  if (!isLoading && (!patterns || patterns.length === 0)) {
    // If we're done loading and there are no patterns, we can render a message, but for now we'll render nothing to keep the UI clean if one of the API calls returns nothing
    const hasPatterns = patterns && patterns.length > 0;
    if (!hasPatterns) {
        return null;
    }
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm transition-all duration-500 ease-out animate-in fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <ScanSearch className="w-6 h-6" />
          <span>Automated Pattern Recognition</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-2/5" />
              <Skeleton className="h-4 w-4" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-4" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-3/5" />
              <Skeleton className="h-4 w-4" />
            </div>
          </div>
        ) : patterns && patterns.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {patterns.map((pattern, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>{pattern.name}</AccordionTrigger>
                <AccordionContent className="text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {pattern.description}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-muted-foreground text-center">No distinct patterns were recognized in this chart.</p>
        )}
      </CardContent>
    </Card>
  );
}
