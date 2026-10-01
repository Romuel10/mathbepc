import {
  solveComplexFractionExpr,
  solveLinearEquation,
  solveQuadraticEquation,
  solvePercentage,
  type Step,
} from './mathEngine.ts';
import type { Lang } from './i18n.ts';

export interface SmartAnalysis {
  chapterId: string;
  confidence: number;
  title: string;
  reason: string;
  steps?: Step[];
  result?: string;
  graph?: { a: number; b: number; c: number; label: string };
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/,/g,'.').replace(/−/g,'-').replace(/×/g,'*').replace(/÷/g,'/').replace(/\s+/g,'');
}

function parseCoefficient(raw: string): number {
  if (raw === '' || raw === '+') return 1;
  if (raw === '-') return -1;
  return Number(raw);
}

function parseLinearSide(side: string): { a: number; b: number } | null {
  const s = side.replace(/\s+/g,'').replace(/−/g,'-').replace(/,/g,'.');
  if (!s) return null;
  const terms = s.replace(/-/g,'+-').split('+').filter(Boolean);
  let a=0,b=0;
  for (const term of terms) {
    if (term.includes('x')) {
      if (!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)?x$/.test(term)) return null;
      a += parseCoefficient(term.slice(0,-1));
    } else {
      if (!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(term)) return null;
      b += Number(term);
    }
  }
  return {a,b};
}

function parsePolynomialSide(side: string): { a:number;b:number;c:number } | null {
  const s=side.replace(/\s+/g,'').replace(/−/g,'-').replace(/,/g,'.').replace(/x\^2/g,'x²');
  if (!s) return null;
  const terms=s.replace(/-/g,'+-').split('+').filter(Boolean);
  let a=0,b=0,c=0;
  for(const term of terms){
    if(term.includes('x²')){
      if(!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)?x²$/.test(term)) return null;
      a+=parseCoefficient(term.slice(0,-2));
    }else if(term.includes('x')){
      if(!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)?x$/.test(term)) return null;
      b+=parseCoefficient(term.slice(0,-1));
    }else{
      if(!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(term)) return null;
      c+=Number(term);
    }
  }
  return {a,b,c};
}

export function analyseExercise(input: string, lang: Lang): SmartAnalysis | null {
  const original=input.trim();
  if(!original) return null;
  const compact=normalize(original);
  const mg=lang==='mg';

  const percent=compact.match(/(\d+(?:\.\d+)?)%(?:de|amin'ny|amin’ny)?(\d+(?:\.\d+)?)/i);
  if(percent){
    const p=Number(percent[1]), value=Number(percent[2]);
    const solved=solvePercentage('of',value,p);
    return {chapterId:'stats',confidence:.98,title:mg?'Pourcentage':'Pourcentage',reason:mg?'Nahitana marika % sy sanda iray.':'Le symbole % et une valeur ont été reconnus.',steps:solved.steps,result:solved.result};
  }

  if(compact.includes('=' ) && compact.includes('x')){
    const [leftRaw,rightRaw,...rest]=original.split('=');
    if(!rest.length && leftRaw!==undefined && rightRaw!==undefined){
      const lp=parsePolynomialSide(leftRaw), rp=parsePolynomialSide(rightRaw);
      if(lp&&rp){
        const a=lp.a-rp.a,b=lp.b-rp.b,c=lp.c-rp.c;
        if(Math.abs(a)>1e-12){
          const solved=solveQuadraticEquation(a,b,c);
          return {chapterId:'equations',confidence:.99,title:mg?'Équation degré 2':'Équation du second degré',reason:mg?'Nahitana x² sy famantarana =.':'La présence de x² et du signe = indique une équation du second degré.',steps:solved.steps,result:solved.result,graph:{a,b,c,label:`y=${a}x²${b>=0?'+':''}${b}x${c>=0?'+':''}${c}`}};
        }
      }
      const l=parseLinearSide(leftRaw), r=parseLinearSide(rightRaw);
      if(l&&r){
        const solved=solveLinearEquation(l.a,l.b,r.a,r.b);
        return {chapterId:'equations',confidence:.99,title:mg?'Équation degré 1':'Équation du premier degré',reason:mg?'Nahitana x sy famantarana =.':'La présence de x et du signe = indique une équation.',steps:solved.steps,result:solved.result,graph:{a:0,b:l.a-r.a,c:l.b-r.b,label:`y=${l.a-r.a}x${l.b-r.b>=0?'+':''}${l.b-r.b}`}};
      }
    }
  }

  const keywords:[RegExp,string,string,string][]=[
    [/pythag|hypot|triangle.?rect/i,'geometry','Géométrie plane','Pythagore / triangle rectangle'],
    [/thal[eè]s|parall[eè]l/i,'geometry','Géométrie plane','Thalès / parallèles'],
    [/sin|cos|tan|trig/i,'geometry','Géométrie plane','Trigonométrie'],
    [/vecteur|coordonn|milieu|norme/i,'vectors','Vecteurs & coordonnées','Vecteurs / coordonnées'],
    [/volume|cylindre|c[oô]ne|sph[eè]re|pyramide|cube/i,'space','Géométrie dans l’espace','Solides / volumes'],
    [/moyenne|m[eé]diane|quartile|stat|effectif/i,'stats','Statistiques & proportionnalité','Statistiques'],
    [/factor/i,'factorization','Factorisation','Factorisation'],
    [/d[eé]velopp|identit[eé].?remarqu/i,'development','Développement','Développement'],
    [/valeur.?absolue|\|x/i,'absolute','Valeur absolue','Valeur absolue'],
    [/racine|√/i,'radicals','Racines carrées','Racines carrées'],
    [/puissance|exposant|\^\d/i,'powers','Puissances','Puissances'],
    [/fraction|pgcd|ppcm/i,'fractions','Fractions & rationnels','Fractions / divisibilité'],
  ];
  for(const [regex,id,title,reason] of keywords){
    if(regex.test(original)) return {chapterId:id,confidence:.9,title,reason:mg?`Hita ao amin’ny fanontaniana ny famantarana mifandraika amin’ny ${reason}.`:`Des mots ou symboles liés à « ${reason} » ont été repérés.`};
  }

  if(!/[a-zA-Z]/.test(original)){
    try{
      const solved=solveComplexFractionExpr(original);
      return {chapterId:'fractions',confidence:.85,title:mg?'Kajy isa':'Calcul numérique',reason:mg?'Expression numérique no hita.':'Une expression numérique a été reconnue.',steps:solved.steps,result:solved.result};
    }catch{/* recommendations continue */}
  }

  return {chapterId:'equations',confidence:.35,title:mg?'Mila safidy toko':'Chapitre à confirmer',reason:mg?'Tsy ampy ny famantarana hahafantarana tsara ny toko. Safidio ny toko akaiky indrindra.':'Je ne peux pas identifier ce type d’exercice avec assez de certitude. Le chapitre proposé est seulement une suggestion.'};
}
