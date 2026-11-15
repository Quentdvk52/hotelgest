# HotelGest — Architecture technique recommandée

## 1. Choix de départ

Architecture modulaire monolithique, API interne claire et PostgreSQL. Cette option garde transactions fortes pour réservation, commandes et finances sans coût opérationnel prématuré de microservices.

- Application web : **Next.js + TypeScript + React**, rendu serveur pour pages publiques et interaction client ciblée pour back-office.
- Base : **Neon Postgres** si l’environnement choisi le permet; PostgreSQL standard pour portabilité.
- Accès SQL/migrations : Drizzle ORM ou Prisma, choisir un seul outil et verrouiller les versions.
- Auth : solution dédiée compatible Next.js (Auth.js ou fournisseur équivalent) avec vérification email/téléphone, MFA pour privilèges élevés. **Neon est la base de données, pas l’authentification.** Neon Auth ne sera retenu que si ses fonctions, disponibilité et contrôle de session satisfont les besoins après vérification documentaire.
- Fichiers : stockage objet S3 compatible, URLs signées; pas de pièce d’identité nécessaire au MVP si le processus ne l’exige pas.
- Paiements abonnement : adaptateur Chariow serveur, webhooks signés/idempotents. Paiements hôteliers externalisés et saisis comme paiements enregistrés.
- Notifications : interfaces provider email/SMS/WhatsApp remplaçables, envoi asynchrone.
- Déploiement : conteneur/runtime Node compatible Next.js, DB gérée, secrets via gestionnaire d’environnement; fournisseur à confirmer.

## 2. Domaines applicatifs

`identity-access`, `tenancy-organization`, `property-inventory`, `reservations-pms`, `guest-crm`, `pos-orders`, `kitchen-stations`, `events-spaces`, `fleet-rentals`, `inventory-procurement`, `cash-finance-ledger`, `workforce`, `maintenance-assets`, `reporting`, `subscription-billing`, `integrations`, `audit-notifications`.

Chaque domaine expose services et événements internes. Ne pas écrire dans les tables d’un domaine depuis un autre sans service/contrat défini.

## 3. Multi-tenant et autorisation

- Toutes les tables métier incluent `tenant_id`; tables rattachées à un site incluent `property_id`.
- Le tenant vient de la session vérifiée côté serveur, jamais d’un `tenant_id` client accepté sans contrôle.
- Chaque requête vérifie permission + périmètre (groupe/site/département/ressource).
- Index/contraintes incluent tenant/site lorsque nécessaire; tests d’isolement couvrent lectures, mutations, exports et fichiers.
- PostgreSQL RLS peut être défense en profondeur, mais ne remplace pas les contrôles applicatifs; la stratégie doit être cohérente avec le pool de connexions et la session DB.

## 4. Entités initiales

`Tenant`, `Organization`, `Property`, `Department`, `Outlet`, `User`, `Membership`, `Role`, `Permission`, `ScopeAssignment`, `AuditEvent`, `RoomType`, `Unit`, `RatePlan`, `Availability`, `Reservation`, `Guest`, `Stay`, `Folio`, `FolioLine`, `Invoice`, `PaymentRecord`, `CashDrawer`, `CashSession`, `CashMovement`, `MenuItem`, `MenuCategory`, `QrResource`, `DiningTable`, `ServiceStation`, `Order`, `OrderLine`, `StationTicket`, `DiscountRequest`, `EventSpace`, `EventBooking`, `Vehicle`, `Rental`, `StockItem`, `StockMovement`, `Employee`, `Shift`, `AttendanceRecord`, `Subscription`, `IntegrationEvent`.

Les montants utilisent type décimal exact + devise ISO; aucune arithmétique monétaire en flottant binaire.

## 5. Réservation et concurrence

- Transactions DB et contrainte contre chevauchement pour les unités confirmées; verrouillage ou stratégie sérialisable documentée.
- Idempotency key sur réservation, commande et événement fournisseur.
- Stock de disponibilité agrégé doit être recalculable à partir des séjours confirmés et fermetures.
- Les opérations externes déclenchent outbox transactionnelle; reprise sans duplication.

## 6. QR et commandes

URL publique avec jeton aléatoire non séquentiel, limité à une ressource, révocable et rotatable. Pas de PII dans le token. Limitation de débit et captcha/contrôle anti-abus adaptés. Le serveur résout le QR, vérifie statut du site/unité/table, prix, disponibilité et construit tickets de station à partir du routage configuré.

## 7. Abonnement Chariow

`BillingProvider` interface avec createCheckout, verifyWebhook, getSubscriptionState. Vérifier signature selon docs, timestamp, replay, événement unique; recalculer statut serveur et conserver payload minimal nécessaire. Checkout redirige hors site. Ne pas accorder abonnement sur page de retour client seule.

## 8. Offline et faible réseau

PWA avec cache des ressources statiques et lecture limitée. Toute action sensible hors ligne doit afficher explicitement état en attente et ne pas promettre confirmation avant serveur. Priorité offline éventuelle : consultation planning/tâches, prise de commande dans file locale avec identifiant unique et réconciliation; paiements et clôtures restent en ligne.

## 9. Structure dépôt suggérée

Monorepo si site public et application partagent composants; sinon app unique segmentée par routes et modules. Exemple : `src/app/(marketing)`, `src/app/(guest)`, `src/app/(workspace)`, `src/modules/*`, `src/components/ui`, `src/lib/auth`, `src/lib/db`, `src/lib/i18n`, `src/server`, `db/migrations`, `docs/`.

## 10. Observabilité et sauvegardes

Logs structurés sans PII excessive; correlation id; métriques de réservations, commandes, webhooks, erreurs et latence. Sauvegardes et restore test avant pilote. RPO/RTO à définir avec l’hébergement choisi et le budget.
