import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A00]/50 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[linear-gradient(135deg,#FF6A00_0%,#CC4F00_100%)] text-white shadow-[0_12px_34px_rgba(255,106,0,0.28)] hover:-translate-y-0.5 hover:scale-[1.02] hover:brightness-110 hover:shadow-[0_18px_48px_rgba(255,106,0,0.36)]',
        destructive:
          'bg-[#EF4444] text-white hover:-translate-y-0.5 hover:bg-[#EF4444]/90 hover:shadow-[0_14px_34px_rgba(239,68,68,0.24)]',
        outline:
          'border border-white/10 bg-white/[0.035] text-white hover:-translate-y-0.5 hover:border-[#FF6A00]/50 hover:bg-[#FF6A00]/10 hover:text-white',
        secondary:
          'border border-[#FF6A00]/25 bg-[#FF6A00]/10 text-[#FF8A33] hover:-translate-y-0.5 hover:bg-[#FF6A00]/16 hover:text-white',
        ghost: 'text-[#A1A1AA] hover:bg-white/[0.06] hover:text-white',
        link: 'text-[#FF8A33] underline-offset-4 hover:text-white hover:underline',
      },
      size: {
        default: 'h-11 px-6 py-3',
        sm: 'h-9 rounded-xl px-4',
        lg: 'h-12 rounded-xl px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
