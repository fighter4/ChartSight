import { CandlestickChart, Loader2 } from 'lucide-react';
import type { SVGProps } from 'react';

export const Logo = (props: SVGProps<SVGSVGElement>) => (
  <CandlestickChart {...props} />
);

export const Icons = {
  spinner: Loader2,
};
