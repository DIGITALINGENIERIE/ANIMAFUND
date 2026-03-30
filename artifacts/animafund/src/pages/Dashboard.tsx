import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Target, ChevronDown, Activity, Layers, Cpu } from 'lucide-react';
import { GeneratePromptRequestTargetPlatform } from '@workspace/api-client-react';

import { useProjects } from '@/hooks/use-projects';
import { useModules } from '@/hooks/use-modules';
import { useProjectPrompts, useGeneratePrompt } from '@/hooks/use-prompts';

import { HUDCard, TechButton } from '@/components/ui/hud';
import { ProjectForm } from '@/components/ProjectForm';
import { ModuleCard } from '@/components/ModuleCard';
import { PromptPanel } from '@/components/PromptPanel';

export default function Dashboard() {
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [targetPlatform, setTargetPlatform] = useState<GeneratePromptRequestTargetPlatform>(GeneratePromptRequestTargetPlatform.claude);
  const [scoringThreshold, setScoringThreshold] = useState<number>(85);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activePromptRequest, setActivePromptRequest] = useState<{ moduleId: number; submoduleId: string } | null>(null);

  const { data: projects = [], isLoading: isLoadingProjects } = useProjects();
  const { data: modules = [], isLoading: isLoadingModules } = useModules();
  const { data: projectPrompts = [] } = useProjectPrompts(currentProjectId);
  const { mutate: generatePrompt, isPending: isGeneratingPrompt } = useGeneratePrompt();

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
    setActivePromptRequest({ moduleId, submoduleId });
    setPanelOpen(true);
    generatePrompt({ data: { projectId: currentProjectId, moduleId, submoduleId, targetPlatform, scoringThreshold } });
  };

  const handleRegeneratePrompt = () => {
    if (activePromptRequest && currentProjectId) {
      generatePrompt({ data: { projectId: currentProjectId, moduleId: activePromptRequest.moduleId, submoduleId: activePromptRequest.submoduleId, targetPlatform, scoringThreshold } });
    }
  };

  const handleViewPrompt = (moduleId: number, submoduleId: string) => {
    setActivePromptRequest({ moduleId, submoduleId });
    setPanelOpen(true);
  };

  const activePromptData = projectPrompts.find(
    p => p.moduleId === activePromptRequest?.moduleId && p.submoduleId === activePromptRequest?.submoduleId
  ) || null;

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">

      {/* ── Animated background grid ── */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,215,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.015) 1px, transparent 1px)',
            backgroundSize: '180px 180px',
          }} />
        {/* Radial glow at center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(0,240,255,0.08) 0%, transparent 60%)' }} />
      </div>

      {/* ═══════════════════════════════════════ HEADER ═══════════════════════════════════════ */}
      <header className="relative z-20 shrink-0" style={{ borderBottom: '1px solid rgba(0,240,255,0.12)', background: 'rgba(8,10,20,0.95)', backdropFilter: 'blur(20px)' }}>
        {/* Top accent line */}
        <div className="h-px w-full" style={{ background: 'linear-gradient(to right, transparent, #00F0FF, #FFD700, #00F0FF, transparent)' }} />

        <div className="px-6 py-3 flex items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="relative">
              <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Animafund" className="w-9 h-9 object-contain relative z-10" style={{ filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.6))' }} />
              <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: '#FFD700' }} />
            </div>
            <div>
              <h1 className="font-display font-black text-xl tracking-[0.25em] leading-none" style={{ color: '#fff', textShadow: '0 0 20px rgba(0,240,255,0.4)' }}>
                ANIMAFUND
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00FF41' }} />
                <p className="font-mono text-[9px] tracking-[0.35em]" style={{ color: '#00F0FF99' }}>
                  GOD TIER PROMPT GENERATOR // SYSTEM ONLINE
                </p>
              </div>
            </div>
          </div>

          {/* Center stats (only when project is selected) */}
          {currentProjectId && (
            <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
              {[
                { label: 'PROMPTS', value: projectPrompts.length, color: '#00F0FF' },
                { label: 'SCORE MOY.', value: avgGlobalScore > 0 ? avgGlobalScore : '--', color: '#FFD700' },
                { label: 'GOD TIER', value: godTierCount, color: '#FF00FF' },
                { label: 'COMPLÉTUDE', value: `${globalProgress}%`, color: '#00FF41' },
              ].map(stat => (
                <div key={stat.label} className="text-center px-4 py-1.5 border-x" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="font-mono font-black text-lg leading-none" style={{ color: stat.color, textShadow: `0 0 10px ${stat.color}60` }}>
                    {stat.value}
                  </div>
                  <div className="font-mono text-[9px] tracking-[0.25em] text-muted mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Right controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Project selector */}
            <div className="relative flex items-center gap-2 px-4 py-2 font-mono text-sm"
              style={{ border: '1px solid rgba(0,240,255,0.2)', background: 'rgba(0,240,255,0.03)', clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}>
              <Target className="w-3.5 h-3.5 text-cyan shrink-0" />
              <select
                value={currentProjectId || 'new'}
                onChange={handleProjectSelect}
                className="bg-transparent border-none text-sm font-mono text-foreground focus:outline-none cursor-pointer pr-6 appearance-none"
              >
                <option value="new" className="bg-surface">+ NOUVEAU PROJET</option>
                {projects.map(p => <option key={p.id} value={p.id} className="bg-surface">{p.nom}</option>)}
              </select>
              <ChevronDown className="w-3 h-3 text-muted absolute right-3 pointer-events-none" />
            </div>

            {/* Settings toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="relative p-2.5 transition-all duration-300 group"
              style={{
                border: `1px solid ${isSidebarOpen ? 'rgba(0,240,255,0.5)' : 'rgba(0,240,255,0.15)'}`,
                background: isSidebarOpen ? 'rgba(0,240,255,0.1)' : 'transparent',
                clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)',
              }}
            >
              <Settings className="w-4 h-4 text-cyan" style={{ filter: isSidebarOpen ? '0 0 8px rgba(0,240,255,0.8)' : 'none' }} />
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════ BODY ═══════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden relative z-10">

        {/* ── LEFT SIDEBAR ── */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.aside
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 440, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="shrink-0 flex flex-col h-full overflow-hidden"
              style={{ borderRight: '1px solid rgba(0,240,255,0.1)', background: 'rgba(10,12,25,0.98)' }}
            >
              <div className="p-5 overflow-y-auto h-full space-y-6 w-[440px]">

                {/* Settings panel */}
                <HUDCard className="bg-background/40">
                  <h2 className="font-display text-xs tracking-[0.3em] mb-4 flex items-center gap-2" style={{ color: '#FFD700' }}>
                    <Cpu className="w-3.5 h-3.5" /> PARAMÈTRES GLOBAUX
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-muted font-mono uppercase tracking-widest mb-1.5 block">Plateforme Cible</label>
                      <select
                        value={targetPlatform}
                        onChange={e => setTargetPlatform(e.target.value as GeneratePromptRequestTargetPlatform)}
                        className="w-full bg-background border font-mono text-sm focus:outline-none focus:border-cyan transition-colors px-3 py-2"
                        style={{ borderColor: 'rgba(0,240,255,0.2)', color: '#00F0FF', clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)' }}
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
                        className="w-full h-1.5 appearance-none bg-surface cursor-pointer"
                        style={{ accentColor: '#FFD700' }} />
                      <p className="text-[10px] text-muted font-mono mt-1.5 leading-relaxed">
                        Score minimum exigé. En dessous, le système régénérera automatiquement le prompt.
                      </p>
                    </div>
                  </div>
                </HUDCard>

                {/* Project form */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4" style={{ background: 'linear-gradient(to bottom, #00F0FF, #00F0FF44)' }} />
                    <h2 className="font-display text-xs tracking-[0.3em] text-cyan">
                      {currentProject ? 'PROJET ACTIF' : 'NOUVEAU PROJET'}
                    </h2>
                  </div>
                  <ProjectForm project={currentProject} onSuccess={handleProjectSaved} />
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-y-auto relative">

          {/* No project overlay */}
          {!currentProjectId && (
            <div className="absolute inset-0 flex items-center justify-center z-20"
              style={{ background: 'rgba(5,7,18,0.85)', backdropFilter: 'blur(8px)' }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-10 max-w-md"
                style={{ border: '1px solid rgba(0,240,255,0.25)', background: 'rgba(10,14,30,0.9)', clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)' }}
              >
                <div className="w-16 h-16 mx-auto mb-6 relative">
                  <Target className="w-full h-full text-cyan opacity-30" />
                  <div className="absolute inset-0 rounded-full animate-ping opacity-10" style={{ background: '#00F0FF' }} />
                </div>
                <h2 className="font-display text-lg text-foreground mb-3 tracking-widest">AWAITING PROJECT DATA</h2>
                <p className="font-mono text-sm text-muted mb-8 leading-relaxed">
                  Initialisez un projet dans le panneau de configuration pour démarrer la génération de prompts God Tier.
                </p>
                <TechButton onClick={() => setIsSidebarOpen(true)} size="lg">
                  OUVRIR LE PANNEAU DE CONFIGURATION
                </TechButton>
              </motion.div>
            </div>
          )}

          {/* Header bar */}
          <div className="sticky top-0 z-10 px-6 py-3 flex items-center justify-between"
            style={{ background: 'rgba(8,10,20,0.92)', borderBottom: '1px solid rgba(0,240,255,0.08)', backdropFilter: 'blur(12px)' }}>
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4" style={{ color: '#00F0FF' }} />
              <div>
                <h2 className="font-display text-sm tracking-[0.25em] text-foreground uppercase">Modules Opérationnels</h2>
                <p className="font-mono text-[10px] text-muted tracking-widest">
                  {modules.length} MODULES // {totalSubmodules} SOUS-MODULES DISPONIBLES
                </p>
              </div>
            </div>

            {currentProjectId && (
              <div className="flex items-center gap-3">
                <Activity className="w-3.5 h-3.5" style={{ color: '#00FF41' }} />
                <div className="font-mono text-[10px] text-muted">GLOBAL</div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-1.5 bg-surface overflow-hidden relative" style={{ border: '1px solid rgba(0,240,255,0.15)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${globalProgress}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="absolute top-0 left-0 h-full"
                      style={{ background: 'linear-gradient(to right, rgba(0,240,255,0.6), #00F0FF)' }}
                    />
                  </div>
                  <span className="font-mono text-xs font-bold" style={{ color: '#00F0FF' }}>
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
                  <div key={i} className="h-72 animate-pulse" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,240,255,0.05)' }} />
                ))}
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
              >
                {modules.map((module, idx) => (
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
        onRegenerate={handleRegeneratePrompt}
      />
    </div>
  );
}
