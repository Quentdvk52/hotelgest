# Prompt maître Antigravity — HotelGest

Tu es l’agent d’ingénierie principal chargé de réaliser **HotelGest**, un SaaS professionnel de gestion hôtelière, de bout en bout. Le groupe pilote est **Hôtel Le Vignoble**, avec quatre sites : Bohicon, Abomey, Abomey-Calavi et Zogbodomey. Chaque site comprend des chambres, un restaurant et un bar; le groupe possède aussi une cave à vin, des véhicules en location, et des espaces de conférence, ateliers et fêtes.

## Résultat attendu

Construis une application web multi-tenant et multisite, responsive, internationalisable, sécurisée et réellement utilisable. Elle doit couvrir le parcours public de découverte/réservation, le back-office d’exploitation et les vues adaptées aux équipes. Une interface de démonstration statique seule ne satisfait pas la demande : les flux principaux doivent être reliés à une persistance réelle ou, lorsque les secrets/services externes ne sont pas disponibles, à des adaptateurs clairement signalés et remplaçables.

## Documents de référence

Lis tous les fichiers de ce dossier avant de planifier. En cas de conflit, applique cet ordre : réponses explicites du propriétaire dans `08-QUESTIONS-ET-HYPOTHESES.md`, règles de sécurité, autres documents. Toute hypothèse non confirmée doit être consignée et isolée dans la configuration; ne transforme pas une hypothèse en règle légale certaine.

## Première action obligatoire

1. Inspecte le dépôt, les fichiers existants, les consignes `AGENTS.md`/README, l’état Git, la stack, les tests et les déploiements.
2. Présente un bref état des lieux et un plan par étapes. Réutilise l’architecture existante si elle est saine; n’écrase aucun travail, ne supprime aucune donnée et n’exécute pas de migration destructive.
3. Si le dépôt est vide, crée l’application à partir de l’architecture recommandée dans `03-ARCHITECTURE-TECHNIQUE.md`.
4. Repère les décisions qui bloquent réellement la sécurité, le légal ou une action irréversible. Pour le reste, avance avec les valeurs recommandées, faciles à changer.

## Priorités produit non négociables

- Isolation tenant stricte et hiérarchie organisation → groupe → site → département → point de vente.
- PMS, réservations, calendrier de disponibilité, réception, folios, factures et clôture journalière cohérents.
- Restaurant/bar avec QR distinct par chambre/table, menu client, commandes sans serveuse, commandes saisies par serveuse, routage cuisine/bar/cave, états de préparation et transfert éventuel au folio.
- Module multisite utilisable pour les quatre sites du pilote et consolidation autorisée au niveau groupe.
- RBAC et permissions attribuées par promoteur, périmètre par site et audit des changements sensibles.
- Réductions demandées par les clients soumises à une approbation adaptée à un seuil configurable; aucun employé ne peut contourner ses limites.
- Gestion de caisse et paiements enregistrés par mode (espèces, TPE, virement, Mobile Money) sans intégrer de processeur pour les paiements hôteliers au MVP. Une sélection « paiement externe » ne doit jamais prétendre confirmer le règlement sans preuve/saisie autorisée.
- Aucune collecte en ligne de paiement de réservation pour le MVP. Chariow est utilisé pour l’abonnement HotelGest uniquement, selon intégration officielle et webhooks vérifiés.
- Tarifs SaaS de départ : mensuel 100 000 XOF; semestriel 10 % de réduction sur six mois; annuel 30 % de réduction sur douze mois. Rendre prix/devise/plans administrables et afficher calculs sans ambiguïté.
- Comptabilité alignée sur le SYSCOHADA révisé au moyen d’un modèle paramétrable/exportable; faire valider les comptes, taxes et états par un comptable du Bénin avant usage légal.
- Détection pays/langue/devise comme suggestion explicite et modifiable. Le pays de l’établissement et sa devise comptable sont configurés par le promoteur; ne jamais supposer que la géolocalisation IP définit la fiscalité.
- Design premium, cohérent, accessible et rapide. Animation/3D ciblées, jamais au détriment des flux réception, commande, caisse et sécurité.

## Méthode d’exécution

- Découpe le travail en tranches verticales, avec données, autorisation, interface, erreurs et audit associés.
- Commence par les fondations, le modèle multi-tenant, le design system, l’authentification et les scénarios de données de démonstration non sensibles.
- Implémente ensuite les parcours MVP dans l’ordre décrit par `07-ROADMAP.md`.
- Travaille avec migrations versionnées, contraintes de base de données, transactions et idempotence pour les opérations financières et commandes.
- N’expose aucune clé, ne fabrique pas de données de paiement réelles, n’envoie pas de message externe et ne déploie pas en production sans demande explicite.
- Ajoute et exécute les tests utiles aux invariants critiques, vérifie le build et les parcours clés. Pour chaque étape, rapporte les commandes exécutées et résultats réels; ne prétends pas avoir vérifié ce qui ne l’a pas été.
- Utilise les skills et bibliothèques de `09-SKILLS-ET-DEPENDANCES.md` selon besoin et uniquement à partir de sources officielles.
- Maintiens `08-QUESTIONS-ET-HYPOTHESES.md` et le journal de décisions à jour. Si un secret/API externe est manquant, livre l’adaptateur, le mode mock explicite, le guide de configuration et les critères de validation.

## Fonctionnalités à livrer

Le PRD décrit les modules complets visés à terme. Le MVP opérationnel comprend au minimum : comptes/organisation/sites/droits; chambres, types, tarifs et disponibilités; réservations et accueil; folios/factures; housekeeping; commande QR restaurant/bar et console de préparation; caisse et dépenses de base; clôture de nuit; rapports essentiels; abonnement SaaS Chariow derrière un adaptateur vérifiable; configuration pays/devise/langue; audit et exports.

Construis également des modules extensibles pour salles/événements, voitures, cave/stock, RH/présence, maintenance, CRM/fidélité, achats et comptabilité/export. Les écrans MVP doivent distinguer clairement ce qui fonctionne de ce qui est encore planifié.

## Définition de livraison

Le projet n’est terminé que lorsque les critères de `06-QUALITE-ET-ACCEPTATION.md` sont satisfaits, que l’app démarre selon un guide reproductible, que les migrations et données de démonstration sont documentées, que les rôles sont testables, que les principaux parcours sont vérifiés et qu’un rapport liste les compromis et prochaines étapes. Ne conclus pas simplement après avoir créé une maquette.
