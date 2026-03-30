import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedPrompt, PromptVariantStyle } from '@workspace/api-client-react';
import { X, Copy, Download, RefreshCw, FileText, Sparkles, LayoutTemplate, AlertTriangle, Zap, Brain, GitBranch } from 'lucide-react';
import { TechButton, ScoreBadge } from './ui/hud';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface PromptPanelProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: GeneratedPrompt | null;
  onRegenerate: () => void;
  isGenerating: boolean;
  error?: string | null;
}

const TABS = [
  { id: PromptVariantStyle.expert,   Icon: Brain,         label: 'EXPERT',   desc: 'Analyse approfondie, données sectorielles' },
  { id: PromptVariantStyle.creatif,  Icon: Sparkles,      label: 'CRÉATIF',  desc: 'Angle narratif percutant, storytelling' },
  { id: PromptVariantStyle.template, Icon: LayoutTemplate, label: 'TEMPLATE', desc: 'Structure modulaire, plug & play' },
];

const GENERATION_STEPS = [
  { icon: GitBranch, label: 'ANALYSE STRATÉGIQUE', desc: 'Chain-of-Thought — arguments, risques, angle narratif', delay: 0 },
  { icon: Zap,       label: 'GÉNÉRATION x3',       desc: 'Cerebras Qwen-3 235B — 3 variantes en parallèle',    delay: 0.15 },
  { icon: Brain,     label: 'AMÉLIORATION',         desc: 'Claude Sonnet 4-6 — itérations jusqu\'au seuil',     delay: 0.30 },
  { icon: FileText,  label: 'SCORING FINAL',        desc: 'Score 0-100 sur 7 critères métier CNC/JV',           delay: 0.45 },
];

export function PromptPanel({ isOpen, onClose, prompt, onRegenerate, isGenerating, error }: PromptPanelProps) {
  const [activeTab, setActiveTab] = useState<PromptVariantStyle>(PromptVariantStyle.expert);

  const activeVariant = prompt?.variants?.find(v => v.style === activeTab) || prompt?.variants?.[0];

  const handleCopy = () => {
    if (activeVariant) navigator.clipboard.writeText(activeVariant.content);
  };

  const handleDownload = () => {
    if (activeVariant && prompt) {
      const blob = new Blob([activeVariant.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${prompt.submoduleId || 'prompt'}_${activeTab}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(2,4,12,0.75)', backdropFilter: 'blur(6px)' }}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 180 }}
            className="fixed top-0 right-0 w-full md:w-[820px] h-full z-50 flex flex-col"
            style={{ background: 'rgba(8,10,22,0.98)', borderLeft: '1px solid rgba(0,200,255,0.15)', boxShadow: '-30px 0 60px rgba(0,0,0,0.6)' }}
          >
            {/* Top accent line */}
            <div className="h-px w-full shrink-0" style={{ background: 'linear-gradient(to right, transparent, #00C8FF80, #FFD70060, transparent)' }} />

            {/* ── Header ── */}
            <div className="px-6 py-4 border-b shrink-0 flex items-start justify-between"
              style={{ borderColor: 'rgba(0,200,255,0.08)', background: 'rgba(6,8,18,0.6)' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[9px] tracking-[0.3em] text-muted">PROMPT PANEL</span>
                  {isGenerating && (
                    <span className="font-mono text-[9px] px-2 py-0.5 animate-pulse tracking-widest"
                      style={{ color: '#FFD700', border: '1px solid rgba(255,215,0,0.3)', background: 'rgba(255,215,0,0.06)' }}>
                      GÉNÉRATION EN COURS...
                    </span>
                  )}
                  {error && !isGenerating && (
                    <span className="font-mono text-[9px] px-2 py-0.5 tracking-widest"
                      style={{ color: '#FF4444', border: '1px solid rgba(255,68,68,0.3)', background: 'rgba(255,68,68,0.06)' }}>
                      ERREUR
                    </span>
                  )}
                  {prompt && !isGenerating && !error && (
                    <span className="font-mono text-[9px] px-2 py-0.5 tracking-widest"
                      style={{ color: '#00FF41', border: '1px solid rgba(0,255,65,0.3)', background: 'rgba(0,255,65,0.06)' }}>
                      PRÊT
                    </span>
                  )}
                </div>
                <h2 className="font-display text-lg text-foreground font-bold leading-tight truncate pr-8">
                  {prompt?.submoduleName || (isGenerating ? 'Assemblage en cours...' : 'Génération de Prompt')}
                </h2>
                {prompt && (
                  <p className="font-mono text-xs text-muted mt-1">
                    <span style={{ color: '#00C8FF80' }}>{prompt.moduleName}</span>
                    {' // '}<span className="text-muted">PLATEFORME:</span>{' '}
                    <span style={{ color: '#FFD700' }}>{prompt.targetPlatform?.toUpperCase()}</span>
                    {' // '}<span className="text-muted">ITÉRATIONS:</span>{' '}
                    <span className="text-foreground">{prompt.iterations}</span>
                  </p>
                )}
              </div>

              <div className="flex items-start gap-3 ml-4 shrink-0">
                {prompt && !isGenerating && (
                  <ScoreBadge score={prompt.finalScore} />
                )}
                <button onClick={onClose}
                  className="p-2 transition-all duration-200"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,68,68,0.5)'; (e.currentTarget as HTMLButtonElement).style.color = '#FF4444'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = ''; }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-hidden flex flex-col relative">

              {/* LOADING STATE */}
              {isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-8"
                  style={{ background: 'rgba(6,8,18,0.95)' }}>
                  {/* Spinning ring */}
                  <div className="relative w-20 h-20 mb-8">
                    <div className="absolute inset-0 rounded-full border-2 border-cyan/10" />
                    <div className="absolute inset-0 rounded-full border-t-2 border-cyan animate-spin" style={{ borderColor: '#00C8FF' }} />
                    <div className="absolute inset-2 rounded-full border-t-2 animate-spin" style={{ borderColor: '#FFD700', animationDuration: '1.5s', animationDirection: 'reverse' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Zap className="w-6 h-6 animate-pulse" style={{ color: '#FFD700' }} />
                    </div>
                  </div>

                  <h3 className="font-display text-sm tracking-[0.3em] mb-2" style={{ color: '#00C8FF' }}>
                    ASSEMBLAGE GOD TIER EN COURS
                  </h3>
                  <p className="font-mono text-xs text-muted mb-8 text-center">
                    Pipeline multi-LLM actif • Ne fermez pas cette fenêtre
                  </p>

                  {/* Steps */}
                  <div className="w-full max-w-sm space-y-2">
                    {GENERATION_STEPS.map((step, i) => (
                      <motion.div
                        key={step.label}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: step.delay + 0.3 }}
                        className="flex items-center gap-3 px-3 py-2"
                        style={{ border: '1px solid rgba(0,200,255,0.1)', background: 'rgba(0,200,255,0.04)' }}
                      >
                        <step.icon className="w-3.5 h-3.5 shrink-0 animate-pulse" style={{ color: '#00C8FF' }} />
                        <div>
                          <div className="font-display text-[10px] tracking-widest" style={{ color: '#00C8FF' }}>{step.label}</div>
                          <div className="font-mono text-[9px] text-muted">{step.desc}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ERROR STATE */}
              {error && !isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-8"
                  style={{ background: 'rgba(6,8,18,0.95)' }}>
                  <div className="w-16 h-16 flex items-center justify-center mb-6 rounded-full"
                    style={{ border: '1px solid rgba(255,68,68,0.3)', background: 'rgba(255,68,68,0.08)' }}>
                    <AlertTriangle className="w-8 h-8" style={{ color: '#FF4444' }} />
                  </div>
                  <h3 className="font-display text-sm tracking-widest mb-3" style={{ color: '#FF4444' }}>ERREUR DE GÉNÉRATION</h3>
                  <div className="font-mono text-xs text-muted mb-2 text-center max-w-sm px-4 py-3 border"
                    style={{ borderColor: 'rgba(255,68,68,0.2)', background: 'rgba(255,68,68,0.04)' }}>
                    {error}
                  </div>
                  <p className="font-mono text-[10px] text-muted mb-6 text-center">
                    Le pipeline a rencontré une erreur. Vérifiez que votre projet est bien configuré.
                  </p>
                  <TechButton variant="gold" onClick={onRegenerate}>
                    <RefreshCw className="w-4 h-4 mr-2" /> RÉESSAYER
                  </TechButton>
                </div>
              )}

              {/* PROMPT CONTENT */}
              {prompt && !isGenerating && !error && (
                <>
                  {/* Tabs */}
                  <div className="flex px-6 pt-4 gap-2 shrink-0"
                    style={{ background: 'rgba(6,8,18,0.5)', borderBottom: '1px solid rgba(0,200,255,0.06)' }}>
                    {TABS.map(({ id, Icon, label, desc }) => (
                      <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 font-display text-[10px] tracking-[0.2em] border-t border-l border-r transition-all duration-200",
                          activeTab === id
                            ? 'text-cyan border-cyan/40 bg-surface'
                            : 'text-muted border-transparent bg-transparent hover:text-foreground hover:border-white/5 hover:bg-white/2'
                        )}
                        title={desc}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                        {activeTab === id && (() => {
                          const v = prompt.variants?.find(vv => vv.style === id);
                          return v ? (
                            <span className="ml-1 font-mono font-black" style={{
                              color: v.scoring.scoreTotal >= 95 ? '#FFD700' : v.scoring.scoreTotal >= 85 ? '#00FF41' : '#00C8FF',
                              fontSize: '0.75em'
                            }}>
                              {v.scoring.scoreTotal}
                            </span>
                          ) : null;
                        })()}
                      </button>
                    ))}
                  </div>

                  {/* Markdown content */}
                  <div className="flex-1 overflow-y-auto" style={{ background: 'rgba(8,10,22,0.8)' }}>
                    <div className="p-6">
                      <div className="prose prose-invert max-w-none">
                        <ReactMarkdown>
                          {activeVariant?.content || '*Aucun contenu généré pour cette variante.*'}
                        </ReactMarkdown>
                      </div>

                      {/* Scoring breakdown */}
                      {activeVariant?.scoring && (
                        <div className="mt-10 p-4 border"
                          style={{ borderColor: 'rgba(0,200,255,0.1)', background: 'rgba(0,200,255,0.03)' }}>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-display text-[10px] tracking-[0.3em]" style={{ color: '#00C8FF' }}>
                              ANALYSE SCORING DÉTAILLÉE
                            </h4>
                            <ScoreBadge score={activeVariant.scoring.scoreTotal} />
                          </div>
                          <div className="grid grid-cols-2 gap-x-6 gap-y-2 font-mono text-xs mb-4">
                            {[
                              { label: 'Complétude',        val: activeVariant.scoring.completude,            max: 20 },
                              { label: 'Spécificité',       val: activeVariant.scoring.specificite,           max: 20 },
                              { label: 'Précision Rég.',    val: activeVariant.scoring.precisionReglementaire, max: 15 },
                              { label: 'Clarté Structure',  val: activeVariant.scoring.clartéStructure,       max: 15 },
                            ].map(row => (
                              <div key={row.label} className="flex items-center gap-3">
                                <span className="text-muted w-32 shrink-0">{row.label}</span>
                                <div className="flex-1 h-1 bg-surface overflow-hidden relative">
                                  <div className="absolute top-0 left-0 h-full" style={{
                                    width: `${(row.val / row.max) * 100}%`,
                                    background: row.val >= row.max * 0.8 ? '#FFD700' : row.val >= row.max * 0.6 ? '#00C8FF' : '#FF4444'
                                  }} />
                                </div>
                                <span className="font-bold shrink-0" style={{ color: '#FFD700' }}>{row.val}/{row.max}</span>
                              </div>
                            ))}
                          </div>
                          {activeVariant.scoring.weakPoints && activeVariant.scoring.weakPoints.length > 0 && (
                            <div>
                              <div className="font-display text-[9px] tracking-widest mb-2" style={{ color: '#FF4444' }}>
                                POINTS FAIBLES DÉTECTÉS
                              </div>
                              <ul className="space-y-1">
                                {activeVariant.scoring.weakPoints.map((wp, i) => (
                                  <li key={i} className="font-mono text-[11px] text-muted flex items-start gap-2">
                                    <span style={{ color: '#FF4444' }}>▸</span> {wp}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t shrink-0 flex items-center justify-between"
                    style={{ borderColor: 'rgba(0,200,255,0.08)', background: 'rgba(6,8,18,0.8)' }}>
                    <TechButton variant="gold" size="sm" onClick={onRegenerate}>
                      <RefreshCw className="w-3.5 h-3.5 mr-2" /> AMÉLIORER (GOD TIER)
                    </TechButton>
                    <div className="flex gap-3">
                      <TechButton variant="ghost" size="sm" onClick={handleCopy}>
                        <Copy className="w-3.5 h-3.5 mr-2" /> COPIER
                      </TechButton>
                      <TechButton variant="cyan" size="sm" onClick={handleDownload}>
                        <Download className="w-3.5 h-3.5 mr-2" /> .MD
                      </TechButton>
                    </div>
                  </div>
                </>
              )}

              {/* EMPTY STATE */}
              {!prompt && !isGenerating && !error && (
                <div className="flex-1 flex items-center justify-center text-center p-12">
                  <div>
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted opacity-30" />
                    <p className="font-mono text-sm text-muted">
                      Sélectionnez un sous-module pour visualiser<br />ou cliquez sur GÉNÉRER pour lancer le pipeline.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
