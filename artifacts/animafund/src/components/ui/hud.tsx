import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface TechButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'gold' | 'red' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function TechButton({ 
  children, 
  variant = 'cyan', 
  size = 'md', 
  className, 
  isLoading,
  disabled,
  ...props 
}: TechButtonProps) {
  const variants = {
    cyan: 'border-cyan text-cyan hover:bg-cyan/10 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:text-white',
    gold: 'border-gold text-gold hover:bg-gold/10 hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:text-white',
    red: 'border-red text-red hover:bg-red/10 hover:shadow-[0_0_15px_rgba(255,68,68,0.3)] hover:text-white',
    ghost: 'border-transparent text-muted hover:text-foreground hover:bg-surface-hover',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button 
      disabled={isLoading || disabled}
      className={cn(
        "relative flex items-center justify-center border bg-surface/50 font-display font-bold uppercase tracking-widest transition-all duration-300 clip-corner-sm disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {/* Scanning laser effect on hover */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
      
      {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

export function HUDCard({ children, className, glow = false }: { children: React.ReactNode, className?: string, glow?: boolean }) {
  return (
    <div className={cn(
      "bg-surface/80 backdrop-blur-md border border-border clip-corner relative p-6 transition-all duration-300",
      glow && "box-glow-cyan border-cyan/30",
      className
    )}>
      {/* Decorative corner brackets */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan/50 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan/50 pointer-events-none" />
      {children}
    </div>
  );
}

export function TechInput({ className, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input 
      className={cn(
        "w-full bg-background border border-border px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/50 transition-colors clip-corner-sm placeholder:text-muted/50",
        error && "border-red focus:border-red focus:ring-red/50",
        className
      )}
      {...props}
    />
  );
}

export function ScoreBadge({ score }: { score: number }) {
  let color = 'text-red border-red bg-red/10 shadow-[0_0_10px_rgba(255,0,0,0.3)]';
  let label = 'INSUFFISANT';
  
  if (score >= 95) {
    color = 'text-gold border-gold bg-gold/10 shadow-[0_0_10px_rgba(255,215,0,0.5)]';
    label = 'GOD TIER';
  } else if (score >= 85) {
    color = 'text-green border-green bg-green/10 shadow-[0_0_10px_rgba(0,255,0,0.3)]';
    label = 'EXCELLENT';
  } else if (score >= 70) {
    color = 'text-cyan border-cyan bg-cyan/10 shadow-[0_0_10px_rgba(0,240,255,0.3)]';
    label = 'BON';
  }

  return (
    <div className={cn("inline-flex items-center gap-2 border px-2 py-1 clip-corner-sm font-mono text-xs font-bold", color)}>
      <span className="opacity-80">SCORE:</span>
      <span className="text-[1.1em]">{score}</span>
      <span className="opacity-80">[{label}]</span>
    </div>
  );
}
