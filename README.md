# MathBEPC Madagascar

MathBEPC est une application de révision et de résolution mathématique destinée en priorité à la classe de 3e et à la préparation du BEPC à Madagascar.

## Objectifs

- expliquer les calculs étape par étape au lieu d'afficher seulement une réponse ;
- couvrir les notions centrales du programme de 3e ;
- fonctionner correctement sur téléphone, ordinateur et APK Android ;
- rester utilisable hors ligne après installation ;
- proposer une interface sobre, rapide et adaptée aux élèves.

## Modules

- Résolveur : calcul numérique, équations et inéquations.
- Calculs : scientifique, fractions, statistiques, Pythagore, Thalès, coordonnées, racines et systèmes.
- Cours : fiches de méthode avec formules et exemples.
- Exercices : entraînement progressif avec indices et corrigés.
- Historique : conservation locale des dernières résolutions.
- Progression : suivi local des exercices terminés.

## Moteur mathématique

Le moteur est local et ne dépend pas d'un serveur distant. Il comprend notamment :

- priorités opératoires, puissances, pourcentages et racines ;
- fonctions sin, cos, tan en degrés ;
- équations du premier degré et outil complémentaire du second degré ;
- inéquations du premier degré ;
- réduction de fractions ;
- moyenne, médiane, mode et étendue ;
- Pythagore, proportion de Thalès et distance dans le plan ;
- systèmes linéaires à deux inconnues.

## Développement

Prérequis : Node.js 22 ou plus récent.

```bash
npm install
npm run dev
```

Vérification complète :

```bash
npm run check
```

## Android

Le workflow GitHub Actions `Construire APK Android MathBEPC` compile automatiquement un APK Android et le publie comme artefact GitHub.

## Version

Version actuelle : **2.0.0 — reconstruction complète**.
