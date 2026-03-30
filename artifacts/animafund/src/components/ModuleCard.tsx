import React from 'react';
import { Module, GeneratedPrompt } from '@workspace/api-client-react';
import { HUDCard, TechButton } from './ui/hud';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModuleCardProps {
  module: Module;
  projectPrompts: GeneratedPrompt[];
  onGenerateModule: (moduleId: number) => void;
  onViewPrompt: (moduleId: number, submoduleId: string) => void;
}

export function ModuleCard({ module, projectPrompts, onGenerateModule, onViewPrompt }: ModuleCardProps) {
  
  // Calculate stats
  const submodules = module.submodules || [];
  const totalSubmodules = submodules.length;
  
  // Map prompts by submoduleId for quick lookup
  const promptsBySubmodule = projectPrompts.reduce((acc, p) => {
    if (p.moduleId === module.id) {
      acc[p.submoduleId] = p;
    }
    return acc;
  }, {} as Record<string, GeneratedPrompt>);

  const generatedCount = submodules.filter(sm => promptsBySubmodule[sm.id]).length;
  const isComplete = totalSubmodules > 0 && generatedCount === totalSubmodules;

  // Calculate avg score
  let avgScore = 0;
  if (generatedCount > 0) {
    const totalScore = Object.values(promptsBySubmodule).reduce((sum, p) => sum + p.finalScore, 0);
    avgScore = Math.round(totalScore / generatedCount);
  }

  // Parse color (assuming it's a hex or tailwind class from DB, we'll force it to inline style if hex)
  const isHex = module.couleur?.startsWith('#');
  const colorStyle = isHex ? { color: module.couleur, borderColor: module.couleur } : {};
  const colorClass = !isHex ? `text-${module.couleur} border-${module.couleur}` : '';

  return (
    <HUDCard className="flex flex-col h-full hover:border-cyan/50 transition-colors group">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className={cn("w-10 h-10 flex items-center justify-center border clip-corner-sm bg-background/50 text-2xl", colorClass)}
            style={colorStyle}
          >
            {module.icone}
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-foreground leading-tight group-hover:text-cyan transition-colors">
              {module.nom}
            </h3>
            <p className="font-mono text-xs text-muted">ID: M-{module.id.toString().padStart(2, '0')}</p>
          </div>
        </div>
        
        {/* Module Score / Progress */}
        <div className="text-right">
          <div className="font-mono text-xs text-muted mb-1">
            {generatedCount} / {totalSubmodules}
          </div>
          {avgScore > 0 && (
            <div className="font-mono text-sm font-bold text-gold text-glow-gold">
              AVG: {avgScore}
            </div>
          )}
        </div>
      </div>

      {/* Submodules List */}
      <div className="flex-1 space-y-2 mb-6">
        {submodules.map((sm) => {
          const prompt = promptsBySubmodule[sm.id];
          const isGenerated = !!prompt;
          
          let statusIcon = <Circle className="w-4 h-4 text-muted/50" />;
          let statusColor = "text-muted border-transparent hover:border-cyan/30 hover:bg-cyan/5";
          
          if (isGenerated) {
            if (prompt.finalScore >= 85) {
              statusIcon = <CheckCircle2 className="w-4 h-4 text-green" />;
              statusColor = "text-foreground border-green/20 bg-green/5 hover:border-green/50 hover:bg-green/10";
            } else if (prompt.finalScore >= 70) {
              statusIcon = <CheckCircle2 className="w-4 h-4 text-cyan" />;
              statusColor = "text-foreground border-cyan/20 bg-cyan/5 hover:border-cyan/50 hover:bg-cyan/10";
            } else {
              statusIcon = <AlertCircle className="w-4 h-4 text-red" />;
              statusColor = "text-foreground border-red/20 bg-red/5 hover:border-red/50 hover:bg-red/10";
            }
          }

          return (
            <button 
              key={sm.id}
              onClick={() => onViewPrompt(module.id, sm.id)}
              className={cn(
                "w-full flex items-center justify-between p-2 text-left font-mono text-xs border clip-corner-sm transition-all duration-200 group/item",
                statusColor
              )}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                {statusIcon}
                <span className="truncate group-hover/item:translate-x-1 transition-transform">{sm.nom}</span>
              </div>
              {isGenerated && (
                <span className={cn("font-bold", prompt.finalScore >= 95 ? 'text-gold' : 'text-muted')}>
                  {prompt.finalScore}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Action */}
      <div className="mt-auto pt-4 border-t border-border/50">
        <TechButton 
          variant={isComplete ? 'ghost' : 'cyan'} 
          className="w-full text-xs"
          onClick={() => onGenerateModule(module.id)}
        >
          {isComplete ? 'RE-GÉNÉRER LE PREMIER SOUS-MODULE' : 'GÉNÉRER LE PROCHAIN SOUS-MODULE'}
        </TechButton>
      </div>

    </HUDCard>
  );
}
