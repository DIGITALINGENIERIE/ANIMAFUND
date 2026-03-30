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
  meta_ai: `Meta.ai (Llama 4) — Modèle conversationnel ouvert.
FORMAT : Instructions directes et hiérarchisées. Préfère les listes structurées avec numérotation explicite.
STYLE : Ton assertif, formulations en mode impératif pour les sections d'action.
OPTIMISATION : Sépare clairement le contexte des instructions avec des délimiteurs ===.`,
  roboneo: `Roboneo — Plateforme IA spécialisée médias.
FORMAT : Structure JSON-ready avec balises sémantiques <section>, <data>, <instruction>.
STYLE : Clés descriptives en snake_case pour les données, contenu narratif pour les instructions.
OPTIMISATION : Chaque section doit être extractable indépendamment.`,
  google_flow: `Google Flow Studio — Génération multimodale.
FORMAT : Inclut des balises [VISUAL_DESCRIPTION], [AUDIO_CUE], [ANIMATION_DIRECTIVE] là où pertinent.
STYLE : Descriptions visuelles ultra-précises (palette Pantone, style artistique référencé).
OPTIMISATION : Structure adaptée au parsing multimodal, avec métadonnées de génération.`,
  midjourney: `Midjourney v6 — Génération d'images IA.
FORMAT : Paramètres de style à la fin : --ar [ratio] --style [style] --v 6 --q 2
STYLE : Descriptions visuelles denses, références artistiques précises, termes techniques photo/cinéma.
OPTIMISATION : Évite les abstractions — décrit ce qui DOIT être visible concrètement.`,
  runway: `Runway Gen-3 Alpha — Génération vidéo IA.
FORMAT : Structure : [SCÈNE] > [MOUVEMENT CAMÉRA] > [ACTION] > [DURÉE] > [AMBIANCE]
STYLE : Directives de mouvement précises (dolly in/out, tracking shot, etc.), description temporelle.
OPTIMISATION : Limites 10 secondes par clip — découpe narrative adaptée.`,
  gpt5: `GPT-5 (OpenAI) — Raisonnement avancé et structured outputs.
FORMAT : Utilise les XML tags pour structurer : <context>, <task>, <constraints>, <output_format>
STYLE : Instructions de raisonnement explicites ("Raisonne étape par étape avant de répondre").
OPTIMISATION : Exploite les structured outputs JSON schema pour les données chiffrées.`,
  claude: `Claude (Anthropic) — Excellence analytique et rigueur documentaire.
FORMAT : XML tags hiérarchiques : <document>, <section name="">, <data>, <instruction>, <example>
STYLE : Registre institutionnel, instructions en bullet points exhaustifs, exemples few-shot intégrés.
OPTIMISATION : Séquence optimale — contexte → instructions → contraintes → format de sortie.`,
};

const GENRE_LABELS: Record<string, string> = {
  animation_2d: "Animation 2D (série ou long métrage)",
  animation_3d: "Animation 3D (série ou long métrage)",
  jeu_video: "Jeu Vidéo (PC/console/mobile)",
  hybride: "Projet Hybride (Animation + Jeu Vidéo transmédia)",
};

const AVANCEMENT_LABELS: Record<string, string> = {
  idee: "Stade Idée — Pas de document produit",
  ecriture: "En écriture — Scénario/scènes en développement",
  concept_art: "Concept Art en cours — Direction artistique définie",
  prototype: "Prototype disponible — Version jouable/pilote animé interne",
  demo: "Démo jouable / Pilote animé — Matériel de présentation prêt",
};

function buildProjectContext(ctx: PromptContext): string {
  const { project } = ctx;
  const equipeStr = project.equipe?.length
    ? project.equipe.map((e) => `**${e.nom}** (${e.role}) — ${e.bioCourte}`).join("\n  ")
    : "[À COMPLÉTER — liste les membres clés avec leurs rôles et expériences]";
  const refStr = project.references?.length
    ? project.references.join(", ")
    : "[À COMPLÉTER — références artistiques et commerciales du projet]";
  const tonStr = project.ton?.length
    ? project.ton.join(", ")
    : "[À COMPLÉTER — registre tonique du projet]";

  const budgetTotal = Number(project.budgetTotal);
  const montantRecherche = Number(project.montantRecherche);
  const ratioFinancement = budgetTotal > 0
    ? `(soit ${Math.round((montantRecherche / budgetTotal) * 100)}% du budget total)`
    : "";

  return `### FICHE PROJET — "${project.nom}"

| Champ | Valeur |
|-------|--------|
| **Société** | ${project.societe || "[À COMPLÉTER]"} |
| **SIRET** | ${project.siret || "[À COMPLÉTER]"} |
| **Région** | ${project.region || "[À COMPLÉTER]"} |
| **Genre** | ${GENRE_LABELS[project.genre] || project.genre} |
| **Cible** | ${project.cible || "[À COMPLÉTER]"} |
| **Avancement** | ${AVANCEMENT_LABELS[project.avancement] || project.avancement} |
| **Budget total** | ${budgetTotal > 0 ? budgetTotal.toLocaleString("fr-FR") + " €" : "[À COMPLÉTER]"} |
| **Montant recherché** | ${montantRecherche > 0 ? montantRecherche.toLocaleString("fr-FR") + " € " + ratioFinancement : "[À COMPLÉTER]"} |

**LOGLINE :** ${project.logline || "[À COMPLÉTER — phrase d'accroche synthétisant le projet en 1-2 lignes]"}

**SYNOPSIS COURT :**
${project.synopsisCourt || "[À COMPLÉTER — résumé de 200-400 mots présentant l'univers, les enjeux et l'originalité]"}

**TON & REGISTRE :** ${tonStr}

**RÉFÉRENCES ARTISTIQUES/COMMERCIALES :** ${refStr}

**ÉQUIPE CLÉ :**
  ${equipeStr}`;
}

export function buildExpertPrompt(ctx: PromptContext, planningContext = ""): string {
  const projectCtx = buildProjectContext(ctx);
  const platformInstr = PLATFORM_INSTRUCTIONS[ctx.targetPlatform] || PLATFORM_INSTRUCTIONS.claude;

  return `# MISSION GOD TIER — ${ctx.moduleName.toUpperCase()}
# DOCUMENT : ${ctx.submoduleName.toUpperCase()} — STYLE EXPERT INSTITUTIONNEL

---

## SECTION A — PROFIL & AUTORITÉ DE L'EXPERT

Tu incarnes un consultant senior spécialisé en financement de projets créatifs, avec 20 ans d'expérience dans l'industrie audiovisuelle et du jeu vidéo française. Tu as :
- Accompagné 300+ dossiers auprès du CNC (taux d'obtention 82%), de régions, de fonds européens
- Siégé dans des commissions de sélection CNC pendant 6 ans
- Publié dans la revue spécialisée "Écran Total" et "Ludovision"
- Formé des porteurs de projets à Sciences Po Paris et à l'ENSAD

Tu connais par cœur :
- Le **décret n°2021-1240 du 24 septembre 2021** relatif au soutien automatique à la production d'œuvres cinématographiques
- Les **règlements FJV 2024** (Fonds Jeux Vidéo, budget annuel 10M€, critères culturels et économiques)
- Les **appels à projets Europe Creative MEDIA 2024** (développement, production, distribution)
- Les **grilles tarifaires FICAM 2024** pour les budgets d'animation
- Les **taux d'aide COSIP** selon les types de commandes (hertzien, câble, à la demande)

---

## SECTION B — CONTEXTE PROJET COMPLET

${projectCtx}

---
${planningContext ? `\n## SECTION C — ANALYSE STRATÉGIQUE PRÉ-GÉNÉRÉ (Chain-of-Thought)\n${planningContext}\n\n---\n` : ""}

## SECTION ${planningContext ? "D" : "C"} — MISSION SPÉCIFIQUE

**Module :** ${ctx.moduleName}
**Document à produire :** ${ctx.submoduleName}
**Description de la mission :** ${ctx.submoduleDescription}
${ctx.moduleSpecificData ? `\n**Données complémentaires fournies :**\n\`\`\`json\n${JSON.stringify(ctx.moduleSpecificData, null, 2)}\n\`\`\`` : ""}

---

## SECTION ${planningContext ? "E" : "D"} — OBJECTIF DE QUALITÉ ABSOLUE

Ce document sera lu par des experts sectoriels exigeants. Il doit :
1. **Convaincre techniquement** : tout chiffre est sourcé, tout argument est étayé
2. **Prouver la viabilité** : artistique ET économique ET réglementaire simultanément
3. **Anticiper les objections** : les points faibles sont mentionnés ET contrebalancés
4. **Respecter la grammaire institutionnelle** : formulations en mode indicatif assertif, vocabulaire du secteur

---

## SECTION ${planningContext ? "F" : "E"} — CONTRAINTES IMPÉRATIVES DE PRODUCTION

### FORMAT
- Document structuré avec numérotation hiérarchique (1. / 1.1 / 1.1.1)
- Tableaux pour toutes les données chiffrées
- Notes de bas de section pour les références réglementaires
- Longueur : 10 à 20 pages équivalent (dense, pas dilué)

### LANGUE & STYLE
- Français institutionnel : indicatif présent assertif ("le projet dispose de", "la société présente")
- Zéro conditionnel vague ("pourrait", "envisage de") sauf pour les projections financières avec base justifiée
- Chiffres toujours contextualisés : "250k€ de masse salariale, soit 31% du budget — cohérent avec les standards FICAM pour ce type de production"

### RÉGLEMENTAIRE
- Citer les textes avec numéro + date + article précis si applicable
- Signaler les obligations (⚠️ OBLIGATOIRE), les bonnes pratiques (✓ RECOMMANDÉ) et les optionnels (○ OPTIONNEL)
- Toute donnée manquante = [À COMPLÉTER — explication de pourquoi c'est critique et quels documents apporter]

### ANTI-HALLUCINATION ABSOLUE
- N'invente AUCUN chiffre, nom de personne, structure, ou référence non fournie
- Si une donnée est absente : [À COMPLÉTER — ex: "Attestation comptable sur les fonds propres de la société"]
- Les exemples few-shot peuvent inclure des références à des projets réels bien connus du secteur

---

## SECTION ${planningContext ? "G" : "F"} — STRUCTURE OBLIGATOIRE DU DOCUMENT

### 1. PAGE DE GARDE & INFORMATIONS ADMINISTRATIVES
Tous les champs obligatoires CNC/FJV/Europe Creative selon l'organisme cible.

### 2. PRÉSENTATION DE LA SOCIÉTÉ PRODUCTRICE
Forme juridique, capital, historique, références de production, certifications.

### 3. ${ctx.submoduleName.toUpperCase()} — CORPS PRINCIPAL
Développement complet selon les spécificités de ce document (${ctx.submoduleDescription}).

### 4. ARGUMENTATION DE FINANCEMENT
Triple argument : artistique + économique + stratégique pour le secteur.

### 5. PLAN DE VALORISATION
Distribution, exploitation secondaire, internationalisation.

### 6. ANNEXES REQUISES
Liste précise des pièces justificatives avec formats et délais.

### 7. ATTESTATIONS & SIGNATURES
Déclarations légales requises par l'organisme.

---

## SECTION ${planningContext ? "H" : "G"} — PARAMÈTRES PLATEFORME CIBLE

**Plateforme sélectionnée :** ${ctx.targetPlatform.toUpperCase()}
${platformInstr}

---

## GÉNÈRE MAINTENANT

Produis le document complet "${ctx.submoduleName}" pour le projet "${ctx.project.nom}".
Commence directement par le contenu — pas de préambule, pas de commentaire méta.
Chaque ligne doit gagner sa place dans le document.`;
}

export function buildCreatifPrompt(ctx: PromptContext, planningContext = ""): string {
  const projectCtx = buildProjectContext(ctx);
  const platformInstr = PLATFORM_INSTRUCTIONS[ctx.targetPlatform] || PLATFORM_INSTRUCTIONS.claude;

  return `# MISSION GOD TIER — ${ctx.moduleName.toUpperCase()}
# DOCUMENT : ${ctx.submoduleName.toUpperCase()} — STYLE NARRATIF / PITCH POWER

---

## PROFIL CRÉATEUR

Tu es un storyteller de l'industrie créative qui a :
- Vendu des formats à Netflix Europe, Canal+, Arte
- Pitché à Sundance, Tribeca, MIFA Annecy, GDC San Francisco
- Remporté des financements CNC pour 15 premiers films / premiers jeux
- Co-écrit avec des réalisateurs primés aux César

Ton superpouvoir : transformer un dossier administratif en **récit irrésistible**. Tu sais que la commission CNC reçoit 400 dossiers — le tien doit être le seul dont ils parlent le lendemain.

---

## CONTEXTE PROJET

${projectCtx}

---
${planningContext ? `\n## ANALYSE STRATÉGIQUE (CoT)\n${planningContext}\n\n---\n` : ""}

## MISSION : ${ctx.submoduleName}

${ctx.submoduleDescription}

**L'enjeu :** Rédiger un "${ctx.submoduleName}" qui ne se lit pas — qui se **dévore**. Qui fait que les membres du jury se penchent en avant. Qui fait qu'un investisseur appelle le lendemain.
${ctx.moduleSpecificData ? `\n**Contexte additionnel :** \`\`\`json\n${JSON.stringify(ctx.moduleSpecificData, null, 2)}\n\`\`\`` : ""}

---

## LA RÈGLE D'OR

Après chaque paragraphe, demande-toi : **"Et alors ? Pourquoi ça change tout ?"**
Si la réponse n'est pas évidente dans le texte même, réécris.

---

## STRUCTURE NARRATIVE (flexible, mais cette ossature)

### ACCROCHE — La phrase qui capture
1-3 phrases maximum. L'image ou l'idée qui reste dans la tête 3 jours après. Peut être une question rhétorique, une statistique choc, ou une image poétique ancrée dans le réel.

### LE MONDE SANS CE PROJET
Qu'est-ce qui manque ? Quel vide culturel, émotionnel ou commercial "${ctx.project.nom}" comble-t-il ? Évite le générique — sois chirurgicalement précis sur CE projet.

### LA RÉPONSE UNIQUE ET INÉVITABLE
Pourquoi "${ctx.project.nom}" et pas autre chose ? La convergence projet-moment-équipe. Utilise les références artistiques de manière non-naïve : pas "notre projet ressemble à X" mais "là où X a fait Y, nous fracturons Z".

### LES PREUVES QUE ÇA MARCHE
Équipe → crédibilité. Avancement → sérieux. Références → ancrage marché. Chaque élément doit **prouver**, pas simplement exister.

### LE MODÈLE ÉCONOMIQUE RACONTÉ
Pas un tableau Excel — une histoire de valeur. Qui paie, pourquoi, combien, quand. Contextualisé dans les benchmarks du secteur.

### LA DEMANDE — Nette, justifiée, irrésistible
Montant précis. Utilisation précise. ROI projeté pour le bailleur. La demande comme évidence logique après tout ce qui précède.

### LA SIGNATURE — Ce qui reste
La dernière phrase que le jury lit. Celle qu'ils citent en délibéré. Mémorable, courte, propre au projet.

---

## ANTI-PATTERNS INTERDITS
- ❌ "Notre équipe passionnée croit en ce projet..."
- ❌ "Le marché est en pleine croissance..."
- ❌ "Projet innovant et original qui..."
- ❌ Chiffres sans contexte ("10M€ de revenus" → TOUJOURS "10M€ soit 3x le budget, dans la fourchette haute des projets similaires au CNC")
- ❌ Références artistiques naïves ("c'est comme Studio Ghibli mais...")
- ❌ Conditionnel de politesse ("nous espérons pouvoir...")

---

## CONTRAINTES QUALITÉ
- Phrases courtes et rythmées dans les sections d'accroche, plus élaborées dans les arguments
- Aucun anglicisme sauf terminologie métier consacrée
- Tout chiffre = contextualisé dans le secteur
- Zéro hallucination : données manquantes = [À COMPLÉTER — spécifie quoi]
- Longueur : 6-12 pages équivalent — dense, impactant, pas soporifique

---

## CALIBRAGE PLATEFORME
${platformInstr}

---

Lance-toi. "${ctx.project.nom}" mérite mieux que la médiocrité.
Commence directement par l'accroche — pas de préambule.`;
}

export function buildTemplatePrompt(ctx: PromptContext, planningContext = ""): string {
  const projectCtx = buildProjectContext(ctx);
  const platformInstr = PLATFORM_INSTRUCTIONS[ctx.targetPlatform] || PLATFORM_INSTRUCTIONS.claude;

  return `# MISSION GOD TIER — ${ctx.moduleName.toUpperCase()}
# DOCUMENT : ${ctx.submoduleName.toUpperCase()} — TEMPLATE OPÉRATIONNEL PLUG & PLAY

---

## OBJECTIF DU TEMPLATE

Générer un template **directement utilisable** pour "${ctx.submoduleName}" dans le cadre du module "${ctx.moduleName}". 

Ce template doit être :
- **Plug & Play** : copiable tel quel dans un éditeur, avec seulement les [ZONES] à compléter
- **Pré-rempli** avec les données projet disponibles
- **Guidé** : chaque zone vide explique précisément quoi y mettre et pourquoi
- **Réglementairement exact** : conforme aux normes CNC/FJV/Europe Creative 2024

---

## DONNÉES PROJET INJECTÉES

${projectCtx}

---
${planningContext ? `\n## ANALYSE STRATÉGIQUE (CoT)\n${planningContext}\n\n---\n` : ""}

## MODULE CIBLE
**${ctx.moduleName}** › **${ctx.submoduleName}**
${ctx.submoduleDescription}
${ctx.moduleSpecificData ? `\n**Paramètres additionnels :** \`\`\`json\n${JSON.stringify(ctx.moduleSpecificData, null, 2)}\n\`\`\`` : ""}

---

## CONVENTIONS DU TEMPLATE

| Balise | Signification |
|--------|---------------|
| \`[VALEUR_PROJET]\` | Données du projet déjà disponibles — à vérifier |
| \`[À COMPLÉTER — guide]\` | Donnée manquante avec instructions précises |
| **⚠️ OBLIGATOIRE** | Champ requis par la réglementation |
| **✓ RECOMMANDÉ** | Fortement conseillé par les instructeurs |
| **○ OPTIONNEL** | Valorisant mais non bloquant |
| \`/* formule */\` | Calcul à effectuer (inline en commentaire Markdown) |

---

## TEMPLATE COMPLET — ${ctx.submoduleName.toUpperCase()}

Génère maintenant le template intégral structuré en sections avec :

### SECTION 1 — EN-TÊTE ET PAGE DE GARDE ⚠️ OBLIGATOIRE
Template pré-formaté avec tous les champs d'identification requis, pré-rempli avec les données du projet "${ctx.project.nom}" disponibles.

### SECTION 2 — CORPS PRINCIPAL : ${ctx.submoduleName.toUpperCase()}
Le cœur du document — les sous-sections spécifiques à ce module, avec :
- Des formulations types pré-rédigées (directement utilisables, pas des descriptions)
- Des exemples concrets entre [BRACKETS] basés sur les données du projet
- Des tableaux pré-formatés pour les données chiffrées

### SECTION 3 — DONNÉES CHIFFRÉES ET TABLEAUX
Grilles avec colonnes pré-définies, formules de calcul en commentaires, totaux et pourcentages.

### SECTION 4 — PIÈCES JUSTIFICATIVES REQUISES
Liste exhaustive avec : nom du document | format accepté | date de validité requise | organisme émetteur

### SECTION 5 — CHECKLIST DE VALIDATION FINALE
\`\`\`
□ [⚠️ OBLIGATOIRE] Vérification 1 — Description de ce qu'on vérifie
□ [⚠️ OBLIGATOIRE] Vérification 2 — Description
□ [✓ RECOMMANDÉ]  Vérification 3 — Description
□ [○ OPTIONNEL]   Vérification 4 — Description
\`\`\`

---

## FORMAT DE SORTIE
Markdown pur et propre. Prêt à être collé dans Word / Notion / Google Docs.
Adapté pour : ${platformInstr}

---

Génère le template complet maintenant. Commence directement par la Section 1.`;
}

export function buildScoringPrompt(promptContent: string, style: string): string {
  return `Tu es l'évaluateur qualité d'ANIMAFUND — tu notes des prompts de financement pour l'industrie créative française (animation, jeu vidéo).

**BARÈME DE RÉFÉRENCE :**
- **< 70** = Insuffisant : générique, incomplet, ou contient des hallucinations
- **70-84** = Bon : solide mais manque de personnalisation ou d'ancrage réglementaire
- **85-94** = Excellent : professionnel, personnalisé, utilisable tel quel
- **95-100** = God Tier : dossier CNC-ready, aucune amélioration évidente possible, ferait partie du top 5% des dossiers reçus

**PROMPT À ÉVALUER (style "${style}") :**
\`\`\`
${promptContent.substring(0, 4000)}${promptContent.length > 4000 ? "\n[... TRONQUÉ POUR L'ÉVALUATION ...]" : ""}
\`\`\`

**GRILLE D'ÉVALUATION DÉTAILLÉE :**

1. **Complétude** (0-20 pts)
   - 20 : Toutes les sections requises présentes et développées avec profondeur
   - 15 : Quelques sections légèrement superficielles
   - 10 : Des sections importantes manquantes ou squelettiques
   - <10 : Document largement incomplet

2. **Spécificité projet** (0-20 pts)
   - 20 : Chaque paragraphe contient des éléments propres au projet — impossible de copier-coller sur un autre dossier
   - 15 : Bonne personnalisation sauf quelques passages génériques
   - 10 : Alternance générique/spécifique déséquilibrée
   - <10 : Pourrait s'appliquer à n'importe quel projet du secteur

3. **Précision réglementaire** (0-15 pts)
   - 15 : Textes cités avec numéros, dates, articles. Terminologie CNC/FJV/Europe Creative exacte.
   - 10 : Mentions réglementaires présentes mais imprécises
   - 5 : Vague référence aux normes sectorielles
   - 0 : Aucune ancrage réglementaire

4. **Structure et clarté** (0-15 pts)
   - 15 : Hiérarchie parfaite, format de sortie explicite et non-ambigu, navigation aisée
   - 10 : Bonne structure avec quelques ambiguïtés de format
   - 5 : Structure à revoir pour faciliter la lecture en commission
   - 0 : Document difficile à parcourir

5. **Qualité des exemples (few-shot)** (0-10 pts)
   - 10 : Exemples ultra-pertinents, non-naïfs, contextualisés dans le secteur français
   - 7 : Exemples corrects mais pas mémorables
   - 3 : Exemples génériques ou maladroits
   - 0 : Pas d'exemples

6. **Contrôle anti-hallucination** (0-10 pts)
   - 10 : Zéro invention, toutes les zones manquantes clairement balisées [À COMPLÉTER]
   - 7 : Quelques approximations sans invention réelle
   - 3 : Des passages qui semblent inventer des données
   - 0 : Hallucinations détectées

7. **Optimisation plateforme** (0-10 pts)
   - 10 : Format de sortie parfaitement adapté à la plateforme cible, instructions de formatage précises
   - 7 : Adaptation partielle
   - 3 : Peu d'adaptation au contexte plateforme
   - 0 : Aucune considération de la plateforme cible

**RÉPONDS UNIQUEMENT EN JSON VALIDE — sans markdown autour, juste le JSON :**
{
  "scoreTotal": <0-100>,
  "completude": <0-20>,
  "specificite": <0-20>,
  "precisionReglementaire": <0-15>,
  "clartéStructure": <0-15>,
  "fewShotQuality": <0-10>,
  "controleQualite": <0-10>,
  "adaptationPlateforme": <0-10>,
  "weakPoints": ["point faible actionnable 1", "point faible actionnable 2", "point faible actionnable 3"],
  "mention": "<insuffisant|bon|excellent|god_tier>"
}

Où mention : scoreTotal < 70 = "insuffisant" | 70-84 = "bon" | 85-94 = "excellent" | ≥ 95 = "god_tier"`;
}

export function buildImprovementPrompt(
  originalPrompt: string,
  weakPoints: string[],
  style: string,
  ctx: PromptContext
): string {
  const budgetTotal = Number(ctx.project.budgetTotal);
  const montantRecherche = Number(ctx.project.montantRecherche);

  return `Tu dois transformer ce prompt de style "${style}" en version God Tier (score cible : 95+/100) pour le projet "${ctx.project.nom}".

## PROMPT À AMÉLIORER
\`\`\`
${originalPrompt.substring(0, 5000)}${originalPrompt.length > 5000 ? "\n[... TRONQUÉ ...]" : ""}
\`\`\`

## POINTS FAIBLES IDENTIFIÉS — À CORRIGER IMPÉRATIVEMENT
${weakPoints.map((w, i) => `**${i + 1}.** ${w}`).join("\n")}

## DONNÉES PROJET DISPONIBLES POUR ENRICHIR
- Nom : "${ctx.project.nom}"
- Genre : ${ctx.project.genre}
- Budget total : ${budgetTotal > 0 ? budgetTotal.toLocaleString("fr-FR") + "€" : "[non renseigné]"}
- Montant recherché : ${montantRecherche > 0 ? montantRecherche.toLocaleString("fr-FR") + "€" : "[non renseigné]"}
- Avancement : ${ctx.project.avancement}
- Logline : "${ctx.project.logline || "[non renseignée]"}"
- Module : "${ctx.moduleName}" > "${ctx.submoduleName}"

## STRATÉGIE D'AMÉLIORATION

Pour chaque point faible, applique cette correction :

**Si manque de spécificité** → Réécris chaque phrase générique en injectant des données propres au projet. Teste : "peut-on coller cette phrase sur un autre projet ?" — si oui, réécris.

**Si manque de précision réglementaire** → Ajoute les références exactes : décret CNC n°2021-1240, règlement FJV 2024 article X, critères COSIP, conventions FICAM, etc.

**Si structure insuffisante** → Restructure avec numérotation hiérarchique 1. / 1.1 / 1.1.1, ajoute des tableaux pour les données chiffrées, clarifie le format de sortie attendu.

**Si few-shot faibles** → Remplace par des exemples de dossiers réels réussis du secteur (projets Xilam, Ankama, Ubisoft, Nacon — connus et sourcables).

**Si contrôle anti-hallucination faible** → Balaie le document, remplace toute donnée inventée par [À COMPLÉTER — explication].

**Si optimisation plateforme insuffisante** → Adapte le format de sortie aux spécificités de la plateforme : structure JSON pour Roboneo, XML tags pour Claude, paramètres --ar pour Midjourney, etc.

## RÈGLES DE L'AMÉLIORATION
1. Conserve la structure globale et le style "${style}" — améliore, ne réinvente pas
2. N'affaiblis pas ce qui fonctionnait déjà bien
3. Sois chirurgical sur les points faibles listés
4. Chaque phrase doit gagner sa place — supprime le rembourrage
5. La version améliorée doit être PLUS longue et PLUS dense que l'original si nécessaire

Génère la version améliorée complète maintenant (pas un résumé des changements — le document entier).`;
}
