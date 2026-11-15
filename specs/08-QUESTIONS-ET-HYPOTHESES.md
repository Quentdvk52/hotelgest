# HotelGest — Réponses et hypothèses

## 1. Réponses du propriétaire

- Nom : HotelGest.
- Marché : ambition panafricaine; premier contexte : Bénin.
- Clientèle : promoteurs hôteliers; le propriétaire souhaite couvrir tous types d’établissement.
- Pilote : Hôtel Le Vignoble, sites à Bohicon, Abomey, Abomey-Calavi et Zogbodomey; chambres, restaurant/bar par site, cave à vin, voitures et salles diverses.
- Langue de travail initiale : français; souhait de voir le site dans sa langue et devise.
- Le promoteur choisit le pays du compte; règles locales doivent être proposées automatiquement.
- Réservation web et commande client par QR chambre/table souhaitées. Personnel de salle peut aussi saisir les commandes; routage repas vers cuisine, boissons vers bar, vin/spiritueux vers cave.
- Architecture responsive; réseau faible important.
- Les actions de réduction doivent demander validation.
- Mutation préalable exigée pour changer durablement un employé de site.
- Accès aux données attribué par le promoteur.
- Moyens de règlement hôtelier : TPE, espèces, virement, Mobile Money; pas d’opérateur de paiement hôtelier connecté au début.
- Pas d’encaissement en ligne de réservation au MVP.
- Comptabilité visée : SYSCOHADA révisé.
- Plans SaaS : 100 000 XOF/mois; 10 % de réduction semestrielle; 30 % annuel; abonnement payé via Chariow.
- Contrats RH à couvrir (stagiaire, CDI, CDD, occasionnel et autres); méthode de pointage choisie par l’administrateur.
- White-label demandé.
- Préférence « Neon » exprimée pour l’authentification; Neon est retenu comme préférence de base de données, tandis qu’un fournisseur d’authentification reste à sélectionner.

## 2. Hypothèses expertes recommandées

1. Livrer un MVP réellement utilisable sur les quatre sites du groupe pilote, puis étendre aux autres opérateurs; « tout type dès le départ » devient une architecture configurable, pas la livraison simultanée de toutes les fonctions.
2. Désactiver l’overbooking au départ; permettre ensuite une option par site avec approbation de direction et procédure de relogement.
3. Faire la clôture comptable et le night audit par site, fuseau local et heure configurable, avec consolidation groupe séparée.
4. Conserver les paiements hôteliers externes comme enregistrements de règlements; ne jamais déduire qu’un transfert ou paiement TPE a réussi d’une simple sélection dans l’application.
5. Export comptable équilibré et paramétrable; validation du plan de comptes/taxes par expert SYSCOHADA béninois avant usage officiel.
6. Pas de paie légale complète en MVP; gérer présence/variables et exporter vers le processus validé localement.
7. Langue/devise détectées sont des suggestions d’affichage. Le pays, la devise comptable et les taxes d’un établissement ne sont jamais changés automatiquement par adresse IP.
8. 3D pour le marketing et certains aperçus, pas partout dans l’outil opérationnel.
9. Web responsive/PWA d’abord; application native ultérieure si les besoins de terminaux le justifient.
10. Authentification : MFA comptes privilégiés, permissions fines et sessions sécurisées; SSO en option si clients le demandent.

## 3. Points encore ouverts, avec valeur provisoire

| Sujet | Recommandation provisoire | Validation requise |
|---|---|---|
| Problèmes/outils actuels | Cartographier sur site; ne pas supposer d’outil déjà en place | Promoteur et équipes |
| Priorités exactes | PMS + restaurant QR + finance/caisse + droits pour pilote | Promoteur |
| Règle de réduction | Seuils et approbateurs configurables, aucun auto-approuveur | Promoteur/directeur |
| Taxes/facture | Paramétrage pays proposé puis validé comptable | Expert local |
| Comptabilité | Exports SYSCOHADA révisé, pas grand livre légal non validé | Comptable |
| Paie | Export variables/présence | RH/comptable |
| OTA/channel manager | Reportés tant que contrats/priorités inconnus | Promoteur |
| Réservation en ligne | Demande/confirmation sans paiement en ligne au MVP | Promoteur |
| Messages | Email en premier; SMS/WhatsApp via fournisseurs ultérieurs | Promoteur |
| Fidélité/avis | P1/P2 après processus principal | Promoteur |
| Appareils | Android téléphone/tablette et navigateur ordinateur comme cible provisoire | Équipes |
| Hébergement/cloud | PostgreSQL géré + runtime Node; région à choisir selon conformité/coût | Responsable technique |
| Capacité 1/3/5 ans | Dimensionner après volumes pilotes; architecture horizontale | Promoteur |
| Disponibilité et sauvegarde | Fixer RPO/RTO et SLA avant lancement commercial | Promoteur/tech |
| Support | Français en heures ouvrées Bénin pour pilote | Promoteur |
| Budget/calendrier | Non fourni; estimer après audit et découpage MVP | Promoteur |
| Référents pilotes | Directeur, réception, cuisine/bar, finance, RH à nommer | Promoteur |
| Marque HotelGest | Identité/guide de marque à créer ou fournir | Promoteur |

