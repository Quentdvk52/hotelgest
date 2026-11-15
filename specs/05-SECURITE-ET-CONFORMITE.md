# HotelGest — Sécurité et conformité

## 1. Principes

Privacy by design, moindre privilège, isolation tenant, auditabilité, séparation des tâches, sécurité serveur et minimisation des données. Les obligations exactes du Bénin et des autres pays doivent être vérifiées par un conseil local; ce document ne constitue pas un avis juridique.

## 2. Contrôles obligatoires

- Authentification solide; MFA obligatoire pour promoteurs, finance, administrateurs et support.
- RBAC + périmètres; chaque endpoint et action serveur vérifie le droit.
- Protection CSRF/XSS/injection, limites de débit, validation stricte, CSP, cookies sécurisés et headers adaptés.
- Secrets dans coffre/environnement protégé, rotation et séparation dev/staging/prod.
- Chiffrement TLS et stockage chiffré; fichiers privés en URLs signées de courte durée.
- Audit des accès/export, changements de rôles, opérations financières, remises, mutations et clôtures.
- Journaux sans secrets, jetons, données carte ou pièces d’identité complètes.
- Procédure d’incident, révocation de session, sauvegardes et restauration.

## 3. Données personnelles

Inventorier données et finalités; afficher notices/consentements applicables; limiter l’accès par fonction; définir correction, export, suppression ou restriction en accord avec obligations légales et conservation comptable. Géolocalisation du pointage désactivée par défaut jusqu’à validation locale et information des employés.

## 4. Paiements

Les règlements d’hôtel sont reçus hors plateforme au MVP. L’application enregistre mode, montant, référence et auteur après confirmation réelle, sans collecter PAN/CVV ni identifiants Mobile Money. Les abonnements SaaS passent par Chariow via checkout hébergé et webhook authentifié; les clés demeurent serveur.

## 5. Modèle de menace à examiner

Accès inter-tenant, escalade de rôle, QR deviné/rejoué, double commande, double paiement déclaré, manipulation de prix client, faux webhook Chariow, export massif, compte employé perdu, vol de session, fichier malveillant, réseau instable, panne fournisseur et abus de support.

## 6. Revue locale avant production

Faire valider registre hôtelier, collecte de pièce d’identité, durée de conservation, règles fiscales et factures, droit du travail/pointage, contrats de location, politique d’annulation et traitement des paiements par des professionnels compétents dans chaque territoire.
