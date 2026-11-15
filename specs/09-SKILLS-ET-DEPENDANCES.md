# HotelGest — Skills, bibliothèques et liens officiels

## 1. Skills disponibles dans l’environnement Codex

Ces skills sont des consignes pour agents Codex; Antigravity ne pourra les invoquer directement que s’il prend en charge leur format. Les chemins `C:/Users/EliteBook/...` ci-dessous sont propres à l’environnement Codex et ne seront probablement pas accessibles à Antigravity. Dans Antigravity, reprendre les méthodes décrites dans le prompt maître ou rechercher les compétences équivalentes dans sa bibliothèque officielle. Ne pas inventer de commande d’installation globale : suivre les instructions documentées par l’outil effectivement utilisé.

- Brainstorming : `C:/Users/EliteBook/.agents/skills/superpowers/skills/brainstorming/SKILL.md`
- Architecture designer : `C:/Users/EliteBook/.agents/skills/claude-skills/skills/architecture-designer/SKILL.md`
- UI/UX Pro Max : `C:/Users/EliteBook/.agents/skills/ui-ux-pro-max/SKILL.md`
- Design system : `C:/Users/EliteBook/.agents/skills/design-system/SKILL.md`
- UI styling : `C:/Users/EliteBook/.agents/skills/ui-styling/SKILL.md`
- Taste frontend : `C:/Users/EliteBook/.agents/skills/taste-skill/skills/taste-skill/SKILL.md`
- Review animations : `C:/Users/EliteBook/.agents/skills/emilkowalski_skills/skills/review-animations/SKILL.md`
- Security reviewer : `C:/Users/EliteBook/.agents/skills/claude-skills/skills/security-reviewer/SKILL.md`
- Secure code guardian : `C:/Users/EliteBook/.agents/skills/claude-skills/skills/secure-code-guardian/SKILL.md`
- PostgreSQL : `C:/Users/EliteBook/.agents/skills/claude-skills/skills/postgres-pro/SKILL.md`
- API design : `C:/Users/EliteBook/.agents/skills/claude-skills/skills/api-designer/SKILL.md`
- React : `C:/Users/EliteBook/.agents/skills/claude-skills/skills/react-expert/SKILL.md`
- Next.js : `C:/Users/EliteBook/.agents/skills/claude-skills/skills/nextjs-developer/SKILL.md`
- TypeScript : `C:/Users/EliteBook/.agents/skills/claude-skills/skills/typescript-pro/SKILL.md`
- Code review : `C:/Users/EliteBook/.agents/skills/claude-skills/skills/code-reviewer/SKILL.md`
- Scope review : `C:/Users/EliteBook/.agents/skills/scope-creep-detector/SKILL.md`
- Three.js basics/performance : `C:/Users/EliteBook/.agents/skills/threejs-skills/skills/threejs-fundamentals/SKILL.md`, `.../threejs-performance/SKILL.md`

## 2. Stack proposée et installations officielles

| Besoin | Recommandation | Installation / documentation |
|---|---|---|
| Runtime | Node.js LTS compatible avec Next.js | [nodejs.org](https://nodejs.org/en/download) |
| App web | Next.js + TypeScript | [Create Next App](https://nextjs.org/docs/app/getting-started/installation) |
| Base de données | Neon PostgreSQL | [Neon + Next.js](https://neon.tech/docs/guides/nextjs) |
| ORM/migrations | Drizzle (choisir aussi Prisma seulement si raison documentée, pas les deux) | [Drizzle + Neon](https://orm.drizzle.team/docs/get-started/neon-new) |
| CSS | Tailwind CSS | [Installation officielle](https://tailwindcss.com/docs/installation) |
| Composants accessibles | shadcn/ui (copier les composants nécessaires et les adapter) | [Installation](https://ui.shadcn.com/docs/installation/next) |
| Formulaires | React Hook Form | [Documentation](https://react-hook-form.com/get-started) |
| Schémas validation | Zod | [Documentation](https://zod.dev/) |
| Tables/calendriers | TanStack Table / FullCalendar selon besoin | [TanStack Table](https://tanstack.com/table/latest/docs/introduction), [FullCalendar React](https://fullcalendar.io/docs/react) |
| Graphiques | Recharts | [Installation](https://recharts.org/en-US/guide/installation) |
| Motion | Motion for React | [Installation](https://motion.dev/docs/react-installation) |
| 3D React | Three.js + React Three Fiber + Drei | [R3F install](https://r3f.docs.pmnd.rs/getting-started/installation), [Drei](https://github.com/pmndrs/drei) |
| Internationalisation | next-intl | [Documentation](https://next-intl.dev/docs/getting-started/app-router) |
| Auth | Auth.js ou fournisseur OIDC choisi après comparaison | [Auth.js](https://authjs.dev/getting-started/installation) |
| Paiement SaaS | Chariow API/webhooks | [Docs développeur](https://chariow.dev/), [article d’accès](https://help.chariow.com/en/articles/259-developer-documentation-and-api) |
| Stockage fichiers | S3-compatible choisi selon hébergement | [AWS S3 docs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html) |
| Tests unitaires | Vitest | [Guide](https://vitest.dev/guide/) |
| Tests navigateur | Playwright | [Installation](https://playwright.dev/docs/intro) |
| Accessibilité | axe-core | [axe-core](https://github.com/dequelabs/axe-core) |

## 3. Installation progressive indicative

Les commandes doivent être adaptées au gestionnaire de paquets retenu et aux versions compatibles après création du projet. Ne pas les lancer dans un dépôt existant avant inspection.

```bash
npx create-next-app@latest hotelgest --typescript --tailwind --eslint --app
cd hotelgest
npm install drizzle-orm @neondatabase/serverless zod react-hook-form @hookform/resolvers next-intl motion
npm install -D drizzle-kit vitest @playwright/test
```

Ajouter les bibliothèques optionnelles seulement lors de leur module : `npm install three @react-three/fiber @react-three/drei` pour les scènes 3D; `npm install recharts` pour graphiques; authentification selon choix documenté. Ne pas intégrer un SDK Chariow non officiel : appeler l’API documentée côté serveur derrière un adaptateur.

## 4. Règles de dépendances

- Vérifier versions, maintenance, licence, compatibilité React/Next.js et notes de sécurité avant ajout.
- Fixer lockfile et versions; éviter `latest` dans production.
- N’ajouter aucune bibliothèque pour un seul effet cosmétique si CSS suffit.
- La 3D et les graphiques lourds sont chargés à la demande.
- Si l’accès réseau ou à une doc n’est pas disponible, consigner cette limite plutôt que d’inventer une API.
