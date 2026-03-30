# ANIMAFUND — God Tier Prompt Generator

> **Générateur de prompts de niveau expert pour l'industrie créative française**
> Animation 2D/3D · Jeu Vidéo · Financement CNC · FJV · Europe Creative

---

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Fonctionnalités](#fonctionnalités)
- [Les 10 Modules](#les-10-modules)
- [Pipeline LLM Multi-Modèles](#pipeline-llm-multi-modèles)
- [Stack Technique](#stack-technique)
- [Structure du Projet](#structure-du-projet)
- [Démarrage rapide](#démarrage-rapide)
- [Variables d'environnement](#variables-denvironnement)
- [API REST](#api-rest)
- [Système de Scoring](#système-de-scoring)
- [Plateformes Cibles](#plateformes-cibles)

---

## Vue d'ensemble

ANIMAFUND est un système d'intelligence artificielle multi-modèles conçu pour produire des **documents de financement et de développement de niveau professionnel** pour les porteurs de projets créatifs en France.

Dossiers CNC, pitch decks investisseurs, bibles artistiques, Game Design Documents, business plans éditeurs — chaque document est généré via un pipeline à 4 étapes qui garantit une qualité **God Tier (95+/100)**.

Le système génère **3 variantes simultanées** (Expert institutionnel · Narratif/Pitch · Template opérationnel) pour chacun des **67+ sous-modules** répartis en **10 modules thématiques**, avec un scoring automatique et une boucle d'amélioration itérative.

---

## Fonctionnalités

### Génération God Tier
- **Chain-of-Thought** : Avant chaque génération, le système analyse le projet et produit un plan stratégique JSON (arguments phares, risques, angle narratif, données marché, mots-clés réglementaires)
- **3 styles de documents** générés en parallèle : Expert institutionnel, Créatif/Pitch Power, Template Plug & Play
- **Jusqu'à 4 itérations** d'amélioration automatique par style — le pipeline conserve toujours le meilleur résultat
- **Sorties jusqu'à 8 000 tokens** par document pour une couverture exhaustive

### Intelligence multi-modèles
- **Cerebras** (`llama-3.3-70b`) : génération initiale ultra-rapide + scoring + CoT planning
- **Claude** (`claude-3-5-sonnet-20241022`) : amélioration prioritaire (meilleure qualité rédactionnelle)
- **GPT-4o** : fallback d'amélioration si Claude indisponible
- Gestion gracieuse des indisponibilités — le système fonctionne avec Cerebras seul

### Scoring automatique (0–100)
Chaque output est noté sur 7 critères sectoriels avant/après amélioration :

| Critère | Points |
|---------|--------|
| Complétude du document | /20 |
| Spécificité projet (anti-générique) | /20 |
| Précision réglementaire (CNC/FJV/EU) | /15 |
| Clarté et structure de sortie | /15 |
| Qualité des exemples few-shot | /10 |
| Contrôle anti-hallucination | /10 |
| Optimisation plateforme cible | /10 |

**Mentions** : `insuffisant` (<70) · `bon` (70–84) · `excellent` (85–94) · `god_tier` (95+)

### Gestion de projets complète
Chaque projet stocke en base :
- Identité : nom, société, SIRET, région
- Artistique : logline, synopsis, genre, ton, références
- Équipe : membres clés avec rôle et biographie courte
- Financier : budget total, montant recherché, avancement
- Technique : cible, avancement (idée → démo jouable)

### Interface HUD futuriste
- Dashboard en temps réel : progression par module, scores, historique
- Panneau de configuration : plateforme cible, seuil God Tier ajustable (slider)
- Visualisation des 3 variantes avec scores détaillés
- Copie en un clic de chaque variant

---

## Les 10 Modules

| # | Module | Sous-modules | Usage principal |
|---|--------|:------------:|-----------------|
| 1 | **Dossier de financement CNC / Régions / Europe** | 8 | Commissions CNC, aides régionales, Europe Creative MEDIA |
| 2 | **Pitch Deck Investisseurs Animation** | 8 | Levée de fonds privés, SOFICA, fonds d'amorçage |
| 3 | **Bible Artistique (Art Bible)** | 8 | Direction artistique, références visuelles, identité graphique |
| 4 | **Plan de production Gantt** | 5 | Planification phases, jalons, ressources humaines |
| 5 | **Budget Prévisionnel Détaillé** | 6 | Grille FICAM, masse salariale, sous-traitance |
| 6 | **Dossier Technique Concours** | 6 | Annecy/MIFA, festivals, prix d'animation |
| 7 | **Rapport d'Activité Annuel** | 5 | Reporting subventions, bilans qualitatifs et quantitatifs |
| 8 | **Game Design Document (GDD)** | 8 | Core loop, systèmes, UI/UX, monétisation, specs techniques |
| 9 | **Business Plan Éditeur / Investisseur JV** | 7 | Éditeurs jeu vidéo, investors, analyses marché |
| 10 | **Dossier Subventions JV (FJV, CNC, Europe Creative)** | 6 | Fonds Jeux Vidéo 2024, COSIP, critères culturels |

**Total : 67 sous-modules**, chacun générant 3 variantes simultanées.

---

## Pipeline LLM Multi-Modèles

```
POST /api/prompts/generate
         │
         ▼
┌─────────────────────────────────────────────────────┐
│  ÉTAPE 0 — Chain-of-Thought Planning (Cerebras)     │
│                                                     │
│  Analyse stratégique du projet :                    │
│  • 3 arguments phares (financiers/artistiques)      │
│  • Risques à anticiper + contre-arguments           │
│  • Angle narratif optimal pour CE projet            │
│  • Données marché sectorielles à citer              │
│  • Mots-clés réglementaires CNC/FJV/EU              │
│  → JSON injecté dans les 3 variantes                │
└─────────────────────┬───────────────────────────────┘
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
    [EXPERT]     [CRÉATIF]    [TEMPLATE]
   temp=0.65    temp=0.82    temp=0.55
         │            │            │
         ▼            ▼            ▼
┌────────────────────────────────────────────────────┐
│  ITÉRATION 1 — Génération (Cerebras llama-3.3-70b) │
│  max_tokens: 8 000                                 │
└────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────┐
│  SCORING (Cerebras, temp=0.2)                      │
│  7 critères → score /100 + points faibles JSON     │
└────────────────────────────────────────────────────┘
         │
    score < seuil?
    (défaut: 85)
         │ OUI
         ▼
┌────────────────────────────────────────────────────┐
│  ITÉRATIONS 2–4 — Amélioration                     │
│  Priorité 1 : Claude claude-3-5-sonnet-20241022    │
│  Fallback   : GPT-4o                               │
│  Fallback 2 : Cerebras                             │
│                                                    │
│  Prompt d'amélioration ciblé sur les weakPoints    │
│  Le MEILLEUR score sur toutes les itérations       │
│  est conservé (pas uniquement le dernier)          │
└────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────┐
│  RÉSULTAT FINAL                                    │
│  3 variantes avec scores · mention · iterations   │
│  Sauvegarde PostgreSQL                             │
└────────────────────────────────────────────────────┘
```

### Températures par style

| Style | Température | Raisonnement |
|-------|:-----------:|--------------|
| Expert institutionnel | 0.65 | Précision réglementaire, cohérence factuelle |
| Créatif / Pitch Power | 0.82 | Originalité narrative, formulations mémorables |
| Template Plug & Play | 0.55 | Structure rigide, reproductibilité maximale |
| Scoring | 0.20 | Évaluation déterministe, JSON stable |
| Planning CoT | 0.30 | Analyse stratégique, faible entropie |

---

## Stack Technique

### Monorepo
| Outil | Version | Rôle |
|-------|---------|------|
| **pnpm workspaces** | 10.x | Gestionnaire de monorepo |
| **TypeScript** | 5.9 | Typage statique full-stack |
| **Node.js** | 24 | Runtime serveur |

### Backend (`artifacts/api-server`)
| Outil | Version | Rôle |
|-------|---------|------|
| **Express** | 5.x | Framework HTTP |
| **Drizzle ORM** | 0.44.x | ORM PostgreSQL type-safe |
| **Zod** | v4 | Validation des requêtes/réponses |
| **Cerebras SDK** | latest | LLM génération + scoring |
| **Anthropic SDK** | latest | LLM amélioration (Claude) |
| **OpenAI SDK** | latest | LLM amélioration fallback (GPT-4o) |
| **esbuild** | latest | Bundle production |
| **pino** | latest | Logger structuré JSON |

### Frontend (`artifacts/animafund`)
| Outil | Version | Rôle |
|-------|---------|------|
| **React** | 19.x | UI framework |
| **Vite** | 7.x | Build tool + dev server |
| **TailwindCSS** | 4.x | Styling utilitaire |
| **Framer Motion** | 12.x | Animations HUD |
| **React Query** | 5.x | State serveur + cache |
| **React Hook Form** | 7.x | Formulaires performants |
| **Lucide React** | latest | Icônes |

### Bibliothèques partagées
| Package | Rôle |
|---------|------|
| `lib/db` (`@workspace/db`) | Schéma Drizzle + connexion PostgreSQL |
| `lib/api-spec` (`@workspace/api-spec`) | Spec OpenAPI 3.1 + config Orval |
| `lib/api-client-react` (`@workspace/api-client-react`) | Hooks React Query générés |
| `lib/api-zod` (`@workspace/api-zod`) | Schémas Zod générés |

---

## Structure du Projet

```
animafund/
├── artifacts/
│   ├── api-server/                  # Backend Express 5
│   │   └── src/
│   │       ├── index.ts             # Entry point (PORT, démarrage)
│   │       ├── app.ts               # Middleware CORS, JSON, montage routes
│   │       ├── routes/
│   │       │   ├── index.ts         # Routeur principal /api
│   │       │   ├── health.ts        # GET /api/health
│   │       │   ├── projects.ts      # CRUD projets
│   │       │   └── prompts.ts       # Pipeline génération God Tier
│   │       ├── data/
│   │       │   └── modules.ts       # 10 modules + 67 sous-modules
│   │       └── lib/
│   │           ├── llm-client.ts    # Clients Cerebras/Claude/GPT + scoring
│   │           ├── prompt-templates.ts  # Prompts Expert/Créatif/Template
│   │           └── logger.ts        # Pino logger
│   │
│   └── animafund/                   # Frontend React + Vite
│       └── src/
│           ├── main.tsx             # Entry point
│           ├── pages/
│           │   └── Dashboard.tsx    # Page principale (sidebar + grille modules)
│           ├── components/
│           │   ├── ModuleCard.tsx   # Carte module avec progression
│           │   ├── PromptPanel.tsx  # Panneau affichage résultats
│           │   ├── ProjectForm.tsx  # Formulaire projet complet
│           │   └── ui/
│           │       └── hud.tsx      # Composants UI futuristes
│           └── hooks/
│               ├── use-projects.ts  # Hooks React Query projets
│               └── use-prompts.ts   # Hooks React Query prompts
│
├── lib/
│   ├── db/
│   │   └── src/
│   │       ├── index.ts             # Pool PostgreSQL + instance Drizzle
│   │       └── schema/
│   │           ├── projects.ts      # Table projects (14 champs)
│   │           └── prompts.ts       # Table generated_prompts
│   ├── api-spec/                    # OpenAPI 3.1 spec + Orval config
│   ├── api-client-react/            # Hooks générés (useProjects, usePrompts...)
│   └── api-zod/                     # Schémas Zod générés
│
├── scripts/                         # Scripts utilitaires TypeScript
├── pnpm-workspace.yaml
├── tsconfig.base.json               # Config TypeScript partagée
└── tsconfig.json                    # Project references root
```

---

## Démarrage rapide

### Prérequis
- Node.js 24+
- pnpm 10+
- PostgreSQL (ou Replit Database)

### Installation

```bash
# Cloner et installer les dépendances
pnpm install

# Pousser le schéma de base de données
pnpm --filter @workspace/db run push

# Lancer l'application complète (API port 3000 + Frontend port 5000)
PORT=3000 pnpm --filter @workspace/api-server run dev & \
PORT=5000 BASE_PATH=/ API_PORT=3000 pnpm --filter @workspace/animafund run dev
```

L'interface est accessible sur `http://localhost:5000`.

### Build production

```bash
# Typecheck complet (projet references)
pnpm run typecheck

# Build de tous les packages
pnpm run build

# Build API uniquement
pnpm --filter @workspace/api-server run build
```

### Régénérer les clients API (après modification de l'OpenAPI spec)

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## Variables d'environnement

| Variable | Requis | Description |
|----------|:------:|-------------|
| `DATABASE_URL` | ✅ | URL de connexion PostgreSQL (`postgres://...`) |
| `CEREBRAS_API_KEY` | ✅ | Clé API Cerebras Cloud — génération initiale + scoring |
| `ANTHROPIC_API_KEY` | ⬜ | Clé API Anthropic — amélioration via Claude (recommandé) |
| `OPENAI_API_KEY` | ⬜ | Clé API OpenAI — amélioration via GPT-4o (fallback) |
| `PORT` | ⬜ | Port API server (défaut : `3000`) |

> **Note** : Le système fonctionne avec `CEREBRAS_API_KEY` seul. L'ajout de `ANTHROPIC_API_KEY` ou `OPENAI_API_KEY` active automatiquement les étapes d'amélioration avec des modèles plus performants.

---

## API REST

### Projets

```
GET    /api/projects              → Liste tous les projets
POST   /api/projects              → Créer un projet
GET    /api/projects/:id          → Détail d'un projet
PATCH  /api/projects/:id          → Mettre à jour un projet
DELETE /api/projects/:id          → Supprimer un projet
```

### Génération God Tier

```
POST /api/prompts/generate
```

**Corps de la requête :**
```json
{
  "projectId": 1,
  "moduleId": 1,
  "submoduleId": "1.2",
  "targetPlatform": "claude",
  "scoringThreshold": 85,
  "moduleSpecificData": {}
}
```

**Réponse :**
```json
{
  "projectId": 1,
  "moduleId": 1,
  "submoduleId": "1.2",
  "targetPlatform": "claude",
  "iterations": 3,
  "finalScore": 91,
  "mention": "excellent",
  "variants": [
    {
      "style": "expert",
      "content": "# Dossier CNC...",
      "scoring": {
        "scoreTotal": 92,
        "completude": 18,
        "specificite": 19,
        "precisionReglementaire": 14,
        "clartéStructure": 14,
        "fewShotQuality": 9,
        "controleQualite": 9,
        "adaptationPlateforme": 9,
        "weakPoints": [],
        "mention": "excellent"
      }
    },
    { "style": "creatif", ... },
    { "style": "template", ... }
  ],
  "savedAt": "2024-03-30T12:00:00.000Z"
}
```

**Plateformes acceptées :** `claude` · `gpt5` · `meta_ai` · `roboneo` · `google_flow` · `midjourney` · `runway`

### Prompts sauvegardés

```
GET /api/prompts/:projectId                              → Tous les prompts d'un projet
GET /api/prompts/:projectId/:moduleId/:submoduleId       → Prompt spécifique
```

### Santé

```
GET /api/health  → {"status": "ok"}
```

---

## Système de Scoring

### Grille détaillée

| Critère | Points | 100% | 75% | 50% | <50% |
|---------|:------:|------|-----|-----|------|
| **Complétude** | /20 | Toutes sections présentes, profondes | Légèrement superficiel | Sections manquantes | Document squelettique |
| **Spécificité** | /20 | Impossible à copier sur un autre projet | Bonne personnalisation | Alternance générique/spécifique | Applicable à tout projet |
| **Précision réglementaire** | /15 | Textes cités avec n° et date | Mentions imprécises | Vague référence | Aucun ancrage |
| **Structure** | /15 | Hiérarchie parfaite, format de sortie non-ambigu | Quelques ambiguïtés | Structure à revoir | Difficile à parcourir |
| **Few-shot** | /10 | Exemples pertinents, non-naïfs, contextualisés | Corrects mais non mémorables | Génériques | Absent |
| **Anti-hallucination** | /10 | Zéro invention, zones balisées [À COMPLÉTER] | Quelques approximations | Passages inventés | Hallucinations |
| **Plateforme** | /10 | Format parfaitement adapté | Adaptation partielle | Peu d'adaptation | Aucune considération |

### Barème des mentions

| Score | Mention | Signification |
|:-----:|---------|---------------|
| 95–100 | 🏆 `god_tier` | Top 5% des dossiers du secteur. CNC-ready sans modification. |
| 85–94 | ⭐ `excellent` | Professionnel, utilisable tel quel avec révision mineure |
| 70–84 | ✓ `bon` | Solide mais nécessite personnalisation et enrichissement |
| <70 | ✗ `insuffisant` | Générique ou incomplet — régénération automatique déclenchée |

---

## Plateformes Cibles

Le prompt généré est adapté au format optimal de la plateforme IA finale :

| Plateforme | Optimisation |
|-----------|--------------|
| **Claude** | XML tags `<section>`, instructions exhaustives, few-shot intégrés |
| **GPT-5** | XML structuré `<context>/<task>/<constraints>`, structured outputs JSON |
| **Meta AI** | Instructions directes, hiérarchie numérotée, délimiteurs `===` |
| **Roboneo** | JSON-ready avec balises sémantiques, sections extractables indépendamment |
| **Google Flow** | Balises `[VISUAL_DESCRIPTION]`, `[AUDIO_CUE]`, descriptions multimodales |
| **Midjourney** | Paramètres `--ar --style --v 6`, descriptions visuelles denses |
| **Runway Gen-3** | Structure `[SCÈNE] > [CAMÉRA] > [ACTION] > [DURÉE]`, clips 10s |

---

## Schéma de base de données

### Table `projects`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | serial PK | Identifiant auto-incrémenté |
| `nom` | text | Nom du projet |
| `logline` | text | Phrase d'accroche (1–2 lignes) |
| `synopsis_court` | text | Résumé 200–400 mots |
| `genre` | text | `animation_2d` · `animation_3d` · `jeu_video` · `hybride` |
| `cible` | text | Public cible |
| `ton` | json `string[]` | Registres toniques (ex: ["épique", "poétique"]) |
| `references` | json `string[]` | Références artistiques/commerciales |
| `equipe` | json | Membres clés `{nom, role, bioCourte}[]` |
| `budget_total` | numeric(12,2) | Budget de production total (€) |
| `montant_recherche` | numeric(12,2) | Montant sollicité (€) |
| `avancement` | text | `idee` · `ecriture` · `concept_art` · `prototype` · `demo` |
| `societe` | text | Raison sociale de la société productrice |
| `siret` | text | Numéro SIRET (14 chiffres) |
| `region` | text | Région administrative française |
| `created_at` | timestamp | Date de création |
| `updated_at` | timestamp | Date de dernière modification |

### Table `generated_prompts`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | serial PK | Identifiant |
| `project_id` | integer FK | Référence projet |
| `module_id` | integer | Identifiant du module (1–10) |
| `submodule_id` | text | Identifiant sous-module (ex: "1.2") |
| `module_name` | text | Nom du module |
| `submodule_name` | text | Nom du sous-module |
| `target_platform` | text | Plateforme cible |
| `final_score` | integer | Score moyen des 3 variantes |
| `mention` | text | `insuffisant` · `bon` · `excellent` · `god_tier` |
| `iterations` | integer | Nombre d'itérations effectuées |
| `variants` | json | 3 variantes avec contenu + scoring détaillé |
| `created_at` | timestamp | Date de création |
| `updated_at` | timestamp | Date de dernière génération |

---

## Commandes utiles

```bash
# Vérification TypeScript (project references)
pnpm run typecheck

# Build complet monorepo
pnpm run build

# Push schéma DB (développement)
pnpm --filter @workspace/db run push

# Régénérer clients API depuis OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Lancer uniquement le backend
PORT=3000 pnpm --filter @workspace/api-server run dev

# Lancer uniquement le frontend
PORT=5000 BASE_PATH=/ API_PORT=3000 pnpm --filter @workspace/animafund run dev
```

---

*ANIMAFUND — Conçu pour l'industrie créative française. Optimisé pour les dossiers CNC, FJV, et Europe Creative 2024.*
