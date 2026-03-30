import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Target, ChevronDown, Activity, Layers, Cpu, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { GeneratePromptRequestTargetPlatform } from '@workspace/api-client-react';

import { useProjects } from '@/hooks/use-projects';
import { useModules } from '@/hooks/use-modules';
import { useProjectPrompts, useGeneratePrompt } from '@/hooks/use-prompts';

import { HUDCard, TechButton } from '@/components/ui/hud';
import { ProjectForm } from '@/components/ProjectForm';
import { ModuleCard } from '@/components/ModuleCard';
import { PromptPanel } from '@/components/PromptPanel';

// Static LLM status based on env availability (client-side visible via the API /health route)
const LLM_STACK = [
  { id: 'cerebras', label: 'CEREBRAS', model: 'Qwen-3 235B', role: 'GÉNÉRATION', color: '#FF6B35' },
  { id: 'claude',   label: 'CLAUDE',   model: 'Sonnet 4-6',  role: 'AMÉLIORATION', color: '#CC44FF' },
  { id: 'openai',   label: 'GPT',      model: 'GPT-5.2',     role: 'FALLBACK', color: '#00AA88' },
];

export default function Dashboard() {
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [targetPlatform, setTargetPlatform] = useState<GeneratePromptRequestTargetPlatform>(GeneratePromptRequestTargetPlatform.claude);
  const [scoringThreshold, setScoringThreshold] = useState<number>(85);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activePromptRequest, setActivePromptRequest] = useState<{ moduleId: number; submoduleId: string } | null>(null);

  const { data: projects = [] } = useProjects();
  const { data: modules = [], isLoading: isLoadingModules } = useModules();
  const { data: projectPrompts = [] } = useProjectPrompts(currentProjectId);
  const {
    mutate: generatePrompt,
    isPending: isGeneratingPrompt,
    latestGeneratedPrompt,
    generateError,
    clearLatest,
    setLatestGeneratedPrompt,
  } = useGeneratePrompt();

  const currentProject = projects.find(p => p.id === currentProjectId);
  const totalSubmodules = modules.reduce((sum, m) => sum + (m.submodules?.length ?? 0), 0);
  const globalProgress = totalSubmodules > 0 ? Math.round((projectPrompts.length / totalSubmodules) * 100) : 0;
  const avgGlobalScore = projectPrompts.length > 0
    ? Math.round(projectPrompts.reduce((sum, p) => sum + p.finalScore, 0) / projectPrompts.length)
    : 0;
  const godTierCount = projectPrompts.filter(p => p.finalScore >= 95).length;

  const handleProjectSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'new') { setCurrentProjectId(null); setIsSidebarOpen(true); }
    else if (val) setCurrentProjectId(Number(val));
  };

  const handleProjectSaved = (project: any) => setCurrentProjectId(project.id);

  const handleGeneratePrompt = (moduleId: number, submoduleId: string) => {
    if (!currentProjectId) { setIsSidebarOpen(true); return; }
    clearLatest();
    setActivePromptRequest({ moduleId, submoduleId });
    setPanelOpen(true);
    generatePrompt({ data: { projectId: currentProjectId, moduleId, submoduleId, targetPlatform, scoringThreshold } });
  };

  const handleRegeneratePrompt = () => {
    if (activePromptRequest && currentProjectId) {
      clearLatest();
      generatePrompt({
        data: {
          projectId: currentProjectId,
          moduleId: activePromptRequest.moduleId,
          submoduleId: activePromptRequest.submoduleId,
          targetPlatform,
          scoringThreshold,
        }
      });
    }
  };

  const handleViewPrompt = (moduleId: number, submoduleId: string) => {
    // If we're switching to a different submodule, clear the latest generated data
    if (activePromptRequest?.moduleId !== moduleId || activePromptRequest?.submoduleId !== submoduleId) {
      setLatestGeneratedPrompt(null);
    }
    setActivePromptRequest({ moduleId, submoduleId });
    setPanelOpen(true);
  };

  // Priority: latestGeneratedPrompt (from mutation) > projectPrompts cache
  const activePromptData = (() => {
    if (latestGeneratedPrompt &&
        latestGeneratedPrompt.moduleId === activePromptRequest?.moduleId &&
        latestGeneratedPrompt.submoduleId === activePromptRequest?.submoduleId) {
      return latestGeneratedPrompt;
    }
    return projectPrompts.find(
      p => p.moduleId === activePromptRequest?.moduleId && p.submoduleId === activePromptRequest?.submoduleId
    ) || null;
  })();

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">

      {/* ── Background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(0,200,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,200,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,215,0,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.01) 1px, transparent 1px)',
          backgroundSize: '180px 180px',
        }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh]"
          style={{ background: 'radial-gradient(ellipse at center, rgba(0,200,255,0.06) 0%, transparent 60%)' }} />
      </div>

      {/* ═══ HEADER ═══ */}
      <header className="relative z-20 shrink-0" style={{ borderBottom: '1px solid rgba(0,200,255,0.1)', background: 'rgba(6,8,18,0.97)', backdropFilter: 'blur(20px)' }}>
        <div className="h-px w-full" style={{ background: 'linear-gradient(to right, transparent, #00C8FF, #FFD700, #CC44FF, transparent)' }} />

        <div className="px-6 py-3 flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="relative">
              <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Animafund" className="w-9 h-9 object-contain relative z-10" style={{ filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.6))' }} />
              <div className="absolute inset-0 rounded-full animate-ping opacity-10" style={{ background: '#FFD700' }} />
            </div>
            <div>
              <h1 className="font-display font-black text-xl tracking-[0.25em] leading-none text-white" style={{ textShadow: '0 0 20px rgba(0,200,255,0.3)' }}>
                ANIMAFUND
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00FF41' }} />
                <p className="font-mono text-[9px] tracking-[0.3em]" style={{ color: 'rgba(0,200,255,0.6)' }}>
                  GOD TIER GENERATOR // ONLINE
                </p>
              </div>
            </div>
          </div>

          {/* LLM Stack indicator */}
          <div className="hidden md:flex items-center gap-1">
            {LLM_STACK.map((llm) => (
              <div key={llm.id} className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[9px] tracking-widest"
                style={{ border: `1px solid ${llm.color}30`, background: `${llm.color}08` }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: llm.color, boxShadow: `0 0 5px ${llm.color}` }} />
                <span style={{ color: llm.color }}>{llm.label}</span>
                <span className="text-muted">{llm.model}</span>
              </div>
            ))}
            <div className="px-2 py-1.5 font-mono text-[9px] text-muted tracking-widest" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
              PIPELINE: GEN → IMPROVE → SCORE
            </div>
          </div>

          {/* Center stats */}
          {currentProjectId && (
            <div className="hidden xl:flex items-center gap-0 shrink-0">
              {[
                { label: 'PROMPTS', value: projectPrompts.length, color: '#00C8FF' },
                { label: 'SCORE', value: avgGlobalScore > 0 ? avgGlobalScore : '--', color: '#FFD700' },
                { label: 'GOD TIER', value: godTierCount, color: '#CC44FF' },
                { label: 'DONE', value: `${globalProgress}%`, color: '#00FF41' },
              ].map(stat => (
                <div key={stat.label} className="text-center px-4 py-1.5 border-x" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <div className="font-mono font-black text-base leading-none" style={{ color: stat.color, textShadow: `0 0 10px ${stat.color}50` }}>
                    {stat.value}
                  </div>
                  <div className="font-mono text-[8px] tracking-[0.2em] text-muted mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Right controls */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative flex items-center gap-2 px-4 py-2"
              style={{ border: '1px solid rgba(0,200,255,0.18)', background: 'rgba(0,200,255,0.03)', clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}>
              <Target className="w-3.5 h-3.5 text-cyan shrink-0" />
              <select value={currentProjectId || 'new'} onChange={handleProjectSelect}
                className="bg-transparent border-none text-sm font-mono text-foreground focus:outline-none cursor-pointer pr-6 appearance-none">
                <option value="new" className="bg-surface">+ NOUVEAU PROJET</option>
                {projects.map(p => <option key={p.id} value={p.id} className="bg-surface">{p.nom}</option>)}
              </select>
              <ChevronDown className="w-3 h-3 text-muted absolute right-3 pointer-events-none" />
            </div>

            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 transition-all duration-300"
              style={{
                border: `1px solid ${isSidebarOpen ? 'rgba(0,200,255,0.5)' : 'rgba(0,200,255,0.12)'}`,
                background: isSidebarOpen ? 'rgba(0,200,255,0.1)' : 'transparent',
                clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
              }}>
              <Settings className="w-4 h-4 text-cyan" />
            </button>
          </div>
        </div>
      </header>

      {/* ═══ BODY ═══ */}
      <div className="flex-1 flex overflow-hidden relative z-10">

        {/* ── SIDEBAR ── */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.aside
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 440, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="shrink-0 flex flex-col h-full overflow-hidden"
              style={{ borderRight: '1px solid rgba(0,200,255,0.08)', background: 'rgba(8,10,22,0.98)' }}
            >
              <div className="p-5 overflow-y-auto h-full space-y-6 w-[440px]">

                {/* LLM Pipeline Status */}
                <HUDCard accentColor="#FF6B35">
                  <h2 className="font-display text-[10px] tracking-[0.3em] mb-3 flex items-center gap-2" style={{ color: '#FF6B35' }}>
                    <Cpu className="w-3.5 h-3.5" /> PIPELINE LLM — STATUT
                  </h2>
                  <div className="space-y-2">
                    {LLM_STACK.map((llm, i) => (
                      <div key={llm.id} className="flex items-center justify-between py-1.5 px-3"
                        style={{ background: `${llm.color}08`, border: `1px solid ${llm.color}20` }}>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: llm.color, boxShadow: `0 0 6px ${llm.color}` }} />
                          <span className="font-display font-bold text-[10px] tracking-widest" style={{ color: llm.color }}>{llm.label}</span>
                          <span className="font-mono text-[9px] text-muted">{llm.model}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[8px] tracking-widest text-muted">{llm.role}</span>
                          <span className="font-mono text-[8px] tracking-widest px-1.5 py-0.5"
                            style={{ color: '#00FF41', border: '1px solid rgba(0,255,65,0.3)', background: 'rgba(0,255,65,0.06)' }}>
                            ACTIF
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-2 border-t font-mono text-[9px] text-muted leading-relaxed" style={{ borderColor: 'rgba(255,107,53,0.1)' }}>
                    PIPELINE: Cerebras génère → Claude améliore (jusqu'à 4 itérations) → Score automatique 0-100
                  </div>
                </HUDCard>

                {/* Settings */}
                <HUDCard accentColor="#FFD700">
                  <h2 className="font-display text-[10px] tracking-[0.3em] mb-4 flex items-center gap-2" style={{ color: '#FFD700' }}>
                    <Settings className="w-3.5 h-3.5" /> PARAMÈTRES GLOBAUX
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-muted font-mono uppercase tracking-widest mb-1.5 block">Plateforme Cible</label>
                      <select
                        value={targetPlatform}
                        onChange={e => setTargetPlatform(e.target.value as GeneratePromptRequestTargetPlatform)}
                        className="w-full bg-background border font-mono text-sm focus:outline-none transition-colors px-3 py-2 appearance-none"
                        style={{ borderColor: 'rgba(255,215,0,0.2)', color: '#FFD700', clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)' }}
                      >
                        {Object.values(GeneratePromptRequestTargetPlatform).map(p => (
                          <option key={p} value={p} className="bg-surface">{p.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <label className="text-[10px] text-muted font-mono uppercase tracking-widest">Seuil God Tier</label>
                        <span className="text-xs font-mono font-black" style={{ color: '#FFD700', textShadow: '0 0 8px rgba(255,215,0,0.5)' }}>{scoringThreshold}</span>
                      </div>
                      <input type="range" min="70" max="100" value={scoringThreshold}
                        onChange={e => setScoringThreshold(Number(e.target.value))}
                        className="w-full h-1 appearance-none bg-surface cursor-pointer rounded-none"
                        style={{ accentColor: '#FFD700' }} />
                      <p className="text-[10px] text-muted font-mono mt-1.5 leading-relaxed">
                        Score minimum exigé avant de livrer. Le système régénère automatiquement en dessous.
                      </p>
                    </div>
                  </div>
                </HUDCard>

                {/* Project form */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4" style={{ background: 'linear-gradient(to bottom, #00C8FF, rgba(0,200,255,0.2))' }} />
                    <h2 className="font-display text-[10px] tracking-[0.3em] text-cyan">
                      {currentProject ? 'PROJET ACTIF' : 'NOUVEAU PROJET'}
                    </h2>
                  </div>
                  <ProjectForm project={currentProject} onSuccess={handleProjectSaved} />
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── MAIN ── */}
        <main className="flex-1 overflow-y-auto relative">

          {/* No project overlay */}
          {!currentProjectId && (
            <div className="absolute inset-0 flex items-center justify-center z-20"
              style={{ background: 'rgba(4,6,15,0.88)', backdropFilter: 'blur(10px)' }}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center p-10 max-w-md"
                style={{ border: '1px solid rgba(0,200,255,0.2)', background: 'rgba(8,12,28,0.95)', clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)' }}>
                <div className="w-16 h-16 mx-auto mb-6 relative">
                  <Target className="w-full h-full text-cyan opacity-20" />
                  <div className="absolute inset-0 rounded-full animate-ping opacity-8" style={{ background: '#00C8FF' }} />
                </div>
                <h2 className="font-display text-lg text-foreground mb-3 tracking-widest">AWAITING PROJECT DATA</h2>
                <p className="font-mono text-sm text-muted mb-8 leading-relaxed">
                  Créez ou sélectionnez un projet dans le panneau latéral pour démarrer la génération de prompts God Tier.
                </p>
                <TechButton onClick={() => setIsSidebarOpen(true)} size="lg">
                  OUVRIR LE PANNEAU DE CONFIGURATION
                </TechButton>
              </motion.div>
            </div>
          )}

          {/* Sticky sub-header */}
          <div className="sticky top-0 z-10 px-6 py-3 flex items-center justify-between"
            style={{ background: 'rgba(6,8,18,0.94)', borderBottom: '1px solid rgba(0,200,255,0.06)', backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4" style={{ color: '#00C8FF' }} />
              <div>
                <h2 className="font-display text-sm tracking-[0.25em] text-foreground">MODULES OPÉRATIONNELS</h2>
                <p className="font-mono text-[10px] text-muted tracking-widest">
                  {modules.length} MODULES — {totalSubmodules} SOUS-MODULES
                </p>
              </div>
            </div>

            {currentProjectId && (
              <div className="flex items-center gap-3">
                <Activity className="w-3.5 h-3.5" style={{ color: '#00FF41' }} />
                <div className="flex items-center gap-2">
                  <div className="w-28 h-1.5 bg-surface overflow-hidden" style={{ border: '1px solid rgba(0,200,255,0.12)' }}>
                    <motion.div
                      initial={{ width: 0 }} animate={{ width: `${globalProgress}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-full"
                      style={{ background: 'linear-gradient(to right, rgba(0,200,255,0.5), #00C8FF)' }}
                    />
                  </div>
                  <span className="font-mono text-xs font-bold" style={{ color: '#00C8FF' }}>
                    {projectPrompts.length}<span className="text-muted font-normal">/{totalSubmodules}</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Module grid */}
          <div className="p-5">
            {isLoadingModules ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-72 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,200,255,0.04)' }} />
                ))}
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
                initial="hidden" animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
              >
                {modules.map((module) => (
                  <motion.div
                    key={module.id}
                    variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    <ModuleCard
                      module={module}
                      projectPrompts={projectPrompts}
                      onViewPrompt={handleViewPrompt}
                      onGenerateModule={(mId) => {
                        const firstMissing = module.submodules?.find(sm =>
                          !projectPrompts.some(p => p.submoduleId === sm.id && p.moduleId === mId)
                        );
                        const target = firstMissing || module.submodules?.[0];
                        if (target) handleGeneratePrompt(mId, target.id);
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* ── Prompt Panel ── */}
      <PromptPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        prompt={activePromptData}
        isGenerating={isGeneratingPrompt}
        error={generateError}
        onRegenerate={handleRegeneratePrompt}
      />
    </div>
  );
}
