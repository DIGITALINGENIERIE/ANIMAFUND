import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface TechButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'gold' | 'red' | 'ghost' | 'purple';
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
    cyan:   { color: '#00C8FF', bg: 'rgba(0,200,255,0.06)',   hoverBg: 'rgba(0,200,255,0.18)',   glow: '0 0 20px rgba(0,200,255,0.35)'   },
    gold:   { color: '#FFD700', bg: 'rgba(255,215,0,0.06)',   hoverBg: 'rgba(255,215,0,0.18)',   glow: '0 0 20px rgba(255,215,0,0.35)'   },
    red:    { color: '#FF4444', bg: 'rgba(255,68,68,0.06)',   hoverBg: 'rgba(255,68,68,0.18)',   glow: '0 0 20px rgba(255,68,68,0.35)'   },
    purple: { color: '#CC44FF', bg: 'rgba(204,68,255,0.06)',  hoverBg: 'rgba(204,68,255,0.18)',  glow: '0 0 20px rgba(204,68,255,0.35)'  },
    ghost:  { color: 'rgba(180,195,215,0.6)', bg: 'transparent', hoverBg: 'rgba(255,255,255,0.04)', glow: 'none' },
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[10px] tracking-[0.2em]',
    md: 'px-4 py-2 text-xs tracking-[0.2em]',
    lg: 'px-6 py-3 text-sm tracking-[0.2em]',
  };

  const v = variants[variant];

  return (
    <button
      disabled={isLoading || disabled}
      className={cn(
        "relative flex items-center justify-center font-display font-bold uppercase transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden group clip-corner-sm",
        sizes[size],
        className
      )}
      style={{
        border: `1px solid ${v.color}55`,
        color: v.color,
        background: v.bg,
      }}
      onMouseEnter={e => {
        if (!disabled && !isLoading) {
          (e.currentTarget as HTMLButtonElement).style.background = v.hoverBg;
          (e.currentTarget as HTMLButtonElement).style.boxShadow = v.glow;
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = v.bg;
        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
      }}
      {...props}
    >
      {/* Shimmer sweep on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
      {isLoading ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : null}
      <span className="relative z-10">{children}</span>
    </button>
  );
}

export function HUDCard({ children, className, glow = false, accentColor }: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  accentColor?: string;
}) {
  const color = accentColor || '#00C8FF';
  return (
    <div className={cn("relative p-5 transition-all duration-300", className)}
      style={{
        background: 'rgba(12,15,30,0.85)',
        border: `1px solid ${color}20`,
        backdropFilter: 'blur(12px)',
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)',
        ...(glow ? { boxShadow: `0 0 30px ${color}12, inset 0 0 20px ${color}06` } : {}),
      }}
    >
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-4 h-4 pointer-events-none"
        style={{ borderTop: `1px solid ${color}80`, borderLeft: `1px solid ${color}80` }} />
      <div className="absolute top-0 right-0 w-4 h-4 pointer-events-none"
        style={{ borderTop: `1px solid ${color}80`, borderRight: `1px solid ${color}80` }} />
      <div className="absolute bottom-0 left-0 w-4 h-4 pointer-events-none"
        style={{ borderBottom: `1px solid ${color}80`, borderLeft: `1px solid ${color}80` }} />
      {children}
    </div>
  );
}

export function TechInput({ className, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      className={cn(
        "w-full bg-background/80 border px-3 py-2 text-sm font-mono text-foreground focus:outline-none transition-colors clip-corner-sm placeholder:text-muted/40",
        error
          ? "border-red/50 focus:border-red focus:shadow-[0_0_10px_rgba(255,68,68,0.2)]"
          : "border-white/8 focus:border-cyan/50 focus:shadow-[0_0_10px_rgba(0,200,255,0.15)]",
        className
      )}
      {...props}
    />
  );
}

export function ScoreBadge({ score }: { score: number }) {
  let color: string, label: string, bg: string, glow: string;

  if (score >= 95) {
    color = '#FFD700'; label = 'GOD TIER'; bg = 'rgba(255,215,0,0.1)'; glow = '0 0 15px rgba(255,215,0,0.5)';
  } else if (score >= 85) {
    color = '#00FF41'; label = 'EXCELLENT'; bg = 'rgba(0,255,65,0.08)'; glow = '0 0 12px rgba(0,255,65,0.3)';
  } else if (score >= 70) {
    color = '#00C8FF'; label = 'BON'; bg = 'rgba(0,200,255,0.08)'; glow = '0 0 12px rgba(0,200,255,0.3)';
  } else {
    color = '#FF4444'; label = 'INSUFFISANT'; bg = 'rgba(255,68,68,0.08)'; glow = '0 0 12px rgba(255,68,68,0.3)';
  }

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-bold clip-corner-sm"
      style={{ border: `1px solid ${color}50`, color, background: bg, boxShadow: glow }}
    >
      <span style={{ opacity: 0.7 }}>SCORE:</span>
      <span style={{ fontSize: '1.1em', textShadow: `0 0 8px ${color}` }}>{score}</span>
      <span className="text-[10px] tracking-[0.1em]" style={{ opacity: 0.7 }}>[{label}]</span>
    </div>
  );
}
