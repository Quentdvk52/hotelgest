# HotelGest — Qualité et critères d’acceptation

## 1. Parcours d’acceptation MVP

1. Créer un tenant Hôtel Le Vignoble et quatre sites sans mélange de données.
2. Créer utilisateur, rôle et permission site; vérifier refus hors périmètre et audit.
3. Créer chambres/tarifs et réserver dates; empêcher chevauchement concurrent.
4. Arriver un client, ouvrir folio, ajouter vente, saisir règlement externe, facturer et clôturer.
5. Scannner QR chambre/table, soumettre commande; vérifier routage multi-station et reprise sans doublon.
6. Saisir commande serveuse; cuisine reçoit repas, bar reçoit boissons, cave reçoit vins configurés.
7. Demander remise; employé non autorisé ne peut l’appliquer, approbateur autorisé tranche et l’audit conserve le motif.
8. Clôturer une journée avec écart de caisse; système exige justification et produit totaux vérifiables.
9. Traiter webhook Chariow valide, invalide et rejoué; seul événement valide unique met à jour abonnement.
10. Changer langue/devise suggérée sans changer par erreur devise comptable ou pays fiscal du site.

## 2. Exigences qualité

- Migration reproductible et rollback documenté; pas de migration destructive implicite.
- Tests unitaires des calculs monétaires, disponibilité, autorisation, statut commande et réduction.
- Tests d’intégration multi-tenant et concurrence.
- Build propre, lint/typecheck selon stack et parcours UI clés vérifiés.
- Erreurs lisibles, états chargement/vide/hors ligne, confirmation des actions irréversibles.
- Aucun secret ni donnée réelle de client dans fixtures, captures ou logs.
- Responsive vérifié sur mobile, tablette et bureau; langue française avec contenu réaliste.
- Rapport de sécurité sans vulnérabilité critique connue avant pilote.

## 3. Définition de terminé

Une fonctionnalité est terminée quand son interface, logique serveur, droits, persistance, validations, erreurs, audit, migrations et vérifications nécessaires sont livrés et documentés. Un écran de démonstration sans action réelle doit être étiqueté comme tel.

## 4. Handoff

Fournir README de démarrage, `.env.example` sans secrets, migrations, seed synthétique, comptes de démonstration à changer, intégrations en mode mock clairement indiquées, procédure de déploiement, sauvegarde/restauration, matrice de permissions et liste des validations métier restant à obtenir.
