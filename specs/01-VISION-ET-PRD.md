# HotelGest — Vision et PRD

## 1. Résumé

HotelGest est un SaaS de pilotage hôtelier africain, conçu pour les propriétaires/promoteurs qui gèrent un ou plusieurs établissements. Il centralise ventes, opérations, équipes et finances tout en respectant les particularités de chaque site. L’hôtel pilote est Hôtel Le Vignoble (Bohicon, Abomey, Abomey-Calavi, Zogbodomey).

## 2. Objectifs

- Réduire les doubles saisies et erreurs de disponibilité/commande.
- Donner une vue quotidienne fiable au personnel, à la direction du site et au promoteur.
- Permettre aux clients de réserver et commander depuis un parcours web/QR simple.
- Tracer chaque vente, paiement déclaré, remise, annulation et correction.
- Permettre l’expansion vers d’autres hôtels et pays sans mélanger leurs données.

## 3. Personas et accès

Promoteur propriétaire du tenant; administrateur groupe; directeur de site; réceptionniste; responsable hébergement; agent housekeeping; serveuse; caissier; cuisinier; barman; responsable cave; responsable événementiel; responsable véhicules; RH; comptable; auditeur; client public; client hébergé. Les rôles sont des modèles modifiables, les permissions étant attribuées par personne avec périmètre et journalisation.

## 4. Périmètre fonctionnel cible

1. Organisation multi-tenant, groupe, sites, départements, points de vente, paramètres pays.
2. Réservations directes, PMS, réception, chambres, tarifs, disponibilité, folios et factures.
3. POS restaurant/bar, QR de chambre/table, menu, commande, routage par station et paiement/folio.
4. Salles, événements, devis, packages, contrats et facturation.
5. Flotte automobile, réservations, contrats, dépôts, inspections et maintenance.
6. Cave/stock, recettes, inventaires, achats et fournisseurs.
7. Personnel, contrats, plannings, présence, congés, formations et exports paie.
8. Trésorerie, caisses, dépenses, rapprochement et exports SYSCOHADA révisé.
9. Maintenance/actifs, CRM, fidélité, communication et portails.
10. Abonnement SaaS, support, paramètres de marque et console opérateur.

## 5. MVP priorisé

### P0 — Lancement pilote

- Gestion tenant, groupe et sites; rôles/permissions; paramètres de site.
- Référentiel des chambres/unités, catégories, tarifs, disponibilités et réservation.
- Arrivée/départ, attribution de chambre, états d’occupation et housekeeping.
- Folio, facture/reçu, encaissement déclaré par moyen et gestion de caisse.
- Restaurant/bar multi-site : articles, tables, QR, commande client, commande serveuse, station cuisine/bar/cave, suivi et folio.
- Réduction demandée, approbation par limite configurable, motif et audit.
- Night audit avec contrôles de cohérence et fermeture explicite.
- Dashboard jour/site et rapports de ventes/occupation/caisse.
- Chariow abonnement SaaS, en environnement sandbox puis production après secrets/validation.
- Interface français, modèle i18n prêt pour traductions et monnaie locale du site.

### P1 — Extension opérationnelle

Réservation de salle et événement, voitures, stock/achats, CRM client, portail client, exports comptables améliorés, notifications et imports historiques.

### P2 — Suite groupe

Pointage multimode, paie/intégration, intégrations OTA/channel manager, serrures, fidélité, maintenance avancée, application terrain/PWA offline ciblée, analytics groupe et multi-pays approfondi.

## 6. Parcours principaux

### Réservation séjour

Recherche site/dates/occupants → disponibilité et prix explicites → coordonnées et préférences → réservation confirmée sans encaissement en ligne au MVP → dossier visible à la réception → check-in → folio des ventes → règlement externe enregistré par un rôle habilité → facture et check-out.

### Commande QR chambre/table

Scanner QR signé et révocable → vérifier contexte (site, chambre/table, statut) → menu disponible et allergènes → panier → soumission → numéro de commande et statut → routage station → préparation/servi → paiement externe à la livraison ou transfert au folio avec autorisation. QR ne doit pas contenir de données personnelles ni donner accès au dossier client.

### Commande employé

Serveuse sélectionne site/zone/table ou chambre autorisée → saisit articles et notes → système sépare automatiquement cuisine, bar et cave → stations accusent réception et mettent à jour le statut → addition ou folio.

### Demande de réduction

Employé saisit montant/pourcentage et justification → requête en attente → approbateur autorisé selon seuil/site → accord/refus consigné → nouvelle facture/ligne liée à l’originale, sans effacer la vente.

### Fin de journée

Précontrôles (arrivées, folios, ventes non réglées, écarts de caisse, commandes ouvertes) → résolution ou justification → calcul des rapports et taxes configurées → validation responsable → verrouillage de la journée comptable → réouverture exceptionnelle avec motif et audit.

## 7. Indicateurs clés

Occupation; chambres vendues/disponibles; ADR; RevPAR; arrivées/départs; ventes par département, station et moyen de paiement; commandes en attente et temps de préparation; annulations/no-shows; remises; écarts de caisse; encours client; dépenses; stock théorique/physique; performance par site et consolidée.

## 8. Modèle commercial HotelGest

- Mensuel : 100 000 XOF.
- Semestriel : réduction de 10 % sur le prix mensuel, paiement pour six mois (540 000 XOF si base constante).
- Annuel : réduction de 30 % sur le prix mensuel, paiement pour douze mois (840 000 XOF si base constante).
- Montants affichés en devise sélectionnée avec devise de facturation réelle explicitée; conversions informatives ne changent pas la facture XOF sans règle tarifaire approuvée.
- Chariow gère le checkout SaaS; HotelGest conserve statut d’abonnement, plan, échéances, identifiants externes et événements vérifiés. Aucun secret côté navigateur.

## 9. Mesure de succès du pilote

Les cibles chiffrées seront établies après observation de l’exploitation. Le pilote doit permettre de mesurer : part des réservations/ventes saisies une seule fois; taux d’erreur de chambre/table; temps de routage de commande; écarts de clôture; taux de commandes QR complétées; adoption par équipe; qualité des exports et disponibilité du système.
