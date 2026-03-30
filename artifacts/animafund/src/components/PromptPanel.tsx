import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeneratedPrompt, PromptVariantStyle } from '@workspace/api-client-react';
import { X, Copy, Download, RefreshCw, FileText, Sparkles, LayoutTemplate } from 'lucide-react';
import { TechButton, ScoreBadge } from './ui/hud';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface PromptPanelProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: GeneratedPrompt | null;
  onRegenerate: () => void;
  isGenerating: boolean;
}

export function PromptPanel({ isOpen, onClose, prompt, onRegenerate, isGenerating }: PromptPanelProps) {
  const [activeTab, setActiveTab] = useState<PromptVariantStyle>(PromptVariantStyle.expert);

  const activeVariant = prompt?.variants?.find(v => v.style === activeTab) || prompt?.variants?.[0];

  const handleCopy = () => {
    if (activeVariant) {
      navigator.clipboard.writeText(activeVariant.content);
    }
  };

  const handleDownload = () => {
    if (activeVariant && prompt) {
      const blob = new Blob([activeVariant.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${prompt.submoduleId}_${activeTab}.md`;
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="fixed top-0 right-0 w-full md:w-[800px] h-full bg-surface border-l border-cyan/30 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border/50 bg-background/50 flex flex-col gap-4 shrink-0">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl text-cyan font-bold leading-tight">
                    {prompt?.submoduleName || 'Génération de Prompt'}
                  </h2>
                  <p className="text-muted font-mono text-sm uppercase mt-1">
                    {prompt?.moduleName} // Plateforme: <span className="text-gold">{prompt?.targetPlatform}</span>
                  </p>
                </div>
                <button onClick={onClose} className="p-2 text-muted hover:text-red transition-colors bg-surface clip-corner-sm">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {prompt && !isGenerating && (
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-4">
                    <ScoreBadge score={prompt.finalScore} />
                    <span className="text-muted font-mono text-xs">
                      Itérations: {prompt.iterations}
                    </span>
                  </div>
                  <TechButton variant="gold" size="sm" onClick={onRegenerate} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Améliorer (God Tier)
                  </TechButton>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col relative">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/50 z-10">
                  <div className="w-16 h-16 border-4 border-cyan/20 border-t-cyan rounded-full animate-spin mb-4" />
                  <h3 className="font-display text-cyan tracking-widest animate-pulse">ASSEMBLAGE TACTIQUE EN COURS...</h3>
                  <p className="font-mono text-muted text-sm mt-2">Injection du contexte et scoring LLM...</p>
                </div>
              ) : prompt ? (
                <>
                  {/* Tabs */}
                  <div className="flex px-6 pt-4 gap-2 bg-background/30 border-b border-border/50 shrink-0">
                    {[
                      { id: PromptVariantStyle.expert, icon: FileText, label: 'EXPERT' },
                      { id: PromptVariantStyle.creatif, icon: Sparkles, label: 'CRÉATIF' },
                      { id: PromptVariantStyle.template, icon: LayoutTemplate, label: 'TEMPLATE' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 font-display text-sm tracking-widest border-t border-l border-r rounded-t-lg transition-colors",
                          activeTab === tab.id 
                            ? "bg-surface border-cyan/50 text-cyan" 
                            : "bg-background/50 border-border text-muted hover:text-foreground"
                        )}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Markdown Render */}
                  <div className="flex-1 overflow-y-auto p-6 bg-surface">
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown>
                        {activeVariant?.content || '*Aucun contenu généré pour cette variante.*'}
                      </ReactMarkdown>
                    </div>

                    {/* Scoring Details for this variant */}
                    {activeVariant?.scoring && (
                      <div className="mt-12 p-4 border border-border bg-background/50 clip-corner-sm">
                        <h4 className="font-display text-cyan text-sm tracking-widest mb-4">ANALYSE DU SCORING (Détail)</h4>
                        <div className="grid grid-cols-2 gap-y-2 gap-x-6 font-mono text-xs">
                          <div className="flex justify-between border-b border-border/50 pb-1">
                            <span className="text-muted">Complétude</span>
                            <span className="text-gold">{activeVariant.scoring.completude}/20</span>
                          </div>
                          <div className="flex justify-between border-b border-border/50 pb-1">
                            <span className="text-muted">Spécificité</span>
                            <span className="text-gold">{activeVariant.scoring.specificite}/20</span>
                          </div>
                          <div className="flex justify-between border-b border-border/50 pb-1">
                            <span className="text-muted">Précision Rég.</span>
                            <span className="text-gold">{activeVariant.scoring.precisionReglementaire}/15</span>
                          </div>
                          <div className="flex justify-between border-b border-border/50 pb-1">
                            <span className="text-muted">Clarté Structure</span>
                            <span className="text-gold">{activeVariant.scoring.clartéStructure}/15</span>
                          </div>
                        </div>
                        {activeVariant.scoring.weakPoints && activeVariant.scoring.weakPoints.length > 0 && (
                          <div className="mt-4">
                            <span className="text-red font-bold text-xs uppercase">Points faibles détectés:</span>
                            <ul className="list-disc pl-4 mt-1 text-xs text-muted font-mono">
                              {activeVariant.scoring.weakPoints.map((wp, i) => <li key={i}>{wp}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="p-4 border-t border-border/50 bg-background/80 flex justify-end gap-3 shrink-0">
                    <TechButton variant="ghost" onClick={handleCopy}>
                      <Copy className="w-4 h-4 mr-2" /> COPIER LE PROMPT
                    </TechButton>
                    <TechButton variant="cyan" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" /> TÉLÉCHARGER .MD
                    </TechButton>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted font-mono p-6 text-center">
                  Sélectionnez un module pour générer ou visualiser un prompt God Tier.
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
