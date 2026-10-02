export type Lang = 'fr' | 'mg';

export const UI_TEXT = {
  fr: {
    appSubtitle: 'Mathématiques de 3e • Madagascar',
    chapters: 'Chapitres',
    homeTitle: 'Les maths de 3e, expliquées clairement.',
    homeLead: 'Résous un exercice, entraîne-toi et révise le programme du BEPC à ton rythme.',
    solve: 'Résoudre un exercice',
    solveDesc: 'Écris ton calcul ou ton équation et suis une méthode claire, étape par étape.',
    practice: 'S’entraîner',
    practiceDesc: 'Des exercices progressifs avec vérification, indice et correction détaillée.',
    revise: 'Réviser',
    reviseDesc: 'Formules, méthodes et erreurs fréquentes, chapitre par chapitre.',
    exam: 'Mode examen',
    annales: 'Annales BEPC',
    progress: 'Mes progrès',
    explore: 'Tous les chapitres',
    install: 'Installer',
    offline: 'Hors ligne',
    backHome: 'Accueil',
    changeChapter: 'Changer de chapitre',
    chooseChapter: 'Choisis un chapitre',
    searchChapter: 'Rechercher un chapitre ou une notion…',
    noResult: 'Aucun chapitre ne correspond à cette recherche.',
    prev: 'Précédent',
    next: 'Suivant',
    language: 'MG',
    languageTitle: 'Passer en malagasy',
  },
  mg: {
    appSubtitle: 'Matematika kilasy faha-3 • Madagasikara',
    chapters: 'Toko',
    homeTitle: 'Matematika kilasy faha-3, hazavaina mazava.',
    homeLead: 'Mamaha fanazarana, manao entraînement ary mamerina ny programme BEPC amin’ny hafainganam-pandehanao.',
    solve: 'Hamaha fanazarana',
    solveDesc: 'Soraty ny kajy na équation dia araho tsikelikely ny fomba famahana azy.',
    practice: 'Hanao fanazarana',
    practiceDesc: 'Fanazarana miakatra tsikelikely miaraka amin’ny fanamarinana, torohevitra ary correction.',
    revise: 'Hamerina lesona',
    reviseDesc: 'Formule, fomba fanao ary fahadisoana mahazatra isaky ny toko.',
    exam: 'Fanadinana andrana',
    annales: 'Sujet BEPC taloha',
    progress: 'Fandrosoako',
    explore: 'Toko rehetra',
    install: 'Hametraka',
    offline: 'Tsy misy internet',
    backHome: 'Fandraisana',
    changeChapter: 'Hanova toko',
    chooseChapter: 'Safidio ny toko',
    searchChapter: 'Mitady toko na hevitra…',
    noResult: 'Tsy misy toko mifanaraka amin’io fikarohana io.',
    prev: 'Teo aloha',
    next: 'Manaraka',
    language: 'FR',
    languageTitle: 'Passer en français',
  },
} as const;

export function ui(lang:Lang){return UI_TEXT[lang];}
export function getStoredLanguage():Lang{
  if(typeof window==='undefined')return 'fr';
  return localStorage.getItem('mathbepc-lang')==='mg'?'mg':'fr';
}
export function setStoredLanguage(lang:Lang):void{
  if(typeof window==='undefined')return;
  localStorage.setItem('mathbepc-lang',lang);
  window.dispatchEvent(new CustomEvent('mathbepc-language',{detail:lang}));
}
