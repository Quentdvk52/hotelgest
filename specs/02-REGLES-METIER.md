# HotelGest — Règles métier de référence

Les règles fiscales et sociales doivent être validées par des professionnels au Bénin. Les seuils et politiques sont configurables; aucun paramètre ci-dessous ne vaut avis légal.

## 1. Hiérarchie et contexte

Tenant SaaS → organisation/promoteur → groupe → site → département → point de vente/ressource. Chaque donnée métier porte un tenant et, lorsque pertinent, un site. Les actions multi-site exigent une permission dédiée. Les employés ne changent pas de site par simple bascule : mutation approuvée, datée, avec historique d’affectation; remplacement temporaire = délégation bornée et auditée.

## 2. Disponibilité et réservations

- Une unité ne peut avoir deux séjours confirmés qui se chevauchent; la contrainte doit être garantie en transaction/base de données.
- Les réservations provisoires expirent selon un délai configurable; le MVP n’encaisse pas les réservations en ligne.
- No-show, annulation, modification, prolongation, arrivée anticipée et départ tardif doivent suivre une politique explicite par tarif/site.
- Recommandation : désactiver l’overbooking au MVP. Une activation ultérieure exige permission direction, limite par catégorie/site, justification, liste d’impact et plan de relogement.
- Tous les tarifs enregistrent devise, période d’effet, taxes/frais applicables, canal et auteur de modification.

## 3. QR commande

- QR de table/chambre identifie une ressource opaque, jamais un client.
- Le code peut être révoqué/rotaté; la commande valide que la ressource appartient au site actif et est autorisée à commander.
- Statuts recommandés : brouillon, envoyée, acceptée, en préparation, prête, servie, annulée. Toute transition sensible garde auteur/horodatage.
- Les articles routés peuvent être divisés en tickets station : cuisine, bar, cave. Un article ne disparaît pas si une station est temporairement indisponible; afficher état d’erreur et permettre reprise sans doublon.
- Prix et disponibilité sont recalculés côté serveur au moment de soumission. Les allergènes sont visibles; une note client ne remplace pas une déclaration allergène validée.
- Paiement en ligne client désactivé au MVP. « Paiement externe » représente un choix/mode, pas une preuve automatique. Le personnel habilité enregistre le paiement après réception réelle.
- Transfert au folio possible seulement si une session de séjour est active et que le personnel ou le parcours a une preuve d’autorisation suffisante.

## 4. Remises et annulations

- Toute demande contient portée (ligne/commande/folio), montant ou taux, motif, demandeur, site et statut.
- Recommandation initiale : seuils par rôle configurables; aucune auto-approbation par le demandeur. Au-dessus du seuil, approbation directeur/promoteur. Valeurs initiales à déterminer avec le promoteur avant production.
- Une facture émise n’est jamais réécrite silencieusement : correction via avoir/ligne de correction liée.
- Annulation de commande après envoi en station exige motif et permission; station reçoit l’annulation.

## 5. Caisse et paiements

- Chaque caisse a un site, un point de vente, un responsable, un fonds d’ouverture, devise et session.
- Paiements acceptés comme modes configurables : espèces, TPE, virement, Mobile Money, autres. Aucun prestataire hôtelier n’est connecté au MVP; les règlements sont enregistrés comme opérations réalisées hors plateforme.
- Opération = montant, devise, mode, référence/justificatif facultatif, auteur, date et documents associés. Les données sensibles de carte ne sont jamais stockées.
- Clôture compare ventes/encaissements théoriques et montants comptés par mode; écarts obligent motif. Correction via mouvement inverse, jamais effacement.
- Fonds de caisse et dépôts sont distincts du revenu; dépôts remboursables et cautions sont des passifs tant que leur traitement n’est pas décidé par comptabilité.
- Pourboire, commission OTA, remboursement et compte client sont des lignes distinctes et rapprochables.

## 6. Comptabilité / SYSCOHADA révisé

- Tenir un sous-livre opérationnel complet et exporter des écritures équilibrées; ne pas prétendre remplacer une validation comptable.
- Le plan de comptes, journaux, taxes, périodes, classes et mapping sont administrables par un profil comptable autorisé.
- Les mouvements validés sont append-only; correction par contrepassation et nouvelle écriture.
- Exports filtrables par période/site/journal avec débit = crédit, référence source et devise.
- Faire valider le mapping SYSCOHADA, la TVA, taxe de séjour, retenues et obligations de facturation par le cabinet comptable local.

## 7. Night audit

Recommandation : clôture journalière par site, à heure locale configurable. Procédure : vérifier les séjours et folios, imputer la nuit selon tarif, signaler les dossiers incomplets, rapprocher ventes et paiements, produire journaux/indicateurs, vérifier commandes ouvertes, confirmer fonds et écarts, puis verrouiller date comptable. Réouverture limitée à promoteur/comptable autorisé avec motif, double validation si période fiscale clôturée.

## 8. Pays, devise et langue

- Détection navigateur/IP = suggestion; utilisateur peut modifier. Enregistrement compte/site = source de vérité.
- Paramètres pays chargent langue suggérée, devise, fuseau, formats et un jeu de taxes provisoire versionné. Ils sont revus avant facturation réelle.
- Devise de chaque établissement pour livres et caisses; consolidation groupe convertit selon taux/source/date configurés et affiche clairement conversion.
- Prix SaaS peut être présenté localement, mais facture Chariow suit le catalogue/configuration réellement accepté. Aucun taux de change inventé.

## 9. Personnel et présence

- Types de contrat extensibles : stagiaire, CDI, CDD, occasionnel et autres.
- Pointage sélectionnable par administrateur : mobile, PIN, badge, terminal; géolocalisation désactivée par défaut, opt-in/notice et validation légale nécessaires.
- Les pointages ne sont pas modifiables sans trace; correction avec motif et approbation.
- Paie : recommandation MVP = présence/variables et export; calcul légal complet reporté à validation des règles locales.
