# HotelGest — Design et UX

## 1. Direction artistique

Marque hôtelière premium, chaleureuse et crédible, qui reste adaptée à une suite multi-marques. L’interface de gestion privilégie la lisibilité et l’action rapide; le site public peut porter davantage l’ambiance du Vignoble. White-label : logo, palette, coordonnées, domaines et contenus configurables par tenant, avec thèmes conformes au contraste.

## 2. Architecture d’expérience

- Site marketing HotelGest et pages publiques d’établissements.
- Parcours voyageur : recherche, détails, demande/réservation, commande QR, état de commande, facture/demandes selon habilitation.
- Back-office : sélecteur de site autorisé, navigation par tâches, tableau du jour et vues filtrées.
- Interfaces par métier : réception, housekeeping, serveuse, cuisine, bar/cave, caisse, direction.
- Sur petit écran : actions essentielles accessibles sans tableau horizontal; vues larges pour calendriers et rapports.

## 3. Design system

Définir tokens couleur, espaces, rayons, ombres, typographie, états, grille et niveaux de densité. Composants : boutons, formulaires, date picker, statut, tableau, calendrier, drawer, modal, toast, permission prompt, QR preview, commande, folio, graphique et état vide/erreur. Couleurs de statut jamais comme seul signal; inclure icône/texte.

## 4. Motion et 3D

- Motion/Framer Motion pour transition de route, confirmation, apparition de panneau et feedback léger.
- CSS transitions pour effets simples; préférer réduire JavaScript.
- R3F/Three.js réservés à visite marketing d’un site, aperçu immersif chambre ou configuration de salle si les assets existent et l’usage est confirmé.
- Pas de 3D sur caisse, check-in, prise de commande en situation de service, menu QR sur réseau faible ou formulaires critiques.
- Chargement différé, poster statique, fallback sans WebGL, pause hors écran et respect de `prefers-reduced-motion`.

## 5. Principes d’accessibilité

Cible WCAG 2.2 AA : contraste, focus visible, commandes clavier, labels, erreurs liées aux champs, lecteurs d’écran, cibles tactiles, textes de statut et réduction des mouvements. Tester avec clavier et au moins un lecteur d’écran.

## 6. Performance

Prioriser le contenu essentiel, images responsives, formats modernes et lazy loading. Budget initial léger sur parcours QR et réception. Aucune animation ne doit retarder une action; prévoir mode économie de données et interface fonctionnelle sur appareil Android modeste.
