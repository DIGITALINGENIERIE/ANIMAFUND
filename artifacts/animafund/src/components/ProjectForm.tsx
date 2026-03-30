import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  Project, 
  CreateProjectRequest, 
  ProjectGenre, 
  ProjectAvancement 
} from '@workspace/api-client-react';
import { TechInput, TechButton } from './ui/hud';
import { useCreateProject, useUpdateProject } from '@/hooks/use-projects';
import { Plus, Trash2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectFormProps {
  project?: Project;
  onSuccess: (project: Project) => void;
  className?: string;
}

export function ProjectForm({ project, onSuccess, className }: ProjectFormProps) {
  const { mutate: createProject, isPending: isCreating } = useCreateProject();
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();
  const isPending = isCreating || isUpdating;

  const { register, control, handleSubmit, reset, watch, setValue } = useForm<CreateProjectRequest>({
    defaultValues: {
      nom: '',
      logline: '',
      synopsisCourt: '',
      genre: ProjectGenre.animation_2d,
      cible: '',
      ton: [],
      references: [],
      equipe: [],
      budgetTotal: 0,
      montantRecherche: 0,
      avancement: ProjectAvancement.idee,
      societe: '',
      siret: '',
      region: ''
    }
  });

  const { fields: equipeFields, append: appendEquipe, remove: removeEquipe } = useFieldArray({
    control,
    name: "equipe"
  });

  // Load existing project data
  useEffect(() => {
    if (project) {
      reset({
        ...project,
        ton: project.ton || [],
        references: project.references || [],
        equipe: project.equipe || []
      });
    } else {
      reset(); // clear if switching to "New Project"
    }
  }, [project, reset]);

  const onSubmit = (data: CreateProjectRequest) => {
    // Process comma separated strings if they were edited as strings
    const processedData = {
      ...data,
      budgetTotal: Number(data.budgetTotal),
      montantRecherche: Number(data.montantRecherche),
      ton: typeof data.ton === 'string' ? (data.ton as string).split(',').map(s => s.trim()).filter(Boolean) : data.ton,
      references: typeof data.references === 'string' ? (data.references as string).split(',').map(s => s.trim()).filter(Boolean) : data.references,
    };

    if (project) {
      updateProject({ id: project.id, data: processedData }, {
        onSuccess: (res) => onSuccess(res)
      });
    } else {
      createProject({ data: processedData }, {
        onSuccess: (res) => onSuccess(res)
      });
    }
  };

  const tonValue = watch('ton');
  const refValue = watch('references');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-6", className)}>
      
      <div className="space-y-4">
        <h3 className="text-cyan font-display text-sm tracking-widest border-b border-cyan/20 pb-1">// IDENTIFICATION</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-xs text-muted font-mono uppercase">Nom du Projet</label>
            <TechInput {...register("nom", { required: true })} placeholder="Ex: Arcane Legends" />
          </div>
          <div>
            <label className="text-xs text-muted font-mono uppercase">Logline</label>
            <TechInput {...register("logline")} placeholder="Une phrase d'accroche..." />
          </div>
          <div>
            <label className="text-xs text-muted font-mono uppercase">Synopsis Court</label>
            <textarea 
              {...register("synopsisCourt")} 
              className="w-full bg-background border border-border px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-cyan clip-corner-sm h-24 resize-none"
              placeholder="Résumé de l'univers et de l'intrigue..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-cyan font-display text-sm tracking-widest border-b border-cyan/20 pb-1">// CLASSIFICATION</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted font-mono uppercase">Genre</label>
            <select {...register("genre")} className="w-full bg-background border border-border px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-cyan clip-corner-sm appearance-none">
              {Object.values(ProjectGenre).map(g => (
                <option key={g} value={g}>{g.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted font-mono uppercase">Avancement</label>
            <select {...register("avancement")} className="w-full bg-background border border-border px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-cyan clip-corner-sm appearance-none">
              {Object.values(ProjectAvancement).map(a => (
                <option key={a} value={a}>{a.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted font-mono uppercase">Cible</label>
            <TechInput {...register("cible")} placeholder="Ex: Jeunes Adultes (15-25)" />
          </div>
          <div>
            <label className="text-xs text-muted font-mono uppercase">Ton (séparé par virgules)</label>
            <TechInput 
              value={Array.isArray(tonValue) ? tonValue.join(', ') : tonValue} 
              onChange={e => setValue('ton', e.target.value as any)}
              placeholder="Ex: Sombre, Epique, Mature" 
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-cyan font-display text-sm tracking-widest border-b border-cyan/20 pb-1">// DONNÉES FINANCIÈRES</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted font-mono uppercase">Budget Total (€)</label>
            <TechInput type="number" {...register("budgetTotal")} placeholder="0" />
          </div>
          <div>
            <label className="text-xs text-muted font-mono uppercase">Montant Recherché (€)</label>
            <TechInput type="number" {...register("montantRecherche")} placeholder="0" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-cyan/20 pb-1">
          <h3 className="text-cyan font-display text-sm tracking-widest">// ÉQUIPE CLÉ</h3>
          <button type="button" onClick={() => appendEquipe({ nom: '', role: '', bioCourte: '' })} className="text-cyan hover:text-white transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-3">
          {equipeFields.map((field, index) => (
            <div key={field.id} className="bg-background/50 p-3 border border-border clip-corner-sm relative group">
              <button type="button" onClick={() => removeEquipe(index)} className="absolute top-2 right-2 text-muted hover:text-red transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-2 gap-2 mb-2 pr-6">
                <TechInput {...register(`equipe.${index}.nom` as const)} placeholder="Nom" className="py-1 text-xs" />
                <TechInput {...register(`equipe.${index}.role` as const)} placeholder="Rôle" className="py-1 text-xs" />
              </div>
              <TechInput {...register(`equipe.${index}.bioCourte` as const)} placeholder="Bio courte..." className="py-1 text-xs w-full" />
            </div>
          ))}
          {equipeFields.length === 0 && <p className="text-xs text-muted font-mono italic">Aucun membre ajouté.</p>}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-cyan font-display text-sm tracking-widest border-b border-cyan/20 pb-1">// SOCIÉTÉ</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs text-muted font-mono uppercase">Nom Société</label>
            <TechInput {...register("societe")} placeholder="Studio Name" />
          </div>
          <div>
            <label className="text-xs text-muted font-mono uppercase">SIRET</label>
            <TechInput {...register("siret")} placeholder="123 456 789 00012" />
          </div>
          <div>
            <label className="text-xs text-muted font-mono uppercase">Région</label>
            <TechInput {...register("region")} placeholder="Île-de-France" />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <TechButton type="submit" className="w-full" isLoading={isPending} variant={project ? 'gold' : 'cyan'}>
          <Save className="w-4 h-4 mr-2" />
          {project ? 'METTRE À JOUR LE PROJET' : 'INITIALISER LE PROJET'}
        </TechButton>
      </div>

    </form>
  );
}
