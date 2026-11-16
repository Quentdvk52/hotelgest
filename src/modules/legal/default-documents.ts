import { LegalDocument } from "./types";

export function findPlaceholders(text: string): string[] {
  const matches = text.match(/\[([A-ZÀ-ÿ0-9'\s\-_/:]+?(?:À COMPLÉTER|À VALIDER|À CONFIRMER)[A-ZÀ-ÿ0-9'\s\-_/:]*?)\]/g);
  return matches ? Array.from(new Set(matches)) : [];
}

const now = "2026-11-16T12:00:00.000Z";

export const INITIAL_LEGAL_DOCUMENTS: LegalDocument[] = [
  // 1. MENTIONS LÉGALES
  {
    id: "doc-mentions-legales",
    slug: "mentions-legales",
    title: "Mentions Légales",
    category: "MENTIONS",
    description: "Informations d'identification de l'éditeur, du directeur de publication et de l'hébergeur du site.",
    scope: "GROUPE",
    language: "FR",
    isPubliclyVisible: true,
    currentPublishedVersionId: "ver-mentions-v1",
    updatedAt: now,
    versions: [
      {
        id: "ver-mentions-v1",
        documentId: "doc-mentions-legales",
        versionNumber: "v1.0",
        status: "PUBLIE",
        summaryOfChanges: "Version initiale de référence avec mentions légales obligatoires.",
        authorId: "user-promoter-01",
        authorName: "Eddy GNACADJA (Promoteur)",
        createdAt: now,
        publishedAt: now,
        content: `# MENTIONS LÉGALES

Conformément aux dispositions de la législation en vigueur en République du Bénin, notamment la Loi n° 2017-20 du 20 avril 2018 portant Code du numérique, les présentes mentions légales définissent les conditions d'accès et d'utilisation du site Internet du Groupe Hôtelier Le Vignoble (**hotelgestion.vercel.app**).

---

### 1. ÉDITEUR DU SITE INTERNET

Le présent site est édité et administré par :
- **Dénomination sociale :** [DÉNOMINATION LÉGALE COMPLÈTE DU GROUPE À COMPLÉTER] (Nom commercial d'exploitation : **Hôtel Le Vignoble**)
- **Forme juridique :** [FORME JURIDIQUE : SARL OU SAS À COMPLÉTER] au capital social de [MONTANT DU CAPITAL SOCIAL EN XOF À COMPLÉTER]
- **Siège social :** [ADRESSE OFFICIELLE DU SIÈGE À COMPLÉTER : ex. Carrefour Zakpo, Ville de Bohicon, République du Bénin]
- **Immatriculation au Registre du Commerce et du Crédit Mobilier (RCCM) :** [NUMÉRO D’IMMATRICULATION RCCM À COMPLÉTER]
- **Identifiant Fiscal Unique (IFU) :** 0201910839213 [IDENTIFIANT FISCAL À CONFIRMER SI DIFFÉRENT]
- **Numéro d'Agrément Touristique :** [NUMÉRO D'AGRÉMENT DU MINISTÈRE DU TOURISME À COMPLÉTER]
- **Numéro de téléphone :** +229 97 00 11 22 [COORDONNÉES TÉLÉPHONIQUES DU SIÈGE À CONFIRMER]
- **Courrier électronique :** contact@hotel-levignoble.bj
- **Directeur de la publication :** M. Eddy GNACADJA, en sa qualité de Promoteur & Directeur Général.

---

### 2. ÉTABLISSEMENTS DU GROUPE

Les présentes mentions s'appliquent à l'ensemble des 4 établissements du réseau hôtelier :
1. **Hôtel Le Vignoble — Bohicon (Siège & Boutique Centrale)** : Quartier Zakpo, Bohicon, Bénin.
2. **Hôtel Le Vignoble — Abomey (Cité Historique)** : Centre-ville, Abomey, Bénin.
3. **Hôtel Le Vignoble — Abomey-Calavi (Campus & Lac)** : Zone Résidentielle, Abomey-Calavi, Bénin.
4. **Hôtel Le Vignoble — Zogbodomey (Éco-Lodge & Piscine)** : Escale Nature, Zogbodomey, Bénin.

---

### 3. HÉBERGEMENT DU SITE

Le site est hébergé par :
- **Hébergeur :** Vercel Inc. [HÉBERGEUR DU SITE À CONFIRMER]
- **Adresse de l'hébergeur :** 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
- **Site web de l'hébergeur :** https://vercel.com
- **Infrastructure de base de données :** Neon Database Inc. (PostgreSQL Serverless, Région AWS us-east-2).

---

### 4. PROPRIÉTÉ INTELLECTUELLE

L'ensemble des éléments figurant sur le site (textes, photographies, vidéos, identité graphique, logo de la grappe de raisin dorée et verte, typographies, icônes, logiciels et bases de données) est la propriété exclusive du Groupe Hôtel Le Vignoble ou fait l'objet d'une autorisation d'utilisation régulière.

Toute reproduction, représentation, diffusion ou adaptation, totale ou partielle, de l'un quelconque de ces éléments sans l'autorisation expresse écrite préalable de la Direction Générale est strictement prohibée et constituerait un délit de contrefaçon sanctionné par le Code de la propriété intellectuelle et le Code du numérique béninois.`,
        incompletePlaceholders: findPlaceholders(
          `[DÉNOMINATION LÉGALE COMPLÈTE DU GROUPE À COMPLÉTER] [FORME JURIDIQUE : SARL OU SAS À COMPLÉTER] [MONTANT DU CAPITAL SOCIAL EN XOF À COMPLÉTER] [ADRESSE OFFICIELLE DU SIÈGE À COMPLÉTER : ex. Carrefour Zakpo, Ville de Bohicon, République du Bénin] [NUMÉRO D’IMMATRICULATION RCCM À COMPLÉTER] [IDENTIFIANT FISCAL À CONFIRMER SI DIFFÉRENT] [NUMÉRO D'AGRÉMENT DU MINISTÈRE DU TOURISME À COMPLÉTER] [COORDONNÉES TÉLÉPHONIQUES DU SIÈGE À CONFIRMER] [HÉBERGEUR DU SITE À CONFIRMER]`
        ),
      },
    ],
  },

  // 2. POLITIQUE DE CONFIDENTIALITÉ
  {
    id: "doc-politique-confidentialite",
    slug: "politique-confidentialite",
    title: "Politique de Confidentialité et Protection des Données",
    category: "CONFIDENTIALITE",
    description: "Traitement des données personnelles des hôtes, réservations, droit d'accès et sécurité.",
    scope: "GROUPE",
    language: "FR",
    isPubliclyVisible: true,
    currentPublishedVersionId: "ver-confid-v1",
    updatedAt: now,
    versions: [
      {
        id: "ver-confid-v1",
        documentId: "doc-politique-confidentialite",
        versionNumber: "v1.0",
        status: "PUBLIE",
        summaryOfChanges: "Politique initiale conforme au Code du Numérique Béninois et aux standards internationaux de protection.",
        authorId: "user-promoter-01",
        authorName: "Eddy GNACADJA (Promoteur)",
        createdAt: now,
        publishedAt: now,
        content: `# POLITIQUE DE CONFIDENTIALITÉ & PROTECTION DES DONNÉES

Le Groupe Hôtel Le Vignoble accorde une importance primordiale à la protection de la vie privée et des données à caractère personnel de ses clients, résidents et visiteurs.

La présente politique est rédigée en conformité avec les dispositions du **Livre V de la Loi n° 2017-20 du 20 avril 2018 portant Code du numérique en République du Bénin** (relative à la protection des données personnelles) et aux principes internationaux de licéité, de loyauté et de minimisation des données.

---

### 1. RESPONSABLE DU TRAITEMENT

Le responsable du traitement des données est :
- **Entité :** [DÉNOMINATION SOCIALE À COMPLÉTER], exploitant les hôtels « Le Vignoble ».
- **Délégué ou Référent à la Protection des Données (DPO) :** [NOM OU FONCTION DU RÉFÉRENT DPO À COMPLÉTER : ex. Secrétariat Général / Direction Administrative et Financière]
- **Contact DPO :** rgpd@hotel-levignoble.bj ou dpo@hotel-levignoble.bj [CONTACT DPO À CONFIRMER]

---

### 2. DONNÉES COLLECTÉES & FINALITÉS

Dans le cadre de nos activités hôtelières et para-hôtelières, nous sommes amenés à collecter :
1. **Données d'identification et de séjour :** nom, prénom, nationalité, numéro de pièce d'identité ou passeport (obligatoire en vertu de la réglementation hôtelière et sécuritaire), dates d'arrivée et de départ, chambre occupée.
2. **Coordonnées :** numéro de téléphone mobile (pour confirmations SMS / WhatsApp), adresse email, domicile.
3. **Données financières et de paiement :** numéro de transaction Mobile Money (MTN MoMo, Moov, Celtiis via KkiaPay), coordonnées de carte bancaire traitées de manière chiffrée par nos prestataires agréés PCI-DSS (aucun numéro complet de carte n'est stocké en clair sur nos serveurs).
4. **Préférences et restauration :** demandes particulières de literie, régimes ou allergies alimentaires signalés en cuisine, consommations de cave et restaurant.
5. **Enregistrements de vidéosurveillance :** images captées dans les parties communes des établissements (halls d'accueil, couloirs, accès parking et jardins) à des fins exclusives de sécurité des biens et des personnes.

---

### 3. BASE JURIDIQUE DES TRAITEMENTS

Les traitements de données reposent sur :
- **L'exécution contractuelle :** validation de votre réservation, fourniture du service d'hébergement, restauration ou location de véhicule.
- **Le respect d'obligations légales :** fiches de police individuelles des voyageurs étrangers, tenue de la comptabilité et factures normalisées e-MECeF de la DGI Bénin.
- **L'intérêt légitime :** sécurisation des locaux et amélioration constante de la qualité de service.
- **Le consentement explicite :** pour les communications marketing ou la conservation étendue des préférences.

---

### 4. DURÉES DE CONSERVATION

- **Données relatives aux séjours et factures :** conservées pendant [DURÉES DE CONSERVATION LÉGALE COMPTABLE À VALIDER : ex. 10 ans conformément aux règles comptables OHADA / DGI].
- **Fiches individuelles de police :** conservées pendant [DURÉE DE CONSERVATION DES FICHES DE POLICE À VALIDER : ex. 6 mois ou 1 an selon les consignes du Ministère de l'Intérieur].
- **Données marketing et prospection :** conservées au maximum 3 ans après le dernier contact actif de votre part.
- **Enregistrements de vidéosurveillance :** conservés pour une durée n'excédant pas 30 jours, sauf réquisition judiciaire.

---

### 5. DESTINATAIRES DES DONNÉES & TRANSFERTS

Vos données sont strictement réservées à l'usage interne du personnel habilité d'Hôtel Le Vignoble (réceptionnistes, conciergerie, direction financière).
Elles peuvent être communiquées uniquement :
- Aux autorités policières ou judiciaires béninoises dans le cadre strict de leurs réquisitions légales.
- À nos prestataires techniques sous-traitants (agrégateur de paiement KkiaPay, hébergeur cloud sécurisé Vercel et Neon). Aucun transfert commercial ou vente de vos données n'est réalisé.

---

### 6. VOS DROITS

Conformément au Code du numérique béninois, vous disposez d'un droit d'accès, de rectification, d'opposition, de limitation et de suppression des données vous concernant.
Pour exercer ces droits, vous pouvez vous adresser à la Direction par courrier recommandé ou par courriel à : **contact@hotel-levignoble.bj**, accompagné d'une copie de votre pièce d'identité. Une réponse vous sera apportée sous 30 jours.`,
        incompletePlaceholders: findPlaceholders(
          `[DÉNOMINATION SOCIALE À COMPLÉTER] [NOM OU FONCTION DU RÉFÉRENT DPO À COMPLÉTER : ex. Secrétariat Général / Direction Administrative et Financière] [CONTACT DPO À CONFIRMER] [DURÉES DE CONSERVATION LÉGALE COMPTABLE À VALIDER : ex. 10 ans conformément aux règles comptables OHADA / DGI] [DURÉE DE CONSERVATION DES FICHES DE POLICE À VALIDER : ex. 6 mois ou 1 an selon les consignes du Ministère de l'Intérieur]`
        ),
      },
    ],
  },

  // 3. POLITIQUE DES COOKIES
  {
    id: "doc-cookies-traceurs",
    slug: "cookies-et-traceurs",
    title: "Politique relative aux Cookies et Traceurs",
    category: "COOKIES",
    description: "Fonctionnement du gestionnaire de cookies, traceurs indispensables et choix de l'utilisateur.",
    scope: "GROUPE",
    language: "FR",
    isPubliclyVisible: true,
    currentPublishedVersionId: "ver-cookies-v1",
    updatedAt: now,
    versions: [
      {
        id: "ver-cookies-v1",
        documentId: "doc-cookies-traceurs",
        versionNumber: "v1.0",
        status: "PUBLIE",
        summaryOfChanges: "Politique des cookies avec gestionnaire de consentement interactif.",
        authorId: "user-promoter-01",
        authorName: "Eddy GNACADJA (Promoteur)",
        createdAt: now,
        publishedAt: now,
        content: `# POLITIQUE RELATIVE AUX COOKIES ET TRACEURS

Lors de votre navigation sur le site **hotelgestion.vercel.app**, des informations relatives à votre navigation sont susceptibles d'être enregistrées dans des fichiers « Cookies » installés sur votre terminal (ordinateur, tablette, smartphone).

---

### 1. QU'EST-CE QU'UN COOKIE ?

Un cookie est un petit fichier texte déposé sur votre appareil lors de la visite d'un site web. Il permet au site de mémoriser vos actions et préférences (identifiant de session, langue, choix d'établissement) pendant un temps donné.

---

### 2. CATÉGORIES DE COOKIES UTILISÉES SUR NOTRE SITE

1. **Cookies Strictement Nécessaires (Obligatoires) :**
   Ces traceurs sont indispensables au bon fonctionnement technique de l'application (authentification sécurisée, maintien de session utilisateur, panier de réservation et de commande, protection anti-falsification CSRF). Ils ne peuvent pas être désactivés.
2. **Cookies Fonctionnels (Optionnels) :**
   Ils permettent de personnaliser votre expérience, par exemple en retenant votre établissement de préférence (*Bohicon, Abomey, Calavi ou Zogbodomey*) ou vos préférences de filtrage.
3. **Cookies de Mesure d'Audience & Analytiques (Optionnels) :**
   Ces cookies collectent des données de fréquentation anonymisées afin d'améliorer la navigation, mesurer les temps de chargement et identifier les parcours les plus consultés.
4. **Cookies Marketing & Réseaux Sociaux (Optionnels) :**
   Ces cookies permettent d'afficher des prévisualisations enrichies lors du partage de liens sur les réseaux sociaux (Open Graph, Twitter Card) et de mesurer l'impact de nos campagnes événementielles.

---

### 3. GESTION DU CONSENTEMENT

Conformément à la réglementation :
- Aucun traceur facultatif (analytique ou publicitaire) n'est déposé avant que vous n'ayez exprimé votre consentement.
- Vous pouvez à tout moment accepter l'ensemble des cookies, les refuser, ou personnaliser votre choix par catégorie via notre bandeau ou en cliquant sur le lien permanent **« Gérer les cookies »** situé en bas de chaque page du site.
- Votre choix est conservé pendant une durée de [DURÉE DE CONSERVATION DU CONSENTEMENT À CONFIRMER : ex. 6 mois ou 13 mois] sur votre navigateur.`,
        incompletePlaceholders: findPlaceholders(
          `[DURÉE DE CONSERVATION DU CONSENTEMENT À CONFIRMER : ex. 6 mois ou 13 mois]`
        ),
      },
    ],
  },

  // 4. CGU DU SITE
  {
    id: "doc-cgu",
    slug: "cgu",
    title: "Conditions Générales d’Utilisation du Site (CGU)",
    category: "CGU",
    description: "Conditions d'accès au portail web, réservations en ligne et sécurité informatique.",
    scope: "GROUPE",
    language: "FR",
    isPubliclyVisible: true,
    currentPublishedVersionId: "ver-cgu-v1",
    updatedAt: now,
    versions: [
      {
        id: "ver-cgu-v1",
        documentId: "doc-cgu",
        versionNumber: "v1.0",
        status: "PUBLIE",
        summaryOfChanges: "CGU de référence régissant l'utilisation du site vitrine et applicatif.",
        authorId: "user-promoter-01",
        authorName: "Eddy GNACADJA (Promoteur)",
        createdAt: now,
        publishedAt: now,
        content: `# CONDITIONS GÉNÉRALES D'UTILISATION (CGU)

Les présentes Conditions Générales d'Utilisation régissent l'accès et l'utilisation de l'ensemble des services disponibles sur la plateforme **hotelgestion.vercel.app**.

---

### 1. ACCEPTATION DES CONDITIONS

L'utilisation du site implique l'acceptation pleine et entière des présentes CGU. Si vous n'acceptez pas ces conditions, vous êtes invité à ne pas utiliser la plateforme.

---

### 2. ACCÈS AUX SERVICES

Le site permet :
- La consultation du catalogue des chambres, suites, pavillons et villas des 4 hôtels.
- La commande et consultation de la carte des vins et spiritueux d'exception.
- La réservation de prestations de restauration, commandes par QR code et room service.
- La demande de devis ou réservation de formules traiteur et de matériel événementiel.
- La réservation de la flotte de véhicules de prestige avec chauffeur privé.
- L'accès sécurisé à l'espace collaborateur et promoteur selon les habilitations RBAC attribuées.

---

### 3. COMPORTEMENT DE L'UTILISATEUR & SÉCURITÉ

L'utilisateur s'engage à ne pas :
- Entraver ou perturber le fonctionnement des serveurs ou réseaux connectés au site.
- Tenter d'accéder sans autorisation aux parties sécurisées de l'application ou aux comptes d'autres utilisateurs.
- Diffuser des contenus malveillants, virus, injections ou scripts automatisés.
- Utiliser les formulaires pour émettre des réservations fictives ou frauduleuses.

---

### 4. RESPONSABILITÉ

L'éditeur s'efforce de fournir des informations exactes et actualisées. Toutefois, il ne saurait être tenu responsable des interruptions momentanées de service pour maintenance, ou des aléas liés aux réseaux de télécommunication.`,
        incompletePlaceholders: [],
      },
    ],
  },

  // 5. CONDITIONS DE RÉSERVATION ET DE SÉJOUR (CGV HÉBERGEMENT)
  {
    id: "doc-cgv-sejour",
    slug: "conditions-generales-sejour",
    title: "Conditions de Réservation et de Séjour (CGV Hébergement)",
    category: "CGV_SEJOUR",
    description: "Tarifs des nuitées, check-in, check-out, arrhes, garanties et règlement intérieur des hôtels.",
    scope: "GROUPE",
    language: "FR",
    isPubliclyVisible: true,
    currentPublishedVersionId: "ver-sejour-v1",
    updatedAt: now,
    versions: [
      {
        id: "ver-sejour-v1",
        documentId: "doc-cgv-sejour",
        versionNumber: "v1.0",
        status: "PUBLIE",
        summaryOfChanges: "CGV hébergement détaillant les modalités d'arrivée, de départ et de vie hôtelière.",
        authorId: "user-promoter-01",
        authorName: "Eddy GNACADJA (Promoteur)",
        createdAt: now,
        publishedAt: now,
        content: `# CONDITIONS DE RÉSERVATION ET DE SÉJOUR (CGV HÉBERGEMENT)

Les présentes conditions définissent les droits et obligations réciproques entre les clients résidents et le Groupe Hôtel Le Vignoble.

---

### 1. TARIFS & DEVISE

- Les tarifs sont indiqués en Francs CFA (XOF) Toutes Taxes Comprises (TTC), incluant la TVA au taux légal béninois de 18% (ou le taux en vigueur au jour de la facturation).
- La taxe de séjour locale est de [MONTANT TAXE DE SÉJOUR PAR NUIT PAR PERSONNE À VALIDER : ex. 1 000 XOF ou incluse dans le tarif].

---

### 2. CONDITIONS DE RÉSERVATION & CONFIRMATION

- Pour être ferme et définitive, toute réservation doit faire l'objet du règlement d'un acompte ou de la totalité du séjour via Mobile Money (KkiaPay) ou Carte bancaire.
- Une confirmation écrite avec numéro de réservation unique est adressée instantanément par email et SMS.

---

### 3. MODALITÉS D'ARRIVÉE & DE DÉPART (CHECK-IN / CHECK-OUT)

- **Heure d'arrivée (Check-in) :** à partir de **14h00**. En cas d'arrivée anticipée (Early check-in), la mise à disposition de la chambre dépend de la disponibilité et peut faire l'objet d'un supplément [MONTANT SUPPLÉMENT EARLY CHECK-IN À CONFIRMER].
- **Heure de départ (Check-out) :** les chambres doivent être libérées au plus tard à **12h00**. Tout départ tardif (Late check-out) non autorisé sera facturé d'une nuitée supplémentaire ou d'un forfait demi-journée.
- **Pièce d'identité :** Une pièce d'identité officielle en cours de validité (Passeport, CNI ou Carte CIP béninoise) est exigée dès l'arrivée pour chaque occupant majeur, conformément aux directives sécuritaires.

---

### 4. RÈGLEMENT INTÉRIEUR & RESPECT DES LIEUX

- **Non-fumeur :** L'ensemble des chambres, suites et espaces clos sont strictement non-fumeurs. Des frais forfaitaires de désodorisation et de nettoyage approfondi de [MONTANT FRAIS NETTOYAGE TABAC À VALIDER : ex. 25 000 XOF] seront appliqués en cas de non-respect.
- **Nuisances sonores :** Le calme et la quiétude sont de rigueur entre 22h00 et 07h00.
- **Animaux :** Les animaux de compagnie sont [RÈGLE CONCERNANT LES ANIMAUX À VALIDER : ex. formellement interdits ou admis sous conditions strictes].
- **Dégradations :** Toute dégradation constatée dans les chambres ou le mobilier sera immédiatement facturée sur la base des coûts réels de remplacement ou de remise en état.`,
        incompletePlaceholders: findPlaceholders(
          `[MONTANT TAXE DE SÉJOUR PAR NUIT PAR PERSONNE À VALIDER : ex. 1 000 XOF ou incluse dans le tarif] [MONTANT SUPPLÉMENT EARLY CHECK-IN À CONFIRMER] [MONTANT FRAIS NETTOYAGE TABAC À VALIDER : ex. 25 000 XOF] [RÈGLE CONCERNANT LES ANIMAUX À VALIDER : ex. formellement interdits ou admis sous conditions strictes]`
        ),
      },
    ],
  },

  // 6. POLITIQUE D’ANNULATION ET REMBOURSEMENT
  {
    id: "doc-annulation-remboursement",
    slug: "annulation-et-remboursement",
    title: "Politique d’Annulation, Modification, No-Show et Remboursement",
    category: "ANNULATION",
    description: "Conditions d'annulation sans frais, pénalités de non-présentation et délais de recrédit.",
    scope: "GROUPE",
    language: "FR",
    isPubliclyVisible: true,
    currentPublishedVersionId: "ver-annul-v1",
    updatedAt: now,
    versions: [
      {
        id: "ver-annul-v1",
        documentId: "doc-annulation-remboursement",
        versionNumber: "v1.0",
        status: "PUBLIE",
        summaryOfChanges: "Barème des pénalités d'annulation et procédures de remboursement.",
        authorId: "user-promoter-01",
        authorName: "Eddy GNACADJA (Promoteur)",
        createdAt: now,
        publishedAt: now,
        content: `# POLITIQUE D'ANNULATION, MODIFICATION, NO-SHOW ET REMBOURSEMENT

---

### 1. CONDITIONS D'ANNULATION POUR LES SÉJOURS INDIVIDUELS

- **Annulation gratuite :** Possible jusqu'à [DÉLAI D'ANNULATION GRATUITE À VALIDER : ex. 48 heures avant la date prévue d'arrivée à 14h00]. L'intégralité des sommes versées est restituée sans pénalité.
- **Annulation tardive (entre 48h et 24h avant l'arrivée) :** La première nuitée du séjour est conservée à titre de dédommagement forfaitaire.
- **Annulation le jour même (moins de 24h avant l'arrivée) :** 100% du montant total du séjour réservé est dû et conservé.

---

### 2. NON-PRÉSENTATION DU CLIENT (NO-SHOW)

En cas de non-présentation du client à la date convenue sans notification préalable avant 20h00, la réservation est automatiquement annulée, la chambre est remise à la vente et l'intégralité du montant du séjour réservé reste acquise à l'hôtel.

---

### 3. MODIFICATION DE DATES DE SÉJOUR

Toute demande de report ou modification de dates de réservation doit être formulée par écrit. Elle reste soumise à la disponibilité des chambres aux nouvelles dates souhaitées et peut donner lieu à un réajustement tarifaire si la nouvelle période correspond à une tarification différente.

---

### 4. MODALITÉS ET DÉLAIS DE REMBOURSEMENT

- Les remboursements acceptés sont effectués selon le même mode de règlement que celui utilisé lors du paiement initial (recrédit compte Mobile Money ou compte bancaire).
- Les délais de traitement administratif et interbancaire sont de [DÉLAI DE REMBOURSEMENT À VALIDER : ex. 3 à 7 jours ouvrés].`,
        incompletePlaceholders: findPlaceholders(
          `[DÉLAI D'ANNULATION GRATUITE À VALIDER : ex. 48 heures avant la date prévue d'arrivée à 14h00] [DÉLAI DE REMBOURSEMENT À VALIDER : ex. 3 à 7 jours ouvrés]`
        ),
      },
    ],
  },

  // 7. RESTAURATION & SERVICE EN CHAMBRE
  {
    id: "doc-restauration-room-service",
    slug: "vente-restaurant-room-service",
    title: "Conditions de Vente Restaurant, Commandes et Room Service",
    category: "RESTAURATION",
    description: "Règles applicables aux repas, commandes par QR code, délais en cuisine et room service 24h.",
    scope: "GROUPE",
    language: "FR",
    isPubliclyVisible: true,
    currentPublishedVersionId: "ver-resto-v1",
    updatedAt: now,
    versions: [
      {
        id: "ver-resto-v1",
        documentId: "doc-restauration-room-service",
        versionNumber: "v1.0",
        status: "PUBLIE",
        summaryOfChanges: "Conditions générales de restauration et dégustation en chambre.",
        authorId: "user-promoter-01",
        authorName: "Eddy GNACADJA (Promoteur)",
        createdAt: now,
        publishedAt: now,
        content: `# CONDITIONS DE VENTE DU RESTAURANT, DES COMMANDES ET DU SERVICE EN CHAMBRE

---

### 1. CARTE DU RESTAURANT & ORIGINE DES PRODUITS

- Les repas servis au sein de nos restaurants sont préparés minute à la commande par notre brigade de cuisiniers, à partir de vivres frais et locaux (volailles fermières, viandes et poissons du terroir, légumes biologiques des marchés régionaux).
- Aucun repas n'est stocké à l'avance afin de préserver une fraîcheur et une hygiène irréprochables.

---

### 2. COMMANDES PAR QR CODE EN SALLE & EN CHAMBRE

- Les convives peuvent passer commande directement depuis leur table ou leur suite en scannant le QR code dédié.
- La transmission en cuisine est instantanée. Le délai moyen de préparation est de [DÉLAI MOYEN DE PRÉPARATION À CONFIRMER : ex. 20 à 35 minutes selon les mets choisis].

---

### 3. SERVICE EN CHAMBRE (ROOM SERVICE)

- Le room service est disponible aux horaires suivants : [HORAIRES ROOM SERVICE À VALIDER : ex. 06h00 à 23h00 ou 24h/24 pour les suites royales].
- Des frais de service en chambre de [MONTANT SUPPLÉMENT ROOM SERVICE À VALIDER : ex. 10% du montant de la commande ou inclus] peuvent être appliqués.

---

### 4. ALLERGIES ET INTOLÉRANCES

Il appartient au client d'informer préalablement le personnel de service de toute allergie ou intolérance alimentaire (arachides, gluten, crustacés, lactose). Le restaurant décline toute responsabilité en cas de non-signalement par le convive.`,
        incompletePlaceholders: findPlaceholders(
          `[DÉLAI MOYEN DE PRÉPARATION À CONFIRMER : ex. 20 à 35 minutes selon les mets choisis] [HORAIRES ROOM SERVICE À VALIDER : ex. 06h00 à 23h00 ou 24h/24 pour les suites royales] [MONTANT SUPPLÉMENT ROOM SERVICE À VALIDER : ex. 10% du montant de la commande ou inclus]`
        ),
      },
    ],
  },

  // 8. LOCATION DE VÉHICULES VIP
  {
    id: "doc-location-vehicules",
    slug: "location-vehicules",
    title: "Conditions Générales de Location des Véhicules et Flotte Privée",
    category: "LOCATION_VEHICULES",
    description: "Conditions pour berlines VIP, 4x4, minibus, assurances, chauffeurs privés et cautions.",
    scope: "GROUPE",
    language: "FR",
    isPubliclyVisible: true,
    currentPublishedVersionId: "ver-auto-v1",
    updatedAt: now,
    versions: [
      {
        id: "ver-auto-v1",
        documentId: "doc-location-vehicules",
        versionNumber: "v1.0",
        status: "PUBLIE",
        summaryOfChanges: "Réglementation de la flotte de mobilité privée avec ou sans chauffeur.",
        authorId: "user-promoter-01",
        authorName: "Eddy GNACADJA (Promoteur)",
        createdAt: now,
        publishedAt: now,
        content: `# CONDITIONS DE LOCATION DES VÉHICULES & FLOTTE PRIVÉE

---

### 1. VÉHICULES PROPOSÉS & PRESTATIONS

Le Groupe Hôtel Le Vignoble met à disposition une flotte de véhicules de prestige (Berlines VIP Mercedes/Toyota, SUV 4x4 tout-terrain et Minibus exécutifs) pour les transferts aéroport (Cotonou Cadjehoun), circuits touristiques et déplacements d'affaires à travers le Bénin.

---

### 2. CONDITIONS RELATIVES AU CONDUCTEUR (SANS CHAUFFEUR)

- Âge minimum requis : [ÂGE MINIMUM DU CONDUCTEUR À CONFIRMER : ex. 25 ans révolus].
- Permis de conduire national ou international valide depuis au moins [ANCIENNETÉ PERMIS À CONFIRMER : ex. 2 ans].
- Une caution bancaire ou dépôt de garantie de [MONTANT DE LA CAUTION VÉHICULE À VALIDER : ex. 100 000 à 300 000 XOF selon la catégorie du véhicule] est obligatoirement bloquée avant la remise des clés.

---

### 3. OPTION AVEC CHAUFFEUR PRIVÉ DÉDIÉ

Lorsque le véhicule est loué avec chauffeur professionnel assermenté par l'hôtel, la responsabilité de la conduite et du carburant de base relève du protocole de la conciergerie, et aucune caution de conduite n'est exigée du client.

---

### 4. PÉRIMÈTRE GÉOGRAPHIQUE AUTORISÉ

Les véhicules sont autorisés à circuler sur l'ensemble du territoire de la République du Bénin. Toute sortie de territoire vers un pays limitrophe (Togo, Nigéria, etc.) nécessite une autorisation écrite préalable de la Direction Générale et une extension d'assurance spécifique.`,
        incompletePlaceholders: findPlaceholders(
          `[ÂGE MINIMUM DU CONDUCTEUR À CONFIRMER : ex. 25 ans révolus] [ANCIENNETÉ PERMIS À CONFIRMER : ex. 2 ans] [MONTANT DE LA CAUTION VÉHICULE À VALIDER : ex. 100 000 à 300 000 XOF selon la catégorie du véhicule]`
        ),
      },
    ],
  },

  // 9. LOCATION DE SALLES & ÉVÉNEMENTS
  {
    id: "doc-location-salles-evenements",
    slug: "location-salles-et-evenements",
    title: "Conditions de Location des Salles et Prestations Événementielles",
    category: "EVENEMENTS",
    description: "Salles de fête, de réunion, ateliers, bâches/hangars, acompte, horaires et sécurité.",
    scope: "GROUPE",
    language: "FR",
    isPubliclyVisible: true,
    currentPublishedVersionId: "ver-salles-v1",
    updatedAt: now,
    versions: [
      {
        id: "ver-salles-v1",
        documentId: "doc-location-salles-evenements",
        versionNumber: "v1.0",
        status: "PUBLIE",
        summaryOfChanges: "Règlement des espaces de conférence, de gala et de cérémonie.",
        authorId: "user-promoter-01",
        authorName: "Eddy GNACADJA (Promoteur)",
        createdAt: now,
        publishedAt: now,
        content: `# CONDITIONS DE LOCATION DES SALLES & PRESTATIONS ÉVÉNEMENTIELLES

---

### 1. ESPACES DISPONIBLES

Le Groupe Hôtel Le Vignoble propose à la location :
- Salles de banquet et galas de prestige (jusqu'à 300 personnes).
- Salles de réunion de direction et séminaires équipées (vidéoprojecteur 4K, micro sans fil, sonorisation).
- Salles d'ateliers et formations.
- Bâches étanches et grands hangars de fête en plein air dans nos jardins arborés.

---

### 2. RÉSERVATION & VERSEMENT D'ACOMPTE

- La confirmation d'un événement intervient à la signature du devis et au versement d'un acompte de [POURCENTAGE ACOMPTE ÉVÉNEMENT À VALIDER : ex. 50% du montant total].
- Le solde doit être réglé au plus tard [DÉLAI RÈGLEMENT SOLDE SALLES À VALIDER : ex. 7 jours avant le début de l'événement].

---

### 3. HORAIRES & LIMITES SONORES

- Les manifestations nocturnes sont autorisées jusqu'à [HEURE LIMITE SONORE EN SOIRÉE À VALIDER : ex. 01h00 du matin pour les salles fermées / 23h00 pour les espaces extérieurs].
- L'organisateur s'engage à respecter les normes de décibels prescrites par les autorités préfectorales et municipales.`,
        incompletePlaceholders: findPlaceholders(
          `[POURCENTAGE ACOMPTE ÉVÉNEMENT À VALIDER : ex. 50% du montant total] [DÉLAI RÈGLEMENT SOLDE SALLES À VALIDER : ex. 7 jours avant le début de l'événement] [HEURE LIMITE SONORE EN SOIRÉE À VALIDER : ex. 01h00 du matin pour les salles fermées / 23h00 pour les espaces extérieurs]`
        ),
      },
    ],
  },

  // 10. TRAITEUR & LOCATION DE MATÉRIEL
  {
    id: "doc-traiteur-materiel",
    slug: "service-traiteur-et-materiel",
    title: "Conditions du Service Traiteur et de la Location de Matériel",
    category: "TRAITEUR",
    description: "Banquets clés en main, chafing dishes, couverts dorés, tables, chaises, effectifs convives.",
    scope: "GROUPE",
    language: "FR",
    isPubliclyVisible: true,
    currentPublishedVersionId: "ver-traiteur-v1",
    updatedAt: now,
    versions: [
      {
        id: "ver-traiteur-v1",
        documentId: "doc-traiteur-materiel",
        versionNumber: "v1.0",
        status: "PUBLIE",
        summaryOfChanges: "Dispositions contractuelles pour les forfaits banquets et le matériel traiteur.",
        authorId: "user-promoter-01",
        authorName: "Eddy GNACADJA (Promoteur)",
        createdAt: now,
        publishedAt: now,
        content: `# CONDITIONS DU SERVICE TRAITEUR ET DE LA LOCATION DE MATÉRIEL

---

### 1. FORMULES BANQUETS & NOMBRE DE CONVIVES

- Les forfaits traiteur (Terroir Royal, Prestige, Gala Gastronomique) sont calculés sur un prix fixe par convive avec un minimum requis de [MINIMUM DE CONVIVES EXIGÉ À VALIDER : ex. 30 personnes].
- Le nombre définitif de convives doit être communiqué au service commercial au plus tard [DÉLAI CONFIRMATION EFFECTIF BANQUET À VALIDER : ex. 5 jours ouvrés avant la prestation].

---

### 2. LOCATION DE MATÉRIEL ÉVÉNEMENTIEL

- Le matériel loué (chafing dishes en inox, couverts dorés, assiettes en porcelaine, verres à pied, tables banquet rondes et rectangulaires, chaises Napoléon blanches ou dorées) est remis en parfait état de propreté et de marche.
- Un inventaire contradictoire d'enlèvement et de retour est dressé.
- Tout article cassé, fêlé, détérioré ou manquant sera facturé selon le barème officiel des pièces de rechange de l'économat.`,
        incompletePlaceholders: findPlaceholders(
          `[MINIMUM DE CONVIVES EXIGÉ À VALIDER : ex. 30 personnes] [DÉLAI CONFIRMATION EFFECTIF BANQUET À VALIDER : ex. 5 jours ouvrés avant la prestation]`
        ),
      },
    ],
  },

  // 11. RÉCLAMATIONS & CONTACT
  {
    id: "doc-reclamations-contact",
    slug: "reclamations-et-contact",
    title: "Politique de Réclamations, Médiation et Coordonnées de Contact",
    category: "RECLAMATIONS",
    description: "Procédure officielle de traitement des réclamations, délais d'instruction et médiation.",
    scope: "GROUPE",
    language: "FR",
    isPubliclyVisible: true,
    currentPublishedVersionId: "ver-reclam-v1",
    updatedAt: now,
    versions: [
      {
        id: "ver-reclam-v1",
        documentId: "doc-reclamations-contact",
        versionNumber: "v1.0",
        status: "PUBLIE",
        summaryOfChanges: "Protocole d'écoute client, traitement sous 48h et médiation amiable.",
        authorId: "user-promoter-01",
        authorName: "Eddy GNACADJA (Promoteur)",
        createdAt: now,
        publishedAt: now,
        content: `# POLITIQUE DE RÉCLAMATIONS & CONTACT

Le Groupe Hôtel Le Vignoble place la satisfaction de ses résidents au cœur de sa démarche qualité.

---

### 1. PROCÉDURE DE SIGNALEMENT IMMÉDIAT

Durant votre séjour, nous vous invitons à signaler sans délai toute anomalie à la réception ou auprès du Gérant du site concerné afin de nous permettre d'y remédier immédiatement.

---

### 2. RÉCLAMATION ÉCRITE FORMELLE

Si une solution satisfaisante n'a pu être apportée sur place, vous pouvez adresser votre réclamation écrite par :
- **Courrier électronique :** reclamation@hotel-levignoble.bj ou direction@hotel-levignoble.bj
- **Courrier postal :** Direction Générale Hôtel Le Vignoble, BP [BOÎTE POSTALE À COMPLÉTER], Ville de Bohicon, République du Bénin.
- **Délai de traitement :** Notre service d'audit qualité s'engage à vous accuser réception sous 24h et à vous apporter une réponse motivée sous [DÉLAI DE RÉPONSE RÉCLAMATION À VALIDER : ex. 48 heures ouvrées].

---

### 3. DROIT APPLICABLE & JURIDICTION COMPÉTENTE

Tout différend né de l'interprétation ou de l'exécution des présentes conditions est soumis au **droit béninois**. À défaut de règlement amiable, compétence exclusive est attribuée au **Tribunal de Première Instance de Première Classe d'Abomey** [JURIDICTION COMPÉTENTE À VALIDER].`,
        incompletePlaceholders: findPlaceholders(
          `[BOÎTE POSTALE À COMPLÉTER] [DÉLAI DE RÉPONSE RÉCLAMATION À VALIDER : ex. 48 heures ouvrées] [JURIDICTION COMPÉTENTE À VALIDER]`
        ),
      },
    ],
  },

  // 12. DÉCLARATION D'ACCESSIBILITÉ
  {
    id: "doc-accessibilite",
    slug: "declaration-accessibilite",
    title: "Déclaration d’Accessibilité du Site (RGAA / WCAG 2.1)",
    category: "ACCESSIBILITE",
    description: "Engagements de conformité numérique, contrastes, navigation au clavier et assistance.",
    scope: "GROUPE",
    language: "FR",
    isPubliclyVisible: true,
    currentPublishedVersionId: "ver-access-v1",
    updatedAt: now,
    versions: [
      {
        id: "ver-access-v1",
        documentId: "doc-accessibilite",
        versionNumber: "v1.0",
        status: "PUBLIE",
        summaryOfChanges: "Déclaration de conformité aux recommandations WCAG 2.1 niveau AA.",
        authorId: "user-promoter-01",
        authorName: "Eddy GNACADJA (Promoteur)",
        createdAt: now,
        publishedAt: now,
        content: `# DÉCLARATION D'ACCESSIBILITÉ DU SITE

Le Groupe Hôtel Le Vignoble s'engage à rendre son site web accessible à tous les publics, y compris les personnes en situation de handicap, conformément aux standards internationaux des **Web Content Accessibility Guidelines (WCAG 2.1 niveau AA)**.

---

### 1. ÉTAT DE CONFORMITÉ & DISPOSITIFS MIS EN ŒUVRE

- **Navigation clavier intégrale :** L'ensemble des formulaires de réservation, boutons et menus déroulants sont praticables au clavier (tabulation, touche entrée, échappement).
- **Rapports de contraste :** Les textes respectent un rapport de contraste minimal supérieur à 4.5:1 sur les fonds clairs comme sombres.
- **Alternatives textuelles :** Les images des chambres, forfaits traiteur et véhicules comportent des balises textuelles explicites (\`alt\`).
- **Compatibilité mobile & synthèse vocale :** La structure HTML sémantique (balises \`<header>\`, \`<main>\`, \`<nav>\`, \`<footer>\`) facilite l'interprétation par les lecteurs d'écran.

---

### 2. CONTACT RÉFÉRENT ACCESSIBILITÉ

Si vous rencontrez un défaut d'accessibilité vous empêchant d'accéder à un contenu ou à une fonctionnalité, vous pouvez nous contacter :
- **Email :** accessibilite@hotel-levignoble.bj
- **Téléphone :** +229 97 00 11 22 [NUMÉRO ASSISTANCE ACCESSIBILITÉ À CONFIRMER]`,
        incompletePlaceholders: findPlaceholders(
          `[NUMÉRO ASSISTANCE ACCESSIBILITÉ À CONFIRMER]`
        ),
      },
    ],
  },
];

export const DEFAULT_COOKIE_SETTINGS = {
  version: "1.0",
  bannerTitle: "Respect de votre vie privée & Cookies",
  bannerDescription:
    "Hôtel Le Vignoble utilise des traceurs essentiels pour sécuriser votre session et vos réservations. Avec votre accord, nous utilisons également des traceurs optionnels pour mesurer l'audience et personnaliser votre expérience.",
  categories: [
    {
      id: "NECESSARY" as const,
      title: "Traceurs strictement nécessaires",
      description: "Indispensables au fonctionnement sécurisé du site, maintien de la session et validation des réservations. Ne peuvent pas être désactivés.",
      isMandatory: true,
      enabled: true,
    },
    {
      id: "FUNCTIONAL" as const,
      title: "Traceurs fonctionnels & Établissements",
      description: "Mémorisent vos préférences de site hôtelier (Bohicon, Abomey, Calavi, Zogbodomey) et la devise sélectionnée.",
      isMandatory: false,
      enabled: true,
    },
    {
      id: "ANALYTICS" as const,
      title: "Mesure d'audience & Performance",
      description: "Permettent d'analyser anonymement le trafic et d'optimiser l'ergonomie de nos pages.",
      isMandatory: false,
      enabled: false,
    },
    {
      id: "MARKETING" as const,
      title: "Partage sur les Réseaux Sociaux & Événements",
      description: "Facilitent les prévisualisations grand format lors du partage d'offres hôtelières sur vos réseaux sociaux.",
      isMandatory: false,
      enabled: false,
    },
  ],
  updatedAt: now,
  updatedBy: "Eddy GNACADJA (Promoteur)",
};
