# GBEFFA REIS BE KOM - Plateforme de Facturation Pro Forma

## Fonctionnalités Implémentées

### 🏠 Tableau de Bord
- Statistiques en temps réel :
  - Nombre total de factures
  - Montant total des factures
  - Nombre de clients
- Navigation rapide vers toutes les fonctionnalités

### ⚙️ Paramètres de l'Entreprise
- Informations pré-remplies par défaut :
  - Nom : GBEFFA REIS BE KOM
  - Téléphones : 01 96 34 64 35 / 01 94 14 52 69
  - N° CIP : 8382792325
  - Date d'expiration : 10-12-2026
  - IFU : 1201408335401
  - Email : tundetoile@gmail.com
- Modification de toutes les informations
- Téléversement du logo (PNG)
- Ajout d'adresse et site web

### 🧾 Création de Factures Pro Forma
- Numérotation automatique des factures
- Sélection de clients existants ou création de nouveaux
- Informations complètes du client (nom, téléphone, email, adresse)
- Tableau d'articles dynamique :
  - Désignation
  - Quantité
  - Prix unitaire
  - Calcul automatique du montant
  - Ajout/suppression de lignes
- Options de facturation :
  - TVA configurable (18% par défaut)
  - Réduction (montant fixe ou pourcentage)
  - Conditions de paiement
  - Nom du responsable
- Calcul automatique :
  - Sous-total
  - Réduction
  - TVA
  - Total général
  - Montant en lettres (français)

### 📄 Génération PDF
- Format professionnel conforme au modèle fourni
- En-tête avec logo et informations de l'entreprise
- QR Code WhatsApp (https://wa.me/+22996346435)
- Tableau des articles avec couleurs alternées
- Récapitulatif des totaux
- Signature du responsable
- Pied de page avec coordonnées complètes
- Téléchargement direct en PDF

### 📂 Historique des Factures
- Liste complète de toutes les factures
- Recherche par :
  - Numéro de facture
  - Nom du client
  - Téléphone
- Visualisation PDF de chaque facture
- Suppression de factures
- Statistiques de facturation

### 👥 Gestion des Clients
- Liste de tous les clients
- Ajout de nouveaux clients
- Recherche par nom, téléphone ou email
- Suppression de clients
- Utilisation automatique dans les factures

## Technologies Utilisées

- **Frontend** : React + TypeScript + Vite
- **Styling** : Tailwind CSS
- **Base de données** : Supabase (PostgreSQL)
- **Icônes** : Lucide React
- **PDF** : Impression navigateur natif

## Design

- Couleur principale : #195885 (bleu professionnel)
- Interface responsive (mobile et desktop)
- Design moderne et épuré
- Expérience utilisateur intuitive

## Sécurité

- Row Level Security (RLS) activé sur toutes les tables
- Politiques d'accès public configurées
- Validation des données côté client et serveur

## Base de Données

Tables créées :
- `company_settings` : Paramètres de l'entreprise
- `clients` : Base de données clients
- `invoices` : Factures pro forma
- `invoice_items` : Articles des factures

Toutes les données sont persistées dans Supabase avec des relations appropriées et des contraintes d'intégrité.
