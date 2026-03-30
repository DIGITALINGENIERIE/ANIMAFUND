export interface Submodule {
  id: string;
  nom: string;
  description: string;
}

export interface Module {
  id: number;
  nom: string;
  couleur: string;
  icone: string;
  description: string;
  submodules: Submodule[];
}

export const MODULES: Module[] = [
  {
    id: 1,
    nom: "Dossier de financement CNC / régions / Europe",
    couleur: "#FF4444",
    icone: "🏛️",
    description: "Constitution du dossier officiel pour les commissions CNC, régionales et européennes",
    submodules: [
      { id: "1.1", nom: "Structure administrative", description: "Présentation société, statuts, SIRET, agrément" },
      { id: "1.2", nom: "Synopsis & note d'intention", description: "Synopsis détaillé, intentions artistiques" },
      { id: "1.3", nom: "Équipe clé", description: "CV, biographies, lettres d'engagement" },
      { id: "1.4", nom: "Calendrier prévisionnel", description: "Planning phases (écriture, prod, post-prod)" },
      { id: "1.5", nom: "Budget détaillé", description: "Grille CNC/FJV, salaires, postes techniques" },
      { id: "1.6", nom: "Plan de financement", description: "Sources (CNC, région, SOFICA, préachats)" },
      { id: "1.7", nom: "Annexes", description: "Justificatifs, devis, contrats, extraits" },
      { id: "1.8", nom: "Lettres d'engagement", description: "Modèles pour éditeurs, coproducteurs" },
    ],
  },
  {
    id: 2,
    nom: "Pitch deck investisseurs animation",
    couleur: "#FF8844",
    icone: "💰",
    description: "Présentation stratégique pour lever des fonds auprès d'investisseurs privés",
    submodules: [
      { id: "2.1", nom: "Problème / opportunité", description: "Étude marché, gap, tendances" },
      { id: "2.2", nom: "Concept & univers", description: "Logline, synopsis, univers visuel" },
      { id: "2.3", nom: "Équipe & expertises", description: "Talents clés, crédibilité" },
      { id: "2.4", nom: "État d'avancement", description: "Script, concept art, teaser" },
      { id: "2.5", nom: "Modèle économique", description: "Revenus, ventes, licences" },
      { id: "2.6", nom: "Plan de financement & besoins", description: "Montant recherché, utilisation" },
      { id: "2.7", nom: "Roadmap", description: "Jalons clés, livrables" },
      { id: "2.8", nom: "Annexes visuelles", description: "Concept art, moodboard" },
    ],
  },
  {
    id: 3,
    nom: "Bible artistique (Art Bible)",
    couleur: "#AA66FF",
    icone: "🎨",
    description: "Document de référence visuelle définissant l'identité artistique du projet",
    submodules: [
      { id: "3.1", nom: "Introduction & ton", description: "Intentions, cible, références" },
      { id: "3.2", nom: "Personnages principaux", description: "Design, expressions, silhouettes" },
      { id: "3.3", nom: "Personnages secondaires", description: "Créatures, figurants" },
      { id: "3.4", nom: "Environnements", description: "Lieux clés, plans, ambiances" },
      { id: "3.5", nom: "Palette couleur & lumière", description: "Harmonies, mood par scène" },
      { id: "3.6", nom: "Accessoires & props", description: "Objets emblématiques" },
      { id: "3.7", nom: "Typo & graphisme", description: "Logo, charte graphique" },
      { id: "3.8", nom: "Storyboard / vignettes clés", description: "Scènes emblématiques" },
    ],
  },
  {
    id: 4,
    nom: "Plan de production Gantt",
    couleur: "#44FF44",
    icone: "📅",
    description: "Planification détaillée de toutes les phases de production",
    submodules: [
      { id: "4.1", nom: "Découpage en phases", description: "Développement, préprod, prod, post" },
      { id: "4.2", nom: "Jalons clés", description: "Dépôts CNC, livrables, screenings" },
      { id: "4.3", nom: "Ressources humaines", description: "Équipe par période, ETP" },
      { id: "4.4", nom: "Dépendances critiques", description: "Liens entre tâches" },
      { id: "4.5", nom: "Marges & buffers", description: "Aléas, sécurité" },
    ],
  },
  {
    id: 5,
    nom: "Budget prévisionnel détaillé (animation)",
    couleur: "#4444FF",
    icone: "💶",
    description: "Grille budgétaire complète selon les standards de l'industrie",
    submodules: [
      { id: "5.1", nom: "Masse salariale", description: "Postes, taux, charges, durée" },
      { id: "5.2", nom: "Logiciels & licences", description: "Outils, versions, nombre postes" },
      { id: "5.3", nom: "Locaux & frais généraux", description: "Loyer, électricité, assurances" },
      { id: "5.4", nom: "Sous-traitance", description: "Prestataires, forfaits" },
      { id: "5.5", nom: "Frais de déplacement", description: "Tournages, repérages" },
      { id: "5.6", nom: "Imprévus", description: "5-15% du total" },
    ],
  },
  {
    id: 6,
    nom: "Dossier technique concours (Annecy, etc.)",
    couleur: "#FFFF44",
    icone: "🏆",
    description: "Dossier de candidature optimisé pour les festivals et concours d'animation",
    submodules: [
      { id: "6.1", nom: "Formulaire officiel", description: "Remplissage format imposé" },
      { id: "6.2", nom: "Synopsis & intentions", description: "Version courte/longue" },
      { id: "6.3", nom: "Biographies équipe", description: "CV, filmographie" },
      { id: "6.4", nom: "Extraits visuels", description: "Sélection images, teaser embed" },
      { id: "6.5", nom: "Note de réalisation", description: "Parti pris, références" },
      { id: "6.6", nom: "Justificatifs", description: "Droits, engagements" },
    ],
  },
  {
    id: 7,
    nom: "Rapport d'activité annuel (subventions)",
    couleur: "#AAAAAA",
    icone: "📊",
    description: "Rapport annuel exigé par les organismes de financement",
    submodules: [
      { id: "7.1", nom: "Bilan qualitatif", description: "Réalisations, projets, jalons" },
      { id: "7.2", nom: "Bilan quantitatif", description: "KPI, production, équipe" },
      { id: "7.3", nom: "Comptes simplifiés", description: "Bilan, compte de résultat" },
      { id: "7.4", nom: "Perspectives", description: "Projets à venir, besoins" },
      { id: "7.5", nom: "Annexes justificatives", description: "Attestations, extraits presse" },
    ],
  },
  {
    id: 8,
    nom: "Game Design Document (GDD) complet",
    couleur: "#AA8844",
    icone: "🎮",
    description: "Document de conception complet pour un projet jeu vidéo",
    submodules: [
      { id: "8.1", nom: "Vision & concept", description: "Pitch, cible, proposition unique" },
      { id: "8.2", nom: "Mécaniques core loop", description: "Gameplay, actions, progression" },
      { id: "8.3", nom: "Systèmes & progression", description: "Skills, inventaire, crafting" },
      { id: "8.4", nom: "UI/UX", description: "Flux, écrans, navigation" },
      { id: "8.5", nom: "Sound design & musique", description: "Ambiance, SFX, thèmes" },
      { id: "8.6", nom: "Narrative & level design", description: "Structure niveaux, narration" },
      { id: "8.7", nom: "Économie & monétisation", description: "Devise, achats, saisonnalité" },
      { id: "8.8", nom: "Spécifications techniques", description: "Plateformes, perf, contraintes" },
    ],
  },
  {
    id: 9,
    nom: "Business plan éditeur / investisseur JV",
    couleur: "#44AAFF",
    icone: "📈",
    description: "Business plan complet pour convaincre éditeurs et investisseurs jeu vidéo",
    submodules: [
      { id: "9.1", nom: "Synthèse executive", description: "1 page exécutive" },
      { id: "9.2", nom: "Analyse marché", description: "Taille, tendances, concurrents" },
      { id: "9.3", nom: "Modèle économique", description: "Revenus, pricing, LTV, CAC" },
      { id: "9.4", nom: "KPI & projections", description: "DAU, rétention, conversion" },
      { id: "9.5", nom: "Roadmap produit", description: "Updates, saisons, post-launch" },
      { id: "9.6", nom: "Besoins & utilisation fonds", description: "Montant, allocation" },
      { id: "9.7", nom: "Prévisions financières", description: "3 ans, compte de résultat" },
    ],
  },
  {
    id: 10,
    nom: "Dossier subventions JV (FJV, CNC, Europe Creative)",
    couleur: "#88FF88",
    icone: "🌱",
    description: "Dossier de demande de subventions jeu vidéo auprès des organismes publics",
    submodules: [
      { id: "10.1", nom: "Fiche projet", description: "Format CNC/FJV" },
      { id: "10.2", nom: "Démo / teaser", description: "Description, liens" },
      { id: "10.3", nom: "Analyse marché", description: "Positionnement, niches" },
      { id: "10.4", nom: "Budget & plan de financement", description: "Grilles CNC/FJV" },
      { id: "10.5", nom: "Équipe & expertises", description: "CV, compétences techniques" },
      { id: "10.6", nom: "Calendrier", description: "Phases alpha, beta, release" },
    ],
  },
];

export function getModule(moduleId: number): Module | undefined {
  return MODULES.find((m) => m.id === moduleId);
}

export function getSubmodule(moduleId: number, submoduleId: string): Submodule | undefined {
  const module = getModule(moduleId);
  return module?.submodules.find((s) => s.id === submoduleId);
}
