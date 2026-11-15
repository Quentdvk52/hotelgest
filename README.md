# HotelGest — Plateforme SaaS de Gestion Hôtelière Multisite, Traiteur & Matériel

HotelGest est un SaaS moderne de pilotage hôtelier, de restauration et d'événementiel conçu pour les établissements en Afrique.
Le groupe pilote déployé est **Hôtel Le Vignoble**, avec ses quatre sites au Bénin : **Bohicon**, **Abomey**, **Abomey-Calavi** et **Zogbodomey**.

---

## 🌟 Fonctionnalités Clés Livrées

1. **Isolation Multi-tenant & Multisite Stricte** :
   - Hiérarchie complète : Organisation → Groupe → Sites (BOH, ABM, ABC, ZOG) → Départements → Points de vente.
   - Cloisonnement étanche : le personnel d'un site ne peut accéder aux données d'un autre site sans mutation ou délégation auditée.
   - Vue consolidée pour le Promoteur du groupe.

2. **PMS Hébergement & Réception** :
   - Gestion des chambres, suites, catégories et tarifs.
   - Calendrier des disponibilités en temps réel avec **prévention stricte de surréservation concurrentielle** (verrous transactionnels).
   - Check-in voyageur, attribution de chambre, statut du ménage (Propre, À nettoyer, Inspectée) et check-out.

3. **Restaurant, Bar & Cave à Vin (POS / QR Code)** :
   - QR codes de commande opaques, uniques et révocables par table et par chambre (sans exposition de données personnelles).
   - Menu digital client accessible sur smartphone avec déclarations d'allergènes.
   - **Routage automatique par station (KDS)** :
     - Plats et préparations chaudes ➔ **Cuisine**
     - Boissons et cocktails ➔ **Bar**
     - Vins de garde et spiritueux ➔ **Cave**
   - Transfert de note de restaurant/bar directement sur le folio de chambre du voyageur.

4. **Service Traiteur & Location de Matériel Événementiel (Module Intégré)** :
   - **Service traiteur** : commandes de banquets et manifestations par convives ou portions, modes de prestation (Livraison, Retrait, Service avec personnel), affectation du personnel et des véhicules logistiques.
   - **Location de matériel** : catalogue de chaises Napoléon, tables rondes, bâches étanches, couverts dorés, plats et vaisselle.
   - **Vérification de stock par période** : élimine tout surbooking de matériel sur les dates de manifestation.
   - **États des lieux et Cautions** : constats au départ (remise) et au retour (récupération), détection de casse ou de perte, retenue sur caution et restitution automatique du solde.

5. **Caisse & Règlements Multi-Moyens** :
   - Sessions de caisse avec fonds d'ouverture, entrées/sorties d'espèces.
   - Règlements déclarés hors plateforme sans collecte de PAN bancaire au MVP : **Espèces**, **TPE**, **Virement**, **Mobile Money** (MTN MoMo, Moov Money, Celtiis Cash).
   - **Contrôle de clôture de caisse** : obligation d'une justification formelle auditée pour tout écart entre solde théorique et espèces comptées.

6. **Gouvernance & Night Audit** :
   - Circuit d'approbation des remises avec plafonds stricts par rôle (Réceptionniste 5%, Directeur de site 25%, Promoteur 100%).
   - Clôture journalière (Night Audit) : précontrôles d'intégrité, imputation automatique des nuitées et verrouillage de la date comptable.

7. **Comptabilité SYSCOHADA Révisé** :
   - Écritures équilibrées Débit = Crédit sur les comptes de Classe 7 (7061 Hébergement, 7062 Restauration, 7063 Boissons, 7064 Traiteur/Événements) et Classe 5 (521 Banques, 571 Caisse, 531 Mobile Money).
   - Export CSV direct pour le cabinet comptable au Bénin.

8. **Abonnement SaaS Chariow** :
   - Intégration par webhooks sécurisés avec signature HMAC SHA256 et table d'idempotence contre le rejeu.
   - Plans tarifaires : 100 000 XOF/mois, -10% semestriel (540 000 XOF), -30% annuel (840 000 XOF).

---

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ (testé sur Node v24.11.1)
- npm ou pnpm

### Installation
```bash
# Cloner le dépôt
git clone https://github.com/Quentdvk52/hotelgest.git
cd hotelgest

# Installer les dépendances
npm install

# Lancer la suite de tests
npm test

# Lancer le serveur de développement
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

---

## 🗺️ Cartographie des Routes

| Route | Rôle / Usage |
|---|---|
| `/` | Vitrine SaaS HotelGest, fonctionnalités et tarifs Chariow |
| `/vignoble` | Vitrine du groupe pilote Hôtel Le Vignoble (4 sites : Bohicon, Abomey, Calavi, Zogbodomey) |
| `/order/[token]` | Menu digital QR pour commande directe par table ou chambre (ex: `/order/hg_table_bohicon_tbl01`) |
| `/catering-equipment` | Portail public de demande de devis Traiteur & Matériel événementiel |
| `/dashboard` | Tableau de bord back-office avec sélecteur multisite et switch de profils de test |
| `/pms/reception` | Planning des chambres, check-in, check-out et folios de séjour |
| `/pos/stations` | Console KDS des stations de préparation (Cuisine, Bar, Cave) |
| `/workspace-catering` | Gestion back-office des commandes traiteur, locations et états des lieux |
| `/finance/cash` | Gestion de tiroir de caisse, fonds et clôture avec justification d'écart |
| `/governance/discounts`| Console d'approbation des remises et vérification des plafonds |
| `/night-audit` | Assistant de clôture journalière et verrouillage comptable |
| `/reports` | Rapports financiers et export CSV du journal SYSCOHADA |

---

## 🧪 Tests & Recette

La suite de tests automatisée comprend **49 tests** couvrant 100% des critères d'acceptation :
```bash
npx vitest run
```
Tous les tests passent avec succès :
- Isolation multi-tenant & périmètre site
- Non-chevauchement des réservations de chambre
- Non-surréservation des équipements traiteur
- Ventilation multi-station Cuisine/Bar/Cave
- États des lieux et retenues sur caution
- Seuils d'approbation de remises et anti-contournement
- Clôture de caisse avec justification d'écart
- Webhook Chariow HMAC & idempotence
- Équilibre comptable SYSCOHADA (Débit = Crédit)

---

## 📄 Licence & Droits
© 2026 Hôtel Le Vignoble — Développé pour HotelGest.
