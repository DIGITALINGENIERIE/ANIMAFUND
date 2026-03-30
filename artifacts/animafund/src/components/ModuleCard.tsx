import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Module, GeneratedPrompt } from '@workspace/api-client-react';
import { CheckCircle2, Circle, AlertCircle, Zap, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleCardProps {
  module: Module;
  projectPrompts: GeneratedPrompt[];
  onGenerateModule: (moduleId: number) => void;
  onGenerateSubmodule: (moduleId: number, submoduleId: string) => void;
  onViewPrompt: (moduleId: number, submoduleId: string) => void;
}

function getMentionData(score: number) {
  if (score >= 95) return { label: 'GOD TIER', color: '#FFD700', glow: 'rgba(255,215,0,0.4)' };
  if (score >= 85) return { label: 'EXCELLENT', color: '#00FF41', glow: 'rgba(0,255,65,0.3)' };
  if (score >= 70) return { label: 'BON', color: '#00F0FF', glow: 'rgba(0,240,255,0.3)' };
  return { label: 'INSUFFISANT', color: '#FF4444', glow: 'rgba(255,68,68,0.3)' };
}

export function ModuleCard({ module, projectPrompts, onGenerateModule, onGenerateSubmodule, onViewPrompt }: ModuleCardProps) {
  const [expanded, setExpanded] = useState(false);

  const submodules = module.submodules || [];
  const totalSubmodules = submodules.length;

  const promptsBySubmodule = projectPrompts.reduce((acc, p) => {
    if (p.moduleId === module.id) acc[p.submoduleId] = p;
    return acc;
  }, {} as Record<string, GeneratedPrompt>);

  const generatedCount = submodules.filter(sm => promptsBySubmodule[sm.id]).length;
  const progressPct = totalSubmodules > 0 ? Math.round((generatedCount / totalSubmodules) * 100) : 0;
  const isComplete = generatedCount === totalSubmodules && totalSubmodules > 0;

  const scores = Object.values(promptsBySubmodule).map(p => p.finalScore);
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;

  const accentColor = module.couleur || '#00F0FF';
  const previewSubmodules = expanded ? submodules : submodules.slice(0, 5);

  const firstMissing = submodules.find(sm => !promptsBySubmodule[sm.id]);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="module-card group relative flex flex-col overflow-hidden"
      style={{ '--accent': accentColor } as React.CSSProperties}
    >
      {/* Outer border frame */}
      <div
        className="absolute inset-0 rounded-none pointer-events-none z-10"
        style={{
          border: `1px solid ${accentColor}22`,
          boxShadow: `inset 0 0 30px ${accentColor}08`,
        }}
      />

      {/* Hover glow overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
        style={{ boxShadow: `inset 0 0 40px ${accentColor}15, 0 0 30px ${accentColor}10` }}
      />

      {/* Accent left bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 z-20"
        style={{ background: `linear-gradient(to bottom, transparent, ${accentColor}, ${accentColor}88, transparent)` }}
      />

      {/* Scan line animation */}
      <div
        className="absolute left-0 right-0 h-px opacity-0 group-hover:opacity-100 pointer-events-none z-20"
        style={{
          background: `linear-gradient(to right, transparent, ${accentColor}60, transparent)`,
          animation: 'scanline 2s ease-in-out infinite',
          top: '30%',
        }}
      />

      {/* Main content */}
      <div className="bg-surface/90 backdrop-blur-md flex flex-col h-full ml-1">

        {/* ═══ HEADER ═══ */}
        <div className="relative px-5 pt-5 pb-4">
          {/* Corner decorators */}
          <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
            <div className="absolute top-0 right-0 w-full h-px" style={{ background: accentColor, opacity: 0.5 }} />
            <div className="absolute top-0 right-0 w-px h-full" style={{ background: accentColor, opacity: 0.5 }} />
          </div>
          <div className="absolute bottom-0 left-5 right-5 h-px" style={{ background: `linear-gradient(to right, ${accentColor}40, transparent)` }} />

          <div className="flex items-start justify-between gap-3">
            {/* Icon + Title */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="shrink-0 w-11 h-11 flex items-center justify-center text-2xl relative"
                style={{
                  background: `${accentColor}15`,
                  border: `1px solid ${accentColor}30`,
                  clipPath: 'polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)',
                }}
              >
                <span className="relative z-10">{module.icone}</span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `${accentColor}20` }} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-[10px] tracking-[0.3em]" style={{ color: `${accentColor}99` }}>
                    M-{module.id.toString().padStart(2, '0')}
                  </span>
                  {isComplete && (
                    <span className="font-mono text-[9px] px-1.5 py-0.5 border tracking-widest"
                      style={{ color: '#FFD700', borderColor: '#FFD70050', background: '#FFD70010' }}>
                      COMPLET
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-sm text-foreground leading-tight uppercase tracking-wide group-hover:transition-colors duration-300 line-clamp-2"
                  style={{ '--tw-text-opacity': 1 } as React.CSSProperties}>
                  <span className="group-hover:text-white transition-colors">{module.nom}</span>
                </h3>
              </div>
            </div>

            {/* Stats block */}
            <div className="shrink-0 text-right space-y-1">
              {avgScore > 0 ? (
                <div className="font-mono font-black text-xl leading-none" style={{
                  color: getMentionData(avgScore).color,
                  textShadow: `0 0 10px ${getMentionData(avgScore).glow}`,
                }}>
                  {avgScore}
                </div>
              ) : (
                <div className="font-mono text-xl font-black text-border leading-none">--</div>
              )}
              <div className="font-mono text-[10px] text-muted tracking-widest">AVG SCORE</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between items-center font-mono text-[10px]">
              <span className="text-muted tracking-widest">PROGRESSION</span>
              <span style={{ color: accentColor }}>
                {generatedCount}<span className="text-muted">/{totalSubmodules}</span>
              </span>
            </div>
            <div className="relative h-1.5 bg-background overflow-hidden" style={{ border: `1px solid ${accentColor}20` }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                className="absolute top-0 left-0 h-full"
                style={{ background: `linear-gradient(to right, ${accentColor}88, ${accentColor})` }}
              />
              {/* Shimmer effect on progress bar */}
              <div className="absolute top-0 left-0 h-full w-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(90deg, transparent 0%, ${accentColor}30 50%, transparent 100%)`, backgroundSize: '200% 100%', animation: 'progressShimmer 2s infinite' }} />
            </div>
            {maxScore >= 95 && (
              <div className="flex items-center gap-1 font-mono text-[9px]" style={{ color: '#FFD700' }}>
                <TrendingUp className="w-2.5 h-2.5" />
                <span>MAX: {maxScore} — GOD TIER ATTEINT</span>
              </div>
            )}
          </div>
        </div>

        {/* ═══ SUBMODULE LIST ═══ */}
        <div className="flex-1 px-4 pb-2 space-y-1 overflow-hidden">
          <AnimatePresence initial={false}>
            {previewSubmodules.map((sm, idx) => {
              const prompt = promptsBySubmodule[sm.id];
              const isGenerated = !!prompt;
              const isFirstMissing = firstMissing?.id === sm.id;

              let icon = <Circle className="w-3 h-3 shrink-0" style={{ color: `${accentColor}40` }} />;
              let rowStyle = {};
              let scoreColor = 'text-muted';

              if (isGenerated) {
                const m = getMentionData(prompt.finalScore);
                icon = prompt.finalScore >= 85
                  ? <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: m.color }} />
                  : <AlertCircle className="w-3 h-3 shrink-0" style={{ color: m.color }} />;
                rowStyle = { background: `${m.color}08`, borderLeft: `2px solid ${m.color}40` };
                scoreColor = '';
              } else if (isFirstMissing) {
                icon = <Zap className="w-3 h-3 shrink-0 animate-pulse" style={{ color: accentColor }} />;
                rowStyle = { borderLeft: `2px solid ${accentColor}30` };
              }

              return (
                <motion.button
                  key={sm.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => isGenerated ? onViewPrompt(module.id, sm.id) : onGenerateSubmodule(module.id, sm.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-left transition-all duration-200 group/sm hover:bg-white/5 border border-transparent hover:border-white/5"
                  style={rowStyle}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {icon}
                    <span className={cn(
                      "font-mono text-[11px] truncate transition-colors",
                      isGenerated ? "text-foreground/90" : isFirstMissing ? "text-foreground/70" : "text-muted"
                    )}>
                      <span className="text-muted/50 mr-1">{sm.id}</span>
                      {sm.nom}
                    </span>
                  </div>
                  {isGenerated && (
                    <span
                      className="font-mono font-bold text-[11px] shrink-0 ml-2"
                      style={{ color: getMentionData(prompt.finalScore).color }}
                    >
                      {prompt.finalScore}
                    </span>
                  )}
                  {isFirstMissing && !isGenerated && (
                    <span className="font-mono text-[9px] shrink-0 ml-2 tracking-widest" style={{ color: accentColor }}>
                      GEN
                    </span>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>

          {/* Show more / less */}
          {submodules.length > 5 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-center gap-1 py-1.5 font-mono text-[10px] tracking-widest text-muted hover:text-foreground transition-colors border-t mt-1"
              style={{ borderColor: `${accentColor}15` }}
            >
              {expanded ? (
                <><ChevronUp className="w-3 h-3" /> RÉDUIRE</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> +{submodules.length - 5} SOUS-MODULES</>
              )}
            </button>
          )}
        </div>

        {/* ═══ FOOTER ACTION ═══ */}
        <div className="px-4 pb-4 pt-3 mt-auto" style={{ borderTop: `1px solid ${accentColor}15` }}>
          <button
            onClick={() => onGenerateModule(module.id)}
            className="w-full relative flex items-center justify-center gap-2 py-2.5 font-display font-bold text-xs tracking-[0.2em] uppercase transition-all duration-300 overflow-hidden group/btn"
            style={{
              border: `1px solid ${accentColor}50`,
              color: accentColor,
              background: `${accentColor}08`,
              clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = `${accentColor}20`;
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 20px ${accentColor}30`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = `${accentColor}08`;
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            <Zap className="w-3.5 h-3.5" />
            {isComplete ? 'RE-GÉNÉRER' : firstMissing ? `GÉNÉRER : ${firstMissing.id}` : 'GÉNÉRER'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
