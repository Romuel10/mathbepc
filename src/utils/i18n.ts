export type Lang = 'fr' | 'mg';

export const UI_TEXT = {
  fr: {
    appSubtitle: 'Maths de 3e • Madagascar',
    chapters: 'Chapitres',
    homeTitle: 'Révise, comprends et réussis ton BEPC.',
    homeLead: 'Choisis ce que tu veux faire. MathBEPC t’accompagne étape par étape, même hors connexion.',
    solve: 'Résoudre un exercice',
    solveDesc: 'Écris ton exercice comme dans ton cahier. L’application reconnaît le chapitre et t’aide à le résoudre.',
    practice: 'S’entraîner',
    practiceDesc: 'Exercices faciles, moyens ou niveau BEPC avec indices progressifs et vérification de ta réponse.',
    revise: 'Réviser un cours',
    reviseDesc: 'Fiches courtes, formules, méthodes et erreurs à éviter pour chaque chapitre.',
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
    homeTitle: 'Mamerina, mahatakatra ary mahomby amin’ny BEPC.',
    homeLead: 'Safidio izay tianao hatao. MathBEPC dia manazava tsikelikely ary afaka ampiasaina tsy misy internet.',
    solve: 'Hamaha fanazarana',
    solveDesc: 'Soraty tahaka ny ao anaty kahie ny fanontaniana. Hahafantatra ny toko mifanaraka aminy ny application ary hanampy anao.',
    practice: 'Hanao fanazarana',
    practiceDesc: 'Fanazarana mora, antonony na ambaratonga BEPC miaraka amin’ny torohevitra sy fanamarinana valiny.',
    revise: 'Hamerina lesona',
    reviseDesc: 'Famintinana fohy, formule, fomba fanao ary fahadisoana tokony hialana isaky ny toko.',
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

export function ui(lang: Lang) {
  return UI_TEXT[lang];
}

export function getStoredLanguage(): Lang {
  if (typeof window === 'undefined') return 'fr';
  return localStorage.getItem('mathbepc-lang') === 'mg' ? 'mg' : 'fr';
}

export function setStoredLanguage(lang: Lang): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('mathbepc-lang', lang);
  window.dispatchEvent(new CustomEvent('mathbepc-language', { detail: lang }));
}
