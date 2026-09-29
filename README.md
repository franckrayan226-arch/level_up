# LEVEL UP

## Présentation

Boutique en ligne de vêtements streetwear basée à Ouagadougou (Burkina Faso). Le site réunit une vitrine complète et un tunnel de commande fonctionnel avec confirmation manuelle du paiement : catalogue, fiches produits avec variantes, panier, commande avec géolocalisation, preuve de paiement mobile money et finalisation par WhatsApp.

Le projet comprend aussi un back-office pour gérer les produits et les stocks, ainsi qu'un suivi des visiteurs (pages consultées, produits les plus vus, durées de session).

Environ 6 300 lignes de code, 7 pages côté client, 19 routes d'API et un tableau de bord d'administration développé en JavaScript natif.

## Objectif

Vendre en ligne au Burkina Faso sans dépendre d'une marketplace ni d'une passerelle de paiement classique.

Le problème concret : les solutions e-commerce standard supposent une carte bancaire et une passerelle de paiement, ce qui n'est pas la réalité locale. Ici, le paiement se fait en mobile money (Orange Money, Moov Money, Wave), le client envoie une capture de sa transaction, et la commande est finalisée sur WhatsApp avec le vendeur.

L'objectif est donc triple :

- proposer une expérience d'achat mobile-first et rapide ;
- maintenir la disponibilité du stock côté serveur (éviter de vendre un article qui n'existe plus) ;
- garder un tunnel simple à administrer sans compétences techniques.

## Fonctionnalités

Côté client :

- Catalogue produits avec recherche et catégories
- Fiche produit avec choix de la taille, de la couleur et affichage du stock disponible
- Panier latéral avec validation de la combinaison taille/couleur par rapport au stock
- Commande avec position GPS et adresse autocomplete (géocodage inverse)
- Plusieurs moyens de paiement : codes USSD Orange Money et Moov Money, numéro Wave
- Envoi de la preuve de paiement (image) directement depuis le formulaire
- Ouverture de WhatsApp avec le message de commande pré-rempli
- Décrément automatique du stock au moment de la commande
- Pages légales (conditions, confidentialité), responsive mobile, navigation basse sur petit écran
- Suivi d'analytics : pages visitées, produits consultés, durée de visite

Côté administration :

- Dashboard avec statistiques globales
- Gestion des produits : création, modification, suppression, activation/désactivation
- Upload des images vers Cloudinary (produits et couleurs)
- Sauvegarde et restauration de la base de données en JSON
- Section analytics avec courbes de fréquentation et produits les plus vus

## Technologies

- React 18, TypeScript, Vite, React Router
- Tailwind CSS 4, lucide-react (icônes)
- Node.js, Express, MongoDB, Multer (uploads)
- Cloudinary (stockage des images)
- Déploiement Render, configuration Vercel

## Architecture

```
Navigateur (React + Vite)
        │
        ├──  /api/*          → Express (server.js)
        │        ├── MongoDB        produits, commandes, analytics
        │        └── Cloudinary     images produits / preuves de paiement
        │
        ├──  /admin          → dashboard HTML/JS statique
        │
        └──  /*              → build React (dist/)

Commande :
  Panier → Checkout (GPS + paiement USSD)
        → Upload de la preuve
        → WhatsApp (message pré-rempli)
        → Décrément du stock côté serveur
```

## Mon rôle

Développement complet du projet, seul :

- Cahier des charges et conception du tunnel de commande adapté au mobile money burkinabè
- Design et intégration front : maquette, responsive, composants React, animations
- Création de l'API Express et du modèle de données MongoDB
- Gestion des variantes produits, de la logique de stock et des commandes
- Intégration Cloudinary pour les images et les preuves de paiement
- Back-office d'administration (gestion produits, statistiques, sauvegarde)
- Système d'analytics côté client et section correspondante dans le dashboard
- Déploiement sur Render et mise en place du référencement (sitemap, balises sociales)

## Démonstration

- Site : https://level-up-1-dlqa.onrender.com

## Limites / améliorations

Ce qui reste à consolider :

- **Pas de compte client** : pas d'inscription ni de connexion, le panier vit en mémoire et disparaît au rechargement de la page. Le suivi de commande passe entièrement par WhatsApp.
- **Paiement non automatisé** : la preuve de transaction est envoyée manuellement et la confirmation est humaine. Une intégration directe de passerelle (GeniusPay, CinetPay) supprimerait cette étape.
- **Sécurisation du back-office** : l'administration repose sur un mot de passe unique, sans session ni rôles. La prochaine étape est une vraie authentification par session ou JWT, avec des routes protégées par rôle.
- **Qualité d'ingénierie** : aucun test automatisé, aucun linter, TypeScript pas en mode strict, gestion des erreurs souvent résumée à des `alert()`.
- **Fonctionnalités inachevées** : la newsletter et la page profil sont visibles mais non branchées à un backend.
- **Dette technique dans le dépôt** : plusieurs itérations de serveur et deux builds sont versionnés. Un nettoyage et un `.gitignore` corrigé suffiraient à clarifier l'arborescence.
