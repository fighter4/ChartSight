'use client';

import { use, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/app/icons';
import Link from 'next/link';

type TradingStyle = 'Scalper' | 'Day Trader' | 'Swing Trader' | 'Position Trader';

export default function SettingsPage() {
  const { toast } = useToast();
  const [tradingStyle, setTradingStyle] = useState<TradingStyle>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('tradingStyle') as TradingStyle) || 'Swing Trader';
    }
    return 'Swing Trader';
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    try {
      localStorage.setItem('tradingStyle', tradingStyle);
      toast({
        title: 'Settings Saved',
        description: `Your trading style has been set to ${tradingStyle}.`,
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start h-full p-4 sm:p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>AI Settings</CardTitle>
          <CardDescription>
            Tailor the AI Brain's analysis to your personal trading style.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <label
                htmlFor="trading-style"
                className="mb-2 sm:mb-0 text-sm font-medium"
              >
                Trading Style
              </label>
              <Select
                value={tradingStyle}
                onValueChange={(value: string) =>
                  setTradingStyle(value as TradingStyle)
                }
              >
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue placeholder="Select your style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scalper">Scalper</SelectItem>
                  <SelectItem value="Day Trader">Day Trader</SelectItem>
                  <SelectItem value="Swing Trader">Swing Trader</SelectItem>
                  <SelectItem value="Position Trader">Position Trader</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Your selected trading style will influence the AI's focus, from
              short-term patterns for Scalpers to long-term trends for Position
              Traders.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Link href="/">
            <Button variant="outline">Go Back</Button>
          </Link>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
