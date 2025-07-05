import { Header } from '@/components/app/header';
import { HistoryList } from '@/components/app/history-list';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { History } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-8 container mx-auto">
        <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="w-6 h-6" />
                    Analysis History
                </CardTitle>
                <CardDescription>
                    Review your past chart analyses and Q&A sessions.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <HistoryList />
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
