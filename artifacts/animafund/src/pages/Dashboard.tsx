import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Plus, LayoutDashboard, Target } from 'lucide-react';
import { 
  GeneratePromptRequestTargetPlatform 
} from '@workspace/api-client-react';

import { useProjects } from '@/hooks/use-projects';
import { useModules } from '@/hooks/use-modules';
import { useProjectPrompts, useGeneratePrompt } from '@/hooks/use-prompts';

import { HUDCard, TechButton } from '@/components/ui/hud';
import { ProjectForm } from '@/components/ProjectForm';
import { ModuleCard } from '@/components/ModuleCard';
import { PromptPanel } from '@/components/PromptPanel';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  // Global State
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [targetPlatform, setTargetPlatform] = useState<GeneratePromptRequestTargetPlatform>(GeneratePromptRequestTargetPlatform.claude);
  const [scoringThreshold, setScoringThreshold] = useState<number>(85);
  
  // Panel State
  const [panelOpen, setPanelOpen] = useState(false);
  const [activePromptRequest, setActivePromptRequest] = useState<{moduleId: number, submoduleId: string} | null>(null);

  // Queries
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects();
  const { data: modules = [], isLoading: isLoadingModules } = useModules();
  const { data: projectPrompts = [], isFetching: isFetchingPrompts } = useProjectPrompts(currentProjectId);
  
  // Mutations
  const { mutate: generatePrompt, isPending: isGeneratingPrompt } = useGeneratePrompt();

  const currentProject = projects.find(p => p.id === currentProjectId);

  // Calcul dynamique du total de sous-modules depuis les données réelles
  const totalSubmodules = modules.reduce((sum, m) => sum + (m.submodules?.length ?? 0), 0);

  // Actions
  const handleProjectSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'new') {
      setCurrentProjectId(null);
      setIsSidebarOpen(true);
    } else if (val) {
      setCurrentProjectId(Number(val));
    }
  };

  const handleProjectSaved = (project: any) => {
    setCurrentProjectId(project.id);
    // Optionally close sidebar on mobile, keep open on desktop
  };

  const handleGeneratePrompt = (moduleId: number, submoduleId: string) => {
    if (!currentProjectId) {
      setIsSidebarOpen(true);
      return;
    }

    setActivePromptRequest({ moduleId, submoduleId });
    setPanelOpen(true);

    generatePrompt({
      data: {
        projectId: currentProjectId,
        moduleId,
        submoduleId,
        targetPlatform,
        scoringThreshold
      }
    });
  };

  const handleRegeneratePrompt = () => {
    if (activePromptRequest && currentProjectId) {
      generatePrompt({
        data: {
          projectId: currentProjectId,
          moduleId: activePromptRequest.moduleId,
          submoduleId: activePromptRequest.submoduleId,
          targetPlatform,
          scoringThreshold
        }
      });
    }
  };

  const handleViewPrompt = (moduleId: number, submoduleId: string) => {
    setActivePromptRequest({ moduleId, submoduleId });
    setPanelOpen(true);
  };

  // Find the currently active prompt data from the local list
  const activePromptData = projectPrompts.find(
    p => p.moduleId === activePromptRequest?.moduleId && p.submoduleId === activePromptRequest?.submoduleId
  ) || null;


  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/bg-tech-noir.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'screen'
        }}
      />

      {/* Top HUD Header */}
      <header className="relative z-20 border-b border-cyan/20 bg-surface/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Animafund Logo" className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
          <div>
            <h1 className="font-display font-black text-2xl text-foreground tracking-[0.2em] text-glow-cyan">ANIMAFUND</h1>
            <p className="font-mono text-xs text-cyan tracking-widest">GOD TIER PROMPT GENERATOR // SYSTEM ONLINE</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-background/50 border border-border clip-corner px-4 py-2">
            <Target className="w-4 h-4 text-cyan" />
            <select 
              value={currentProjectId || 'new'} 
              onChange={handleProjectSelect}
              className="bg-transparent border-none text-sm font-mono text-foreground focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="new" className="bg-surface">+ NOUVEAU PROJET</option>
              <optgroup label="Projets Récents">
                {projects.map(p => (
                  <option key={p.id} value={p.id} className="bg-surface">{p.nom}</option>
                ))}
              </optgroup>
            </select>
          </div>
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 border border-cyan/30 text-cyan hover:bg-cyan/10 hover:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all clip-corner-sm"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Left Sidebar (Configuration & Project) */}
        <aside
          className={`bg-surface border-r border-border shrink-0 flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-[450px] opacity-100' : 'w-0 opacity-0'}`}
        >
          <div className="p-6 overflow-y-auto h-full space-y-8 w-[450px]">
            
            {/* Global Settings */}
            <HUDCard className="bg-background/40">
              <h2 className="font-display text-gold tracking-widest text-sm mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4" /> PARAMÈTRES GLOBAUX
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted font-mono uppercase mb-1 block">Plateforme Cible</label>
                  <select 
                    value={targetPlatform}
                    onChange={(e) => setTargetPlatform(e.target.value as GeneratePromptRequestTargetPlatform)}
                    className="w-full bg-background border border-border px-3 py-2 text-sm font-mono text-cyan focus:outline-none focus:border-cyan clip-corner-sm"
                  >
                    {Object.values(GeneratePromptRequestTargetPlatform).map(p => (
                      <option key={p} value={p}>{p.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs text-muted font-mono uppercase">Seuil God Tier</label>
                    <span className="text-xs font-mono text-gold">{scoringThreshold}</span>
                  </div>
                  <input 
                    type="range" 
                    min="70" max="100" 
                    value={scoringThreshold}
                    onChange={(e) => setScoringThreshold(Number(e.target.value))}
                    className="w-full accent-cyan" 
                  />
                  <p className="text-[10px] text-muted font-mono mt-1 leading-tight">
                    Score minimum exigé. En dessous, le système régénérera automatiquement le prompt.
                  </p>
                </div>
              </div>
            </HUDCard>

            {/* Project Form */}
            <div>
              <h2 className="font-display text-cyan tracking-widest text-sm mb-4 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> 
                {currentProject ? 'PROJET ACTIF' : 'NOUVEAU PROJET'}
              </h2>
              <ProjectForm project={currentProject} onSuccess={handleProjectSaved} />
            </div>

          </div>
        </aside>

        {/* Main Grid Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          
          {!currentProjectId && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
              <div className="text-center p-8 border border-cyan/30 bg-surface clip-corner max-w-md">
                <Target className="w-12 h-12 text-cyan mx-auto mb-4 opacity-50" />
                <h2 className="font-display text-xl text-foreground mb-2">AWAITING PROJECT DATA</h2>
                <p className="font-mono text-sm text-muted mb-6">Initialisez un projet dans le panneau latéral pour commencer la génération de prompts tactiques.</p>
                <TechButton onClick={() => setIsSidebarOpen(true)}>OUVRIR LE PANNEAU DE CONFIGURATION</TechButton>
              </div>
            </div>
          )}

          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-display text-2xl text-foreground tracking-wider uppercase mb-1">Modules Opérationnels</h2>
              <p className="font-mono text-sm text-muted">Sélectionnez un sous-module pour générer son prompt spécifique.</p>
            </div>
            
            {/* Global Progress */}
            {currentProjectId && (
              <div className="text-right">
                <div className="font-mono text-xs text-cyan mb-1">PROGRESSION GLOBALE</div>
                <div className="flex items-center gap-2">
                  <div className="w-48 h-2 bg-surface border border-border relative overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-cyan transition-all duration-1000"
                      style={{ width: `${totalSubmodules > 0 ? Math.min(100, (projectPrompts.length / totalSubmodules) * 100) : 0}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-foreground">{projectPrompts.length}/{totalSubmodules}</span>
                </div>
              </div>
            )}
          </div>

          {isLoadingModules ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="h-64 bg-surface/50 border border-border animate-pulse clip-corner" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {modules.map((module, idx) => (
                <motion.div
                  key={module.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ModuleCard 
                    module={module} 
                    projectPrompts={projectPrompts}
                    onViewPrompt={handleViewPrompt}
                    onGenerateModule={(mId) => {
                      // Trigger generation for first submodule as fallback, or implement bulk generation if API supports it.
                      // For now, trigger first ungenerated submodule
                      const firstMissing = module.submodules?.find(sm => !projectPrompts.some(p => p.submoduleId === sm.id));
                      if (firstMissing) {
                        handleGeneratePrompt(mId, firstMissing.id);
                      } else if (module.submodules?.[0]) {
                        handleGeneratePrompt(mId, module.submodules[0].id);
                      }
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Slide-out Prompt Panel */}
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
