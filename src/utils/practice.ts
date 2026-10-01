import {
  fracToDecimal,
  parseFrac,
  solveFractionOp,
  solveLinearEquation,
  solvePythagoras,
  solvePercentage,
  solvePowers,
  solveRadicalSimplify,
  solveAffineImage,
  solveInscribedAngle,
  solveVectorNorm,
  solveScaleReduction,
  solveGroupedStatistics,
  solveThales,
  type Step,
} from './mathEngine';
import type { Lang } from './i18n';

export type PracticeLevel = 'easy' | 'medium' | 'bepc';
export type AnswerKind = 'number' | 'fraction' | 'text';

export interface PracticeExercise {
  id: string;
  chapterId: string;
  title: { fr: string; mg: string };
  question: { fr: string; mg: string };
  expected: string;
  expectedNumber?: number;
  answerKind: AnswerKind;
  tolerance?: number;
  hints: { fr: string; mg: string }[];
  steps: Step[];
  resultLabel: string;
}

const supportedChapters = ['fractions', 'radicals', 'powers', 'equations', 'functions', 'geometry', 'circle', 'vectors', 'space', 'stats', 'development', 'factorization'] as const;
export type PracticeChapter = typeof supportedChapters[number];
export const PRACTICE_CHAPTERS: PracticeChapter[] = [...supportedChapters];

function pick<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}
function int(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function limits(level: PracticeLevel): { max: number; exp: number } {
  if (level === 'easy') return { max: 9, exp: 3 };
  if (level === 'medium') return { max: 15, exp: 4 };
  return { max: 25, exp: 5 };
}

function fractionExercise(level: PracticeLevel): PracticeExercise {
  const { max } = limits(level);
  const b = int(2, Math.min(max, 12));
  const d = int(2, Math.min(max, 12));
  const a = int(1, b - 1);
  const c = int(1, d - 1);
  const op = pick(['+', '-', '×'] as const);
  const solved = solveFractionOp(`${a}/${b}`, `${c}/${d}`, op);
  const expected = solved.result;
  const expectedNumber = fracToDecimal(parseFrac(expected));
  return {
    id: uid('fractions'), chapterId: 'fractions',
    title: { fr: 'Fractions', mg: 'Fraction' },
    question: { fr: `Calcule et simplifie : ${a}/${b} ${op} ${c}/${d}`, mg: `Kajio ary ahena amin’ny endrika tsotra : ${a}/${b} ${op} ${c}/${d}` },
    expected, expectedNumber, answerKind: 'fraction', tolerance: 1e-9,
    hints: [
      { fr: 'Cherche d’abord un dénominateur commun si tu additionnes ou soustrais.', mg: 'Mitadiava dénominateur commun aloha raha manampy na manala.' },
      { fr: 'À la fin, divise le numérateur et le dénominateur par leur PGCD.', mg: 'Farany, zarao amin’ny PGCD ny numérateur sy dénominateur.' },
    ],
    steps: solved.steps, resultLabel: solved.result,
  };
}

function equationExercise(level: PracticeLevel): PracticeExercise {
  const { max } = limits(level);
  const x = level === 'bepc' ? int(2,12) : int(-5,8);
  const a = level === 'bepc' ? int(2,Math.min(max,9)) : pick([-1,1])*int(2,Math.min(max,9));
  const b = level === 'bepc' ? int(1,max) : int(-max,max);
  const c = a * x + b;
  const solved = solveLinearEquation(a, b, 0, c);
  return {
    id: uid('equations'), chapterId: 'equations',
    title: { fr: 'Équation', mg: 'Équation' },
    question: level==='bepc' ? {fr:`Un service coûte ${b} Ar de frais fixes puis ${a} Ar par unité. La facture est ${c} Ar. Combien d’unités ont été utilisées ?`,mg:`Service iray dia misy sarany raikitra ${b} Ar ary ${a} Ar isaky ny unité. ${c} Ar ny totaliny. Firy ny unité nampiasaina?`} : { fr: `Résous : ${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)} = ${c}`, mg: `Vahao : ${a}x ${b >= 0 ? '+' : '-'} ${Math.abs(b)} = ${c}` },
    expected: `${x}`, expectedNumber: x, answerKind: 'number', tolerance: 1e-9,
    hints: [
      { fr: 'Commence par isoler le terme qui contient x.', mg: 'Atomboy amin’ny fanasarahana ilay terme misy x.' },
      { fr: 'Fais la même opération dans les deux membres.', mg: 'Ataovy amin’ny lafiny roa ilay opération iray ihany.' },
    ],
    steps: solved.steps, resultLabel: `x = ${x}`,
  };
}

function pythagorasExercise(level: PracticeLevel): PracticeExercise {
  const triples = level === 'easy' ? [[3,4,5],[6,8,10]] : level === 'medium' ? [[5,12,13],[8,15,17],[9,12,15]] : [[7,24,25],[10,24,26],[12,35,37]];
  const [a,b,c] = pick(triples);
  const solved = solvePythagoras(a,b,true);
  return {
    id: uid('geometry'), chapterId: 'geometry',
    title: { fr: 'Pythagore', mg: 'Pythagore' },
    question: { fr: `Un triangle rectangle a pour côtés de l’angle droit ${a} cm et ${b} cm. Calcule l’hypoténuse.`, mg: `Triangle rectangle iray dia manana lafiny roa ${a} cm sy ${b} cm. Kajio ny hypoténuse.` },
    expected: `${c}`, expectedNumber: c, answerKind: 'number', tolerance: 0.02,
    hints: [
      { fr: 'Utilise c² = a² + b².', mg: 'Ampiasao ny c² = a² + b².' },
      { fr: 'Après avoir calculé c², prends la racine carrée.', mg: 'Rehefa vita c² dia alao ny racine carrée.' },
    ],
    steps: solved.steps, resultLabel: `${c} cm`,
  };
}

function percentExercise(level: PracticeLevel): PracticeExercise {
  const percents = level === 'easy' ? [10,20,25,50] : level === 'medium' ? [5,12,15,30,40] : [7.5,12.5,17.5,35];
  const p = pick(percents);
  const base = level === 'bepc' ? int(8, 40) * 20 : int(4, 30) * 10;
  const expected = base * p / 100;
  const solved = solvePercentage('of', base, p);
  return {
    id: uid('stats'), chapterId: 'stats',
    title: { fr: 'Pourcentage', mg: 'Pourcentage' },
    question: { fr: `Calcule ${p}% de ${base}.`, mg: `Kajio ny ${p}% amin’ny ${base}.` },
    expected: `${expected}`, expectedNumber: expected, answerKind: 'number', tolerance: 0.01,
    hints: [
      { fr: 'Transforme le pourcentage en fraction sur 100.', mg: 'Ovay ho fraction /100 ny pourcentage.' },
      { fr: `Calcule ${base} × ${p}/100.`, mg: `Kajio ${base} × ${p}/100.` },
    ],
    steps: solved.steps, resultLabel: `${expected}`,
  };
}

function powersExercise(level: PracticeLevel): PracticeExercise {
  const { exp } = limits(level);
  const base = int(2, level === 'bepc' ? 8 : 6);
  const e = int(2, exp);
  const expected = base ** e;
  const solved = solvePowers(base,e);
  return {
    id: uid('powers'), chapterId: 'powers',
    title: { fr: 'Puissances', mg: 'Puissance' },
    question: { fr: `Calcule ${base}^${e}.`, mg: `Kajio ${base}^${e}.` },
    expected: `${expected}`, expectedNumber: expected, answerKind: 'number', tolerance: 1e-9,
    hints: [
      { fr: `Écris ${base} multiplié par lui-même ${e} fois.`, mg: `Soraty ${base} ampitomboina amin’ny tenany ${e} fois.` },
    ],
    steps: solved.steps, resultLabel: `${expected}`,
  };
}

function radicalExercise(level: PracticeLevel): PracticeExercise {
  const k = int(2, level === 'bepc' ? 8 : 6);
  const m = pick(level === 'easy' ? [1,2,3] : [2,3,5,7]);
  const n = k*k*m;
  const expected = m === 1 ? `${k}` : `${k}√${m}`;
  const solved = solveRadicalSimplify(n);
  return {
    id: uid('radicals'), chapterId: 'radicals',
    title: { fr: 'Racine carrée', mg: 'Racine carrée' },
    question: { fr: `Simplifie √${n}.`, mg: `Ataovy tsotra √${n}.` },
    expected, answerKind: 'text',
    hints: [
      { fr: `Cherche le plus grand carré parfait qui divise ${n}.`, mg: `Mitadiava carré parfait lehibe indrindra mizara an’i ${n}.` },
      { fr: 'Utilise √(a²×b) = a√b.', mg: 'Ampiasao ny √(a²×b) = a√b.' },
    ],
    steps: solved.steps, resultLabel: solved.result,
  };
}

function developmentExercise(level: PracticeLevel): PracticeExercise {
  const max = level === 'bepc' ? 9 : 6;
  const a = int(1,max), b = int(1,max);
  const expected = `x² + ${a+b}x + ${a*b}`;
  const steps: Step[] = [
    { text: `(x + ${a})(x + ${b})` },
    { text: `= x² + ${b}x + ${a}x + ${a*b}` },
    { text: `= x² + ${a+b}x + ${a*b}`, type: 'result', highlight: true },
  ];
  return {
    id: uid('development'), chapterId:'development',
    title:{fr:'Développement',mg:'Développement'},
    question:{fr:`Développe et réduis : (x + ${a})(x + ${b})`,mg:`Développer-o ary ahena : (x + ${a})(x + ${b})`},
    expected, answerKind:'text',
    hints:[
      {fr:'Multiplie chaque terme de la première parenthèse par chaque terme de la seconde.',mg:'Ampitomboy amin’ny terme tsirairay ao amin’ny parenthèse faharoa ny terme ao amin’ny voalohany.'},
      {fr:'Regroupe ensuite les termes en x.',mg:'Avy eo atambaro ireo terme misy x.'},
    ], steps, resultLabel:expected,
  };
}

function factorizationExercise(level: PracticeLevel): PracticeExercise {
  const max = level === 'bepc' ? 9 : 6;
  const p = int(1,max), q = int(1,max);
  const sum=p+q, prod=p*q;
  const expected=`(x + ${p})(x + ${q})`;
  const steps:Step[]=[
    {text:`On cherche deux nombres dont la somme vaut ${sum} et le produit ${prod}.`,type:'info'},
    {text:`${p} + ${q} = ${sum} et ${p} × ${q} = ${prod}`},
    {text:`x² + ${sum}x + ${prod} = (x + ${p})(x + ${q})`,type:'result',highlight:true},
  ];
  return {
    id:uid('factorization'),chapterId:'factorization',title:{fr:'Factorisation',mg:'Factorisation'},
    question:{fr:`Factorise : x² + ${sum}x + ${prod}`,mg:`Factoriser-o : x² + ${sum}x + ${prod}`},
    expected,answerKind:'text',hints:[
      {fr:`Cherche deux nombres dont le produit vaut ${prod}.`,mg:`Mitadiava isa roa izay ny produit-ny dia ${prod}.`},
      {fr:`Leur somme doit valoir ${sum}.`,mg:`Ny somme-ny dia tokony ho ${sum}.`},
    ],steps,resultLabel:expected,
  };
}


function affineExercise(level: PracticeLevel): PracticeExercise {
  const {max}=limits(level); const a=level==='bepc'?int(1,Math.min(max,6)):pick([-1,1])*int(1,Math.min(max,6)); const b=level==='bepc'?int(2,max):int(-max,max); const x=level==='bepc'?int(2,12):int(-6,8); const expected=a*x+b; const solved=solveAffineImage(a,b,x);
  return {id:uid('functions'),chapterId:'functions',title:{fr:'Application affine',mg:'Application affine'},question:level==='bepc'?{fr:`Un transport coûte ${b} centaines d’ariary au départ puis ${a} centaines d’ariary par kilomètre. Modèle : f(x)=${a}x+${b}. Calcule le coût pour ${x} km.`,mg:`Ny saran-dalana dia ${b} zato Ar amin’ny départ ary ${a} zato Ar isaky ny km. Modely : f(x)=${a}x+${b}. Kajio ho an’ny ${x} km.`}:{fr:`Soit f(x) = ${a}x ${b>=0?'+':'-'} ${Math.abs(b)}. Calcule f(${x}).`,mg:`Aoka f(x) = ${a}x ${b>=0?'+':'-'} ${Math.abs(b)}. Kajio f(${x}).`},expected:`${expected}`,expectedNumber:expected,answerKind:'number',hints:[{fr:'Remplace x par la valeur donnée.',mg:'Soloina amin’ilay sanda nomena ny x.'},{fr:'Effectue d’abord la multiplication, puis l’addition ou la soustraction.',mg:'Ataovy aloha ny multiplication, avy eo addition na soustraction.'}],steps:solved.steps,resultLabel:`${expected}`};
}

function circleExercise(level: PracticeLevel): PracticeExercise {
  const center=2*int(level==='easy'?20:15,level==='bepc'?80:60); const expected=center/2; const solved=solveInscribedAngle('centerToInscribed',center);
  return {id:uid('circle'),chapterId:'circle',title:{fr:'Angles inscrits',mg:'Angle inscrit'},question:{fr:`Un angle au centre mesure ${center}°. Quelle est la mesure de l’angle inscrit associé ?`,mg:`Ny angle au centre dia ${center}°. Firy ny angle inscrit mifandraika aminy?`},expected:`${expected}`,expectedNumber:expected,answerKind:'number',tolerance:1e-9,hints:[{fr:'L’angle inscrit associé intercepte le même arc.',mg:'Arc iray ihany no tapahin’ny angle inscrit sy angle au centre.'},{fr:'Il mesure la moitié de l’angle au centre.',mg:'Antsasaky ny angle au centre ny angle inscrit.'}],steps:solved.steps,resultLabel:`${expected}°`};
}

function vectorExercise(level: PracticeLevel): PracticeExercise {
  const x=int(1,level==='bepc'?9:6), y=int(1,level==='bepc'?9:6); const expected=Math.sqrt(x*x+y*y); const solved=solveVectorNorm(x,y);
  return {id:uid('vectors'),chapterId:'vectors',title:{fr:'Vecteurs',mg:'Vecteur'},question:{fr:`Le vecteur u a pour coordonnées (${x} ; ${y}). Calcule ||u||.`,mg:`Ny vecteur u dia manana coordonnée (${x} ; ${y}). Kajio ||u||.`},expected:`${expected}`,expectedNumber:expected,answerKind:'number',tolerance:.02,hints:[{fr:'Utilise ||u|| = √(x²+y²).',mg:'Ampiasao ||u|| = √(x²+y²).'}],steps:solved.steps,resultLabel:solved.result};
}

function spaceExercise(level: PracticeLevel): PracticeExercise {
  const k=pick(level==='easy'?[.5,.2]:level==='medium'?[.5,.4,.25]:[.8,.6,.5,.25]); const original=int(5,20)*10; const expected=original*k*k*k; const solved=solveScaleReduction(k,original,'volume');
  return {id:uid('space'),chapterId:'space',title:{fr:'Réduction dans l’espace',mg:'Réduction amin’ny espace'},question:{fr:`Un solide de volume ${original} cm³ est réduit avec un rapport k=${k}. Quel est le nouveau volume ?`,mg:`Solide iray manana volume ${original} cm³ dia ahena amin’ny rapport k=${k}. Firy ny volume vaovao?`},expected:`${expected}`,expectedNumber:expected,answerKind:'number',tolerance:.01,hints:[{fr:'Les volumes sont multipliés par k³.',mg:'Ny volume dia ampitomboina amin’ny k³.'}],steps:solved.steps,resultLabel:`${expected} cm³`};
}

function groupedStatsExercise(level: PracticeLevel): PracticeExercise {
  const bounds=[0,5,10,15,20]; const freqs=level==='easy'?[2,4,2,2]:level==='medium'?[3,5,4,2]:[17,11,12,10]; const solved=solveGroupedStatistics(bounds,freqs); const expected=solved.mean;
  return {id:uid('stats'),chapterId:'stats',title:{fr:'Statistiques par classes',mg:'Statistique amin’ny classes'},question:{fr:`Classes [0;5[, [5;10[, [10;15[, [15;20[ ; effectifs ${freqs.join(', ')}. Calcule la moyenne approchée.`,mg:`Classes [0;5[, [5;10[, [10;15[, [15;20[ ; effectif ${freqs.join(', ')}. Kajio ny moyenne approchée.`},expected:`${expected}`,expectedNumber:expected,answerKind:'number',tolerance:.02,hints:[{fr:'Utilise le centre de chaque classe : 2,5 ; 7,5 ; 12,5 ; 17,5.',mg:'Ampiasao ny centre de classe : 2,5 ; 7,5 ; 12,5 ; 17,5.'},{fr:'Fais Σ(centre×effectif) puis divise par N.',mg:'Ataovy Σ(centre×effectif) ary zarao amin’ny N.'}],steps:solved.steps,resultLabel:`≈ ${expected.toFixed(2)}`};
}

function thalesExercise(level: PracticeLevel): PracticeExercise {
  const a=level==='bepc'?int(2,8):int(2,6); const b=a+int(1,5); const c=int(2,9); const expected=b*c/a; const solved=solveThales(a,b,c);
  return {id:uid('geometry'),chapterId:'geometry',title:{fr:'Thalès',mg:'Thalès'},question:{fr:`Dans une configuration de Thalès avec droites parallèles, on a ${a}/${b} = ${c}/x. Calcule x.`,mg:`Amin’ny configuration de Thalès misy droites parallèles : ${a}/${b} = ${c}/x. Kajio x.`},expected:`${expected}`,expectedNumber:expected,answerKind:'number',tolerance:.02,hints:[{fr:'Écris l’égalité des rapports correspondants.',mg:'Soraty ny égalité des rapports mifanaraka.'},{fr:'Utilise le produit en croix.',mg:'Ampiasao ny produit en croix.'}],steps:solved.steps,resultLabel:solved.result};
}

export function generatePractice(level: PracticeLevel, chapter?: string): PracticeExercise {
  const chosen = (chapter && PRACTICE_CHAPTERS.includes(chapter as PracticeChapter))
    ? chapter as PracticeChapter
    : pick(PRACTICE_CHAPTERS);
  switch (chosen) {
    case 'fractions': return fractionExercise(level);
    case 'radicals': return radicalExercise(level);
    case 'powers': return powersExercise(level);
    case 'equations': return equationExercise(level);
    case 'functions': return affineExercise(level);
    case 'geometry': return level==='bepc'&&Math.random()>.45?thalesExercise(level):pythagorasExercise(level);
    case 'circle': return circleExercise(level);
    case 'vectors': return vectorExercise(level);
    case 'space': return spaceExercise(level);
    case 'stats': return level==='bepc'?groupedStatsExercise(level):percentExercise(level);
    case 'development': return developmentExercise(level);
    case 'factorization': return factorizationExercise(level);
  }
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g,'')
    .replace(/·|×/g,'*')
    .replace(/−/g,'-')
    .replace(/\^2/g,'²')
    .replace(/\*/g,'')
    .replace(/\+\-/g,'-');
}

export function checkPracticeAnswer(exercise: PracticeExercise, answer: string): boolean {
  const raw = answer.trim();
  if (!raw) return false;
  if (exercise.expectedNumber !== undefined) {
    let parsed: number;
    try {
      parsed = fracToDecimal(parseFrac(raw.replace(/cm|%/gi,'').trim()));
    } catch {
      parsed = Number(raw.replace(',','.').replace(/cm|%/gi,'').trim());
    }
    return Number.isFinite(parsed) && Math.abs(parsed - exercise.expectedNumber) <= (exercise.tolerance ?? 1e-8);
  }
  const actual = normalizeText(raw);
  const expected = normalizeText(exercise.expected);
  if (actual === expected) return true;
  // For factorised products, accept the reversed order of the two factors.
  const factors = exercise.expected.match(/^\((.+)\)\((.+)\)$/);
  if (factors) return actual === normalizeText(`(${factors[2]})(${factors[1]})`);
  return false;
}

export function labelForLevel(level: PracticeLevel, lang: Lang): string {
  const labels = {
    easy: {fr:'Facile',mg:'Mora'},
    medium:{fr:'Moyen',mg:'Antonony'},
    bepc:{fr:'Niveau BEPC',mg:'Ambaratonga BEPC'},
  };
  return labels[level][lang];
}
