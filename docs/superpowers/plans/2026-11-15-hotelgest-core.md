# HotelGest Implementation Plan — Système SaaS de Gestion Hôtelière Multisite, Traiteur & Location de Matériel

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Concevoir et développer l'application SaaS complète HotelGest pour le groupe pilote Hôtel Le Vignoble (4 sites : Bohicon, Abomey, Abomey-Calavi, Zogbodomey) couvrant le PMS hébergement, la restauration/bar avec QR codes révocables et KDS, le module complet de Service Traiteur et Location de Matériel Événementiel (avec états des lieux départ/retour, gestion des cautions et vérification de disponibilité), la gestion de caisse, l'approbation de remises, le night audit, la compatibilité SYSCOHADA et l'abonnement Chariow.

**Architecture:** Monolithe modulaire Next.js 15 (App Router) + TypeScript + Tailwind CSS avec séparation stricte des domaines métier (`tenancy`, `pms`, `pos`, `catering-equipment`, `cash-finance`, `governance`, `subscriptions`, `audit`). Persistance PostgreSQL/Neon avec Drizzle ORM garantissant l'isolation multi-tenant stricte par `tenant_id` et `property_id` ainsi que des transactions ACID pour réservations, commandes, locations et caisse.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Lucide React, Drizzle ORM, @neondatabase/serverless, Zod, Vitest.

**Spec:** `specs/00-PROMPT-ANTIGRAVITY.md`, `specs/01-VISION-ET-PRD.md`, `specs/02-REGLES-METIER.md`, `specs/03-ARCHITECTURE-TECHNIQUE.md`, `specs/04-DESIGN-ET-UX.md`, `specs/05-SECURITE-ET-CONFORMITE.md`, `specs/06-QUALITE-ET-ACCEPTATION.md`, `specs/07-ROADMAP.md`, `specs/08-QUESTIONS-ET-HYPOTHESES.md`, `specs/09-SKILLS-ET-DEPENDANCES.md` + Spécifications détaillées Service Traiteur et Location de Matériel Événementiel.

## Global Constraints

- Isolation tenant stricte : chaque requête et enregistrement métier est scopé par `tenant_id` et `property_id` validé côté serveur.
- Aucun montant financier en virgule flottante binaire : montants stockés en décimal/entier (centimes ou sous-unités) avec devise ISO (`XOF` par défaut).
- Pas d'encaissement direct des réservations en ligne au MVP : les règlements hôteliers sont déclarés hors plateforme (Espèces, TPE, Virement, Mobile Money) par un personnel habilité.
- QR codes de commande opaques et révocables, sans exposition de PII ni accès au dossier client.
- Routage automatique des commandes par station : plats -> Cuisine, boissons standards -> Bar, vins & spiritueux de réserve -> Cave.
- Traiteur & Location de matériel : vérification des disponibilités matérielles par plage de dates/heures pour éliminer tout surbooking d'équipements (chaises, tables, bâches, couverts, plats/vaisselle) ; suivi des états des lieux (départ/retour) et des cautions.
- Approbation obligatoire pour toute remise selon seuils configurables par rôle.
- Clôture journalière (Night Audit) avec précontrôles, imputation des nuitées, détection des écarts de caisse et verrouillage de la date comptable.
- Abonnement SaaS Chariow géré par webhook signé, idempotent et sécurisé côté serveur (plans : 100 000 XOF/mois, -10% semestriel, -30% annuel).
- Modèle comptable aligné sur le plan de comptes SYSCOHADA révisé avec exports équilibrés Débit = Crédit.

## Review Focus

1. **Surréservation de matériel événementiel ou de chambre** : deux réservations qui se chevauchent sur les mêmes stocks d'équipements ou sur la même unité doivent être détectées et refusées.
2. **Gestion de la caution et dégradation de matériel** : lors du retour de location, les dégradations ou pertes doivent être enregistrées avec retenue sur caution et traçabilité auditable.
3. **Contournement de seuil d'approbation de remise** : un employé ne peut pas auto-approuver une remise supérieure à son plafond configuré.
4. **Altération ou rejeu de webhook Chariow** : les requêtes non signées ou déjà traitées doivent être rejetées avec code d'erreur adéquat.
5. **Déséquilibre de caisse non justifié lors de la clôture de journée** : le night audit doit bloquer ou exiger une justification formelle auditée si les encaissements réels diffèrent des encaissements théoriques.

---

### Task 1: Initialisation du projet et socle technique
- Files: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.env.example`, `.env.local`, `src/lib/config.ts`, `src/lib/types/common.ts`
- Tests: `src/test/config.test.ts` (validation variables d'environnement, helpers monétaires XOF)

### Task 2: Modèle de données Drizzle et Schéma PostgreSQL Multi-tenant
- Files: `src/lib/db/index.ts`, `src/lib/db/schema/tenants.ts`, `src/lib/db/schema/users.ts`, `src/lib/db/schema/pms.ts`, `src/lib/db/schema/pos.ts`, `src/lib/db/schema/catering-equipment.ts`, `src/lib/db/schema/cash.ts`, `src/lib/db/schema/governance.ts`, `src/lib/db/schema/audit.ts`, `src/lib/db/schema/index.ts`, `src/lib/db/seed.ts`
- Tests: `src/test/db-schema.test.ts` (intégrité des tables, contraintes multi-tenant, catalogue Le Vignoble)

### Task 3: Couche d'authentification, RBAC et Isolation de Contexte
- Files: `src/lib/auth/session.ts`, `src/lib/auth/rbac.ts`, `src/lib/auth/middleware.ts`, `src/lib/audit/logger.ts`
- Tests: `src/test/auth-rbac.test.ts` (vérification session, scoping par site et matrice de permissions)

### Task 4: Module PMS — Gestion des chambres, disponibilités et réservations
- Files: `src/modules/pms/pms-service.ts`, `src/modules/pms/types.ts`, `src/app/api/pms/reservations/route.ts`, `src/app/api/pms/checkin/route.ts`, `src/app/api/pms/checkout/route.ts`
- Tests: `src/test/pms-service.test.ts` (concurrence, prévention des conflits de dates, check-in/out)

### Task 5: Module Facturation, Folio et Caisse
- Files: `src/modules/finance/folio-service.ts`, `src/modules/finance/cash-service.ts`, `src/app/api/finance/folios/[id]/route.ts`, `src/app/api/finance/cash/session/route.ts`, `src/app/api/finance/payments/route.ts`
- Tests: `src/test/cash-service.test.ts` (imputation folio, modes de règlement, justification des écarts de caisse)

### Task 6: Module Restaurant & Bar — QR Code, Commande en ligne et Console de Stations (KDS)
- Files: `src/modules/pos/qr-service.ts`, `src/modules/pos/order-service.ts`, `src/app/api/pos/qr/[token]/route.ts`, `src/app/api/pos/orders/route.ts`, `src/app/api/pos/stations/[stationId]/tickets/route.ts`
- Tests: `src/test/pos-order.test.ts` (résolution QR opaque, ventilation multi-station Cuisine/Bar/Cave, transfert folio)

### Task 7: Module Service Traiteur et Location de Matériel Événementiel
- Files: `src/modules/catering-equipment/catering-service.ts`, `src/modules/catering-equipment/equipment-service.ts`, `src/app/api/catering/orders/route.ts`, `src/app/api/equipment/rentals/route.ts`, `src/app/api/equipment/inspections/route.ts`
- Tests: `src/test/catering-equipment.test.ts` (devis traiteur, vérification des stocks de matériel par période, états des lieux départ/retour, retenue/restitution de caution)

### Task 8: Gouvernance — Workflow d'approbation des remises et Night Audit
- Files: `src/modules/governance/discount-service.ts`, `src/modules/night-audit/audit-service.ts`, `src/app/api/governance/discounts/route.ts`, `src/app/api/night-audit/run/route.ts`
- Tests: `src/test/governance-night-audit.test.ts` (seuils de remise par rôle, précontrôles et clôture de journée)

### Task 9: Comptabilité SYSCOHADA et Abonnement SaaS Chariow
- Files: `src/modules/accounting/syscohada-service.ts`, `src/modules/subscription/chariow-service.ts`, `src/app/api/accounting/export/route.ts`, `src/app/api/webhooks/chariow/route.ts`
- Tests: `src/test/accounting-chariow.test.ts` (balance SYSCOHADA équilibrée, vérification signature et idempotence Chariow)

### Task 10: Interface Utilisateur — Design System, Vitrine Publique, QR & Devis Traiteur/Matériel
- Files: `src/components/ui/*`, `src/app/(marketing)/page.tsx`, `src/app/(marketing)/vignoble/page.tsx`, `src/app/(guest)/order/[token]/page.tsx`, `src/app/(guest)/catering-equipment/page.tsx`
- Tests: `src/test/ui-guest.test.ts` (interface de commande QR, configurateur traiteur & réservation de matériel)

### Task 11: Interface Back-Office — Dashboard, PMS, POS, Traiteur/Matériel, Caisse, Night Audit & Rapports
- Files: `src/app/(workspace)/layout.tsx`, `src/app/(workspace)/dashboard/page.tsx`, `src/app/(workspace)/pms/reception/page.tsx`, `src/app/(workspace)/pms/rooms/page.tsx`, `src/app/(workspace)/pos/stations/page.tsx`, `src/app/(workspace)/pos/waitstaff/page.tsx`, `src/app/(workspace)/catering-equipment/page.tsx`, `src/app/(workspace)/finance/cash/page.tsx`, `src/app/(workspace)/governance/discounts/page.tsx`, `src/app/(workspace)/night-audit/page.tsx`, `src/app/(workspace)/reports/page.tsx`, `src/app/(workspace)/settings/page.tsx`
- Tests: `src/test/ui-workspace.test.ts` (navigation back-office, inspection matériel départ/retour, gestion des commandes)

### Task 12: Validation Globale, Tests E2E et Documentation de Livraison
- Files: `src/test/e2e-workflow.test.ts`, `README.md`, `docs/MANUEL_EXPLOITATION.md`, `docs/VALIDATION_RECETTE.md`
- Tests: `src/test/e2e-workflow.test.ts` (cycle de vie complet : réservation, QR commande, traiteur, location de matériel avec caution, check-out, clôture)
