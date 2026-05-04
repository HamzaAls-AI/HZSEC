// Local type declarations.
//
// lucide-react@0.460 ships its package.json with `typings` pointing at a
// .d.ts file that the published tarball doesn't actually include.
// Until that's fixed upstream, declare the module shape we use.

declare module 'lucide-react' {
  import * as React from 'react';

  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    absoluteStrokeWidth?: boolean;
  }

  export type LucideIcon = React.ForwardRefExoticComponent<
    LucideProps & React.RefAttributes<SVGSVGElement>
  >;

  // Catch-all for any icon name. Each is a LucideIcon.
  const _icons: Record<string, LucideIcon>;

  // Specific icons we import in the codebase. Listing them gives proper
  // type-checking; the catch-all above keeps unknown imports from breaking.
  export const ShieldCheck:    LucideIcon;
  export const Eye:            LucideIcon;
  export const EyeOff:         LucideIcon;
  export const BookOpen:       LucideIcon;
  export const ArrowRight:     LucideIcon;
  export const Sparkles:       LucideIcon;
  export const LayoutGrid:     LucideIcon;
  export const KeyRound:       LucideIcon;
  export const CreditCard:     LucideIcon;
  export const Activity:       LucideIcon;
  export const Bell:           LucideIcon;
  export const Code2:          LucideIcon;
  export const AlertTriangle:  LucideIcon;
  export const Check:          LucideIcon;
  export const Copy:           LucideIcon;
  export const ExternalLink:   LucideIcon;
}
