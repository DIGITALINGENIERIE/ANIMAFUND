export interface PromptContext {
  moduleName: string;
  submoduleName: string;
  submoduleDescription: string;
  project: {
    nom: string;
    logline: string;
    synopsisCourt: string;
    genre: string;
    cible: string;
    ton: string[];
    references: string[];
    equipe: Array<{ nom: string; role: string; bioCourte: string }>;
    budgetTotal: number | string;
    montantRecherche: number | string;
    avancement: string;
    societe: string;
    siret: string;
    region: string;
  };
  targetPlatform: string;
  moduleSpecificData?: Record<string, unknown>;
}

const PLATFORM_INSTRUCTIONS: Record<string, string> = {
  meta_ai: "Meta.ai (Llama 4) - Optimise pour un modele conversationnel ouvert. Utilise des instructions claires et directes.",
  roboneo: "Roboneo - Plateforme IA specialisee medias. Privilege les structures JSON-ready et les balises semantiques.",
  google_flow: "Google Flow Studio - Optimise pour la generation multimodale. Integre des descriptions visuelles precises.",
  midjourney: "Midjourney - Specialise generation d'images. Inclus des parametres de style --ar, --style, --v6.",
  runway: "Runway Gen-3 - Generation video IA. Inclus directives de mouvement, camera, et duree.",
  gpt5: "GPT-5 - Modele OpenAI dernier generation. Exploite les capacites de raisonnement avance et structured outputs.",
  claude: "Claude (Anthropic) - Excellence analytique et rigueur documentaire. Privilege les instructions XML tags et la structure hierarchique.",
};

const GENRE_LABELS: Record<string, string> = {
  animation_2d: "Animation 2D",
  animation_3d: "Animation 3D",
  jeu_video: "Jeu Vidéo",
  hybride: "Projet Hybride (Animation + JV)",
};

const AVANCEMENT_LABELS: Record<string, string> = {
  idee: "Stade Idée",
  ecriture: "En écriture",
  concept_art: "Concept Art en cours",
  prototype: "Prototype disponible",
  demo: "Démo jouable / pilote animé",
};

function buildProjectContext(ctx: PromptContext): string {
  const { project } = ctx;
  const equipeStr = project.equipe?.length
    ? project.equipe.map((e) => `${e.nom} (${e.role}): ${e.bioCourte}`).join("; ")
    : "À compléter";
  const refStr = project.references?.length ? project.references.join(", ") : "À préciser";
  const tonStr = project.ton?.length ? project.ton.join(", ") : "À définir";

  return `**PROJET : ${project.nom}**
- Société : ${project.societe} | SIRET: ${project.siret} | Région: ${project.region}
- Genre : ${GENRE_LABELS[project.genre] || project.genre}
- Logline : ${project.logline}
- Synopsis : ${project.synopsisCourt}
- Cible : ${project.cible}
- Ton : ${tonStr}
- Références artistiques : ${refStr}
- Équipe clé : ${equipeStr}
- Budget total : ${Number(project.budgetTotal).toLocaleString("fr-FR")} €
- Montant recherché : ${Number(project.montantRecherche).toLocaleString("fr-FR")} €
- Avancement : ${AVANCEMENT_LABELS[project.avancement] || project.avancement}`;
}

export function buildExpertPrompt(ctx: PromptContext): string {
  const projectCtx = buildProjectContext(ctx);
  const platformInstr = PLATFORM_INSTRUCTIONS[ctx.targetPlatform] || PLATFORM_INSTRUCTIONS.claude;

  return `# PROMPT GOD TIER — ${ctx.moduleName} — ${ctx.submoduleName}
## STYLE : EXPERT / FORMEL

## 1. RÔLE & CONTEXTE
Tu es un expert consultant senior en financement et développement de projets ${ctx.project.genre.includes("jeu") ? "jeu vidéo" : "d'animation"}, avec 15+ années d'expérience. Tu as accompagné plus de 200 dossiers auprès du CNC, des régions, d'investisseurs privés et de fonds européens (Europe Creative, Eurimages). Ton taux d'obtention de financement dépasse 78%. Tu maîtrises parfaitement les normes CNC 2024, les grilles FJV, et les standards internationaux de pitch.

## 2. CONTEXTE PROJET COMPLET
${projectCtx}

## 3. MISSION SPÉCIFIQUE — ${ctx.submoduleName}
${ctx.submoduleDescription}
${ctx.moduleSpecificData ? `\n**Données spécifiques au module :**\n${JSON.stringify(ctx.moduleSpecificData, null, 2)}` : ""}

## 4. OBJECTIF PRINCIPAL
Produire un document "${ctx.submoduleName}" de niveau professionnel qui permet d'obtenir le financement ou l'agrément ciblé. Ce document sera présenté devant une commission d'experts du secteur audiovisuel/jeu vidéo, des investisseurs institutionnels ou des jurés de festival. Il doit convaincre de la viabilité artistique ET économique du projet.

## 5. CONTRAINTES & FORMAT
- Format : Document structuré en sections claires, avec titres numérotés
- Langue : Français professionnel, registre institutionnel
- Longueur : Entre 8 et 15 pages équivalent selon la complexité
- Normes : Conforme aux grilles CNC 2024 / FJV 2024 / Europe Creative 2024
- Obligatoire : Absence totale d'hallucination — toute donnée manquante doit être signalée [À COMPLÉTER]

## 6. STRUCTURE OBLIGATOIRE
1. Page de garde avec informations administratives complètes
2. Présentation du projet et de la société
3. ${ctx.submoduleName} — Corps principal du document
4. Justifications et arguments de financement
5. Perspectives et plan de valorisation
6. Annexes et documents justificatifs
7. Attestations et signatures

## 7. STYLE & TON
Expert et institutionnel : vocabulaire sectoriel précis, formulations en mode indicatif assertif ("le projet présente", "la société dispose de"), données chiffrées systématiquement citées avec leur source, structure logique et persuasive.

## 8. EXEMPLES DE RÉFÉRENCE (few-shot)
Pour un dossier CNC similaire réussi : "L'équipe fondatrice cumule 45 années d'expérience combinée dans la production d'animation française, avec 12 titres produits générant un CA cumulé de 8,2M€..."
Pour une bible artistique primée : "L'univers graphique s'inspire du réalisme magique de Miyazaki et de l'expressionnisme de Bill Plympton, transposé dans un trait 2D vectoriel haute précision..."

## 9. INSTRUCTIONS DE QUALITÉ ABSOLUE
- Zéro hallucination : Utilisez UNIQUEMENT les données fournies dans le contexte. Si une donnée est absente, indiquez [À COMPLÉTER PAR LE PORTEUR] et expliquez pourquoi elle est critique.
- Cohérence narrative : Chaque section doit renforcer la même vision du projet.
- Ancrage réglementaire : Citez les textes de référence (décret CNC, règlement FJV, cahier des charges Europe Creative) avec leurs numéros de version.
- Anti-généricité : Chaque phrase doit contenir au moins un élément propre au projet "${ctx.project.nom}".
- Plateforme cible : ${platformInstr}

Génère maintenant le document complet pour le module "${ctx.submoduleName}" du projet "${ctx.project.nom}".`;
}

export function buildCreatifPrompt(ctx: PromptContext): string {
  const projectCtx = buildProjectContext(ctx);
  const platformInstr = PLATFORM_INSTRUCTIONS[ctx.targetPlatform] || PLATFORM_INSTRUCTIONS.claude;

  return `# PROMPT GOD TIER — ${ctx.moduleName} — ${ctx.submoduleName}
## STYLE : CRÉATIF / INCISIF

## 1. PROFIL DE L'EXPERT
Tu es un storyteller de l'industrie créative — tu as pitché à Sundance, vendu des formats à Netflix Europe, remporté l'Ours d'Or de Berlin. Tu sais que derrière chaque dossier se cache une histoire. Ton arme : transformer des chiffres en récit, des CV en légendes, des budgets en promesses. Tu rends les commissions accros à tes dossiers.

## 2. L'HISTOIRE À RACONTER
${projectCtx}

## 3. CE QUE TU DOIS ACCOMPLIR — ${ctx.submoduleName}
${ctx.submoduleDescription}
Mission : Rédiger un "${ctx.submoduleName}" qui ne se lit pas — qui se dévore. Qui fait que les membres du jury se penchent en avant. Qui fait qu'un investisseur appelle le lendemain.
${ctx.moduleSpecificData ? `\n**Contexte additionnel :** ${JSON.stringify(ctx.moduleSpecificData, null, 2)}` : ""}

## 4. LA RÈGLE D'OR
Chaque paragraphe doit répondre à : "Et alors ? Pourquoi je m'en fous pas ?" — Si la réponse n'est pas évidente, récris.

## 5. FORMAT & CONTRAINTES
- Ouvre avec un accroche percutante (1-2 phrases max)
- Alterne données factuelles ET narration émotionnelle
- Cite les references artistiques de façon non-naïve ("Là où Spider-Man: Into the Spider-Verse a brisé les codes visuels, ${ctx.project.nom} fracture les codes narratifs")
- Termine par un appel à l'action implicite et mémorable
- Longueur : Dense mais pas soporifique — 6-10 pages maximum
- Zéro jargon incompréhensible pour un non-initié cultivé

## 6. STRUCTURE (flexible mais respectée)
1. L'accroche — La phrase qui tue
2. Le monde sans ce projet (le problème / l'opportunité manquée)
3. Le projet comme réponse unique et inévitable
4. Les preuves que ça marche (équipe + références + avancement)
5. Le modèle — Comment ça rapporte, à qui, quand
6. La demande — Nette, justifiée, irrésistible
7. La signature — Ce qui reste dans la tête

## 7. TON & STYLE
Incisif mais jamais vulgaire. Audacieux mais jamais arrogant. Le ton d'un créateur qui sait que son projet est une nécessité culturelle — pas une demande d'aumône. Phrases courtes. Rythme. Impact.

## 8. ANTI-PATTERNS À ÉVITER ABSOLUMENT
- "Notre équipe passionnée..." ❌
- "Projet innovant et original..." ❌
- "Le marché est en pleine croissance..." ❌
- Chiffres sans contexte ("10M€ de CA" sans dire "c'est 3x le budget d'un long métrage CNC standard") ❌

## 9. CALIBRAGE PLATEFORME
${platformInstr}
Adapte le format de sortie pour maximiser l'impact sur cette plateforme spécifique.

Lance-toi. "${ctx.project.nom}" mérite mieux que la médiocrité. Fais-en un chef-d'œuvre de persuasion.`;
}

export function buildTemplatePrompt(ctx: PromptContext): string {
  const projectCtx = buildProjectContext(ctx);
  const platformInstr = PLATFORM_INSTRUCTIONS[ctx.targetPlatform] || PLATFORM_INSTRUCTIONS.claude;

  return `# PROMPT GOD TIER — ${ctx.moduleName} — ${ctx.submoduleName}
## STYLE : STRUCTURÉ / TEMPLATE OPÉRATIONNEL

## 1. CONTEXTE D'UTILISATION
Tu vas générer un template opérationnel à remplir pour le module "${ctx.submoduleName}". Ce template doit être suffisamment précis pour guider un porteur de projet, et suffisamment flexible pour s'adapter à différentes situations. Les [BRACKETS] indiquent les zones à personnaliser.

## 2. DONNÉES DU PROJET INJECTÉES
${projectCtx}

## 3. MODULE CIBLE
**${ctx.moduleName}** > **${ctx.submoduleName}**
${ctx.submoduleDescription}
${ctx.moduleSpecificData ? `\n**Paramètres spécifiques :** ${JSON.stringify(ctx.moduleSpecificData, null, 2)}` : ""}

## 4. INSTRUCTIONS DE GÉNÉRATION DU TEMPLATE
Génère un template structuré en sections avec :
- Des titres H2/H3 en Markdown
- Des zones [À COMPLÉTER — exemple: description du poste] avec des exemples concrets entre parenthèses
- Des formulations types pré-rédigées que le porteur peut adopter ou adapter
- Des tableaux pré-formatés pour les données chiffrées
- Des listes de contrôle (checkboxes Markdown) pour les obligations réglementaires
- Des notes de bas de section expliquant les enjeux et pièges à éviter

## 5. SECTIONS DU TEMPLATE À GÉNÉRER
Génère les sections suivantes en les adaptant au module "${ctx.submoduleName}" :

### SECTION 1 : [Identification & En-tête]
Template de la page de garde avec tous les champs obligatoires pré-formatés.

### SECTION 2 : [Corps principal — ${ctx.submoduleName}]
Le cœur du document avec les sous-sections spécifiques à ce module.

### SECTION 3 : [Données chiffrées & Tableaux]
Grilles et tableaux pré-formatés avec formules et totaux automatiques.

### SECTION 4 : [Annexes recommandées]
Liste des pièces justificatives à joindre, avec les formats acceptés et les délais.

### SECTION 5 : [Checklist de validation]
- [ ] Vérification 1 (exemple : SIRET valide et actif)
- [ ] Vérification 2 (exemple : Budget équilibré à l'euro près)
[etc.]

## 6. RÈGLES DU TEMPLATE
- Chaque [ZONE À COMPLÉTER] doit inclure un exemple concret basé sur les données du projet
- Les formulations pré-rédigées doivent être directement utilisables, pas des descriptions de ce qu'il faut écrire
- Les tableaux doivent inclure les formules de calcul (en commentaire Markdown)
- Signale les champs OBLIGATOIRES (⚠️ OBLIGATOIRE) vs RECOMMANDÉS (✓ RECOMMANDÉ) vs OPTIONNELS (○ OPTIONNEL)

## 7. FORMAT DE SORTIE
Markdown pur, prêt à être copié dans tout éditeur de texte ou injecté dans ${platformInstr}.

Génère maintenant le template complet et opérationnel.`;
}

export function buildScoringPrompt(promptContent: string, style: string): string {
  return `Tu es un expert en qualité de prompts IA pour l'industrie créative (animation, jeu vidéo, production audiovisuelle).

Analyse ce prompt de style "${style}" et note-le de 0 à 100 selon les critères suivants :

**PROMPT À ÉVALUER :**
\`\`\`
${promptContent}
\`\`\`

**CRITÈRES DE NOTATION :**
1. Complétude (20 pts) : Toutes les sections nécessaires sont présentes et remplies
2. Spécificité (20 pts) : Le prompt contient des éléments propres au projet, pas du générique
3. Précision réglementaire (15 pts) : Référence aux bonnes normes avec versions correctes
4. Clarté structure (15 pts) : La structure de sortie est explicite et non ambiguë
5. Few-shot quality (10 pts) : Les exemples sont pertinents et bien choisis
6. Contrôle qualité (10 pts) : Instructions explicites pour éviter les hallucinations
7. Adaptation plateforme (10 pts) : Le prompt est optimisé pour la plateforme cible

**RÉPONDS UNIQUEMENT EN JSON valide avec ce format exact :**
{
  "scoreTotal": <0-100>,
  "completude": <0-20>,
  "specificite": <0-20>,
  "precisionReglementaire": <0-15>,
  "clartéStructure": <0-15>,
  "fewShotQuality": <0-10>,
  "controleQualite": <0-10>,
  "adaptationPlateforme": <0-10>,
  "weakPoints": ["point faible 1", "point faible 2"],
  "mention": "<insuffisant|bon|excellent|god_tier>"
}

Où mention est déterminé par : scoreTotal < 70 = "insuffisant", 70-84 = "bon", 85-94 = "excellent", >= 95 = "god_tier"`;
}

export function buildImprovementPrompt(
  originalPrompt: string,
  weakPoints: string[],
  style: string,
  ctx: PromptContext
): string {
  return `Tu dois améliorer ce prompt God Tier de style "${style}" pour le projet "${ctx.project.nom}".

**PROMPT ORIGINAL :**
\`\`\`
${originalPrompt}
\`\`\`

**POINTS FAIBLES IDENTIFIÉS À CORRIGER IMPÉRATIVEMENT :**
${weakPoints.map((w, i) => `${i + 1}. ${w}`).join("\n")}

**INSTRUCTIONS D'AMÉLIORATION :**
- Conserve la structure globale et le style "${style}"
- Améliore SPÉCIFIQUEMENT les points faibles listés ci-dessus
- N'affaiblis pas ce qui fonctionnait déjà bien
- Augmente la spécificité avec des données du projet "${ctx.project.nom}" (budget: ${ctx.project.budgetTotal}€, genre: ${ctx.project.genre}, avancement: ${ctx.project.avancement})
- Renforce les références réglementaires si manquantes
- Améliore la structure de sortie si ambiguë

Génère le prompt amélioré en version complète (pas juste les modifications).`;
}
