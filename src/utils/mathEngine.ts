// ============================================================
// MathBEPC Engine v3 — Full-power solver
// Major upgrades: chain fraction ops, deep radical engine,
// polynomial awareness, smart trig, full stats, vector algebra,
// surface areas, complete space geometry
// ============================================================

// ==================== CORE MATH ====================
export interface Frac { n: number; d: number; }
export interface Step { text: string; highlight?: boolean; type?: 'info'|'calc'|'result'|'warning'; }
export interface Radical { coeff: number; radicand: number; }

function integerGcd(a: number, b: number): number {
  a = Math.abs(Math.trunc(a));
  b = Math.abs(Math.trunc(b));
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

function decimalToFrac(value: number): Frac {
  if (!Number.isFinite(value)) throw new Error("Nombre invalide");
  if (Object.is(value, -0)) value = 0;
  if (Number.isInteger(value)) return { n: value, d: 1 };

  // Convert a decimal/scientific notation to an exact base-10 fraction.
  const raw = value.toString().toLowerCase();
  const [mantissa, expPart] = raw.split('e');
  const exp = expPart ? parseInt(expPart, 10) : 0;
  const negative = mantissa.startsWith('-');
  const unsigned = negative ? mantissa.slice(1) : mantissa;
  const [whole, frac = ''] = unsigned.split('.');
  let digits = `${whole}${frac}`.replace(/^0+(?=\d)/, '') || '0';
  let denominator = Math.pow(10, frac.length);
  let numerator = Number(digits);
  if (exp > 0) numerator *= Math.pow(10, exp);
  else if (exp < 0) denominator *= Math.pow(10, -exp);
  if (negative) numerator = -numerator;
  const g = integerGcd(numerator, denominator);
  return { n: numerator / g, d: denominator / g };
}

export function gcd(a: number, b: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b)) throw new Error("Nombre invalide");
  return integerGcd(Math.round(a), Math.round(b));
}
export function lcm(a: number, b: number): number {
  if (!a || !b) return 0;
  return Math.abs(Math.round(a) * Math.round(b)) / gcd(a, b);
}

export function primeFactors(n: number): Map<number, number> {
  const f = new Map<number, number>(); n = Math.abs(Math.round(n));
  if (n <= 1) return f; let d = 2;
  while (d * d <= n) { while (n % d === 0) { f.set(d, (f.get(d)||0)+1); n /= d; } d++; }
  if (n > 1) f.set(n, (f.get(n)||0)+1); return f;
}
export function formatPrimeFactors(n: number): string {
  const f = primeFactors(n); if (!f.size) return `${n}`;
  const p: string[] = []; f.forEach((e, b) => p.push(e > 1 ? `${b}^${e}` : `${b}`)); return p.join(' × ');
}

export function simplifyFrac(n: number, d: number): Frac {
  if (!Number.isFinite(n) || !Number.isFinite(d)) throw new Error("Nombre invalide");
  if (d === 0) throw new Error("Division par zéro");
  if (n === 0) return { n: 0, d: 1 };
  const nf = decimalToFrac(n), df = decimalToFrac(d);
  let num = nf.n * df.d;
  let den = nf.d * df.n;
  if (den === 0) throw new Error("Division par zéro");
  if (den < 0) { num = -num; den = -den; }
  const g = integerGcd(num, den);
  return { n: num / g, d: den / g };
}
export function fracToStr(f: Frac, showOne = false): string {
  if (f.d === 1) { if (f.n === 1 && !showOne) return ''; if (f.n === -1 && !showOne) return '-'; return `${f.n}`; }
  return `${f.n}/${f.d}`;
}
export function fracToDecimal(f: Frac): number { return f.n / f.d; }
export function addFrac(a: Frac, b: Frac): Frac { return simplifyFrac(a.n*b.d+b.n*a.d, a.d*b.d); }
export function subFrac(a: Frac, b: Frac): Frac { return simplifyFrac(a.n*b.d-b.n*a.d, a.d*b.d); }
export function mulFrac(a: Frac, b: Frac): Frac { return simplifyFrac(a.n*b.n, a.d*b.d); }
export function divFrac(a: Frac, b: Frac): Frac { if (b.n === 0) throw new Error("Division par zéro"); return simplifyFrac(a.n*b.d, a.d*b.n); }

export function parseFrac(input: string): Frac {
  const s = input.trim().replace(/,/g, '.').replace(/\s+/g, ' ');
  if (!s) throw new Error("Nombre manquant");

  const mixed = s.match(/^(-?\d+)\s*[+\s]\s*(\d+)\s*\/\s*(\d+)$/);
  if (mixed) {
    const w = Number(mixed[1]), n = Number(mixed[2]), d = Number(mixed[3]);
    if (d === 0) throw new Error("Division par zéro");
    return simplifyFrac((w < 0 ? -1 : 1) * (Math.abs(w) * d + n), d);
  }

  const fraction = s.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*\/\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))$/);
  if (fraction) return simplifyFrac(Number(fraction[1]), Number(fraction[2]));

  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)) throw new Error("Nombre invalide");
  return decimalToFrac(Number(s));
}

// Radicals
export function simplifyRadical(n: number): Radical {
  if (!Number.isFinite(n) || !Number.isInteger(n)) throw new Error("Le radicande doit être un entier");
  if (n < 0) throw new Error("Radicande négatif"); if (n === 0) return { coeff: 0, radicand: 0 };
  let c = 1, r = n;
  for (let i = 2; i*i <= r; i++) { while (r%(i*i)===0) { c *= i; r /= i*i; } }
  return { coeff: c, radicand: r };
}
export function radToStr(r: Radical, c = 1): string {
  const t = c*r.coeff; if (r.radicand===0) return "0"; if (r.radicand===1) return `${t}`;
  if (t===0) return "0"; if (t===1) return `√${r.radicand}`; if (t===-1) return `-√${r.radicand}`;
  return `${t}√${r.radicand}`;
}

function signedRadTerm(coeff: number, radicand: number): string {
  if (coeff === 0) return '';
  const sign = coeff > 0 ? '+' : '-';
  const mag = Math.abs(coeff);
  const body = mag === 1 ? `√${radicand}` : `${mag}√${radicand}`;
  return ` ${sign} ${body}`;
}

// Format helpers
function signStr(n: number): string { return n >= 0 ? `+ ${n}` : `- ${Math.abs(n)}`; }
function coeffStr(n: number): string { return n === 1 ? '' : n === -1 ? '-' : `${n}`; }
function assertFiniteNumbers(...values: number[]): void {
  if (!values.every(Number.isFinite)) throw new Error("Veuillez renseigner des nombres valides");
}
function assertPositive(values: Record<string, number>): void {
  for (const [name, value] of Object.entries(values)) {
    if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} doit être strictement positif`);
  }
}

// ==================== EXPRESSION PARSER ====================
type Token = { type: 'num'; value: Frac }|{ type: 'op'; value: string }|{ type: 'lparen' }|{ type: 'rparen' };

function tokenizeFracExpr(input: string): Token[] {
  const s = input.replace(/,/g, '.').replace(/\s+/g, '');
  if (!s) throw new Error("Expression vide");
  const tokens: Token[] = [];
  let i = 0;

  const expectsValue = () => !tokens.length || tokens[tokens.length - 1].type === 'lparen' || tokens[tokens.length - 1].type === 'op';
  const readNumber = (): string => {
    let ns = '';
    let dots = 0;
    while (i < s.length && /[0-9.]/.test(s[i])) {
      if (s[i] === '.') dots++;
      if (dots > 1) throw new Error("Nombre invalide");
      ns += s[i++];
    }
    if (!ns || ns === '.') throw new Error("Nombre invalide");
    return ns;
  };

  while (i < s.length) {
    const ch = s[i];
    if (ch === '(') { tokens.push({ type: 'lparen' }); i++; continue; }
    if (ch === ')') { tokens.push({ type: 'rparen' }); i++; continue; }

    if ((ch === '+' || ch === '-') && expectsValue()) {
      const sign = ch === '-' ? -1 : 1;
      i++;
      if (i < s.length && s[i] === '(') {
        // -(...) => -1 × (...)
        tokens.push({ type: 'num', value: { n: sign, d: 1 } });
        tokens.push({ type: 'op', value: '×' });
        continue;
      }
      const ns = readNumber();
      let fr = decimalToFrac(sign * Number(ns));
      if (i < s.length && s[i] === '/' && i + 1 < s.length && /[0-9.]/.test(s[i + 1])) {
        i++;
        const ds = readNumber();
        fr = simplifyFrac(sign * Number(ns), Number(ds));
      }
      tokens.push({ type: 'num', value: fr });
      continue;
    }

    if ('+-*/×÷^'.includes(ch)) {
      let op = ch;
      if (op === '*') op = '×';
      if (op === '/') op = '÷';
      tokens.push({ type: 'op', value: op });
      i++;
      continue;
    }

    if (/[0-9.]/.test(ch)) {
      const ns = readNumber();
      let fr = decimalToFrac(Number(ns));
      if (i < s.length && s[i] === '/' && i + 1 < s.length && /[0-9.]/.test(s[i + 1])) {
        i++;
        const ds = readNumber();
        fr = simplifyFrac(Number(ns), Number(ds));
      }
      tokens.push({ type: 'num', value: fr });
      continue;
    }

    throw new Error(`Caractère inconnu : '${ch}'`);
  }
  return tokens;
}

function _parseExpr(t: Token[], p: {i:number}): Frac {
  let l = _parseTerm(t, p);
  while (p.i<t.length && t[p.i].type==='op' && ('+-'.includes((t[p.i] as any).value))) {
    const op = (t[p.i] as any).value; p.i++; const r = _parseTerm(t, p);
    l = op==='+'?addFrac(l,r):subFrac(l,r);
  } return l;
}
function _parseTerm(t: Token[], p: {i:number}): Frac {
  let l = _parsePow(t, p);
  while (p.i<t.length && t[p.i].type==='op' && '×÷'.includes((t[p.i] as any).value)) {
    const op = (t[p.i] as any).value; p.i++; const r = _parsePow(t, p);
    l = op==='×'?mulFrac(l,r):divFrac(l,r);
  } return l;
}
function _parsePow(t: Token[], p: {i:number}): Frac {
  const base = _parseFactor(t, p);
  if (p.i<t.length && t[p.i].type==='op' && (t[p.i] as any).value==='^') {
    p.i++;
    const exponent = _parsePow(t, p); // right-associative
    const exp = fracToDecimal(exponent);
    if (!Number.isInteger(exp)) throw new Error("Exposant non entier");
    if (base.n === 0 && exp < 0) throw new Error("Division par zéro");
    const absExp = Math.abs(exp);
    const nPow = Math.pow(base.n, absExp);
    const dPow = Math.pow(base.d, absExp);
    return exp >= 0 ? simplifyFrac(nPow, dPow) : simplifyFrac(dPow, nPow);
  }
  return base;
}
function _parseFactor(t: Token[], p: {i:number}): Frac {
  if (p.i >= t.length) throw new Error("Expression incomplète");
  if (t[p.i].type === 'lparen') {
    p.i++;
    const v = _parseExpr(t, p);
    if (p.i>=t.length||t[p.i].type!=='rparen') throw new Error("Parenthèse manquante");
    p.i++;
    return v;
  }
  if (t[p.i].type === 'num') { p.i++; return (t[p.i-1] as any).value; }
  throw new Error("Élément inattendu");
}

function evaluateTokens(tokens: Token[]): Frac {
  const pos = { i: 0 };
  const result = _parseExpr(tokens, pos);
  if (pos.i !== tokens.length) {
    if (tokens[pos.i]?.type === 'rparen') throw new Error("Parenthèse fermante en trop");
    throw new Error("Expression invalide");
  }
  return result;
}

export function solveComplexFractionExpr(expr: string): { result: string; steps: Step[] } {
  const steps: Step[] = [];
  steps.push({ text: `Expression : ${expr}`, type: 'info' });
  try {
    const tokens = tokenizeFracExpr(expr);
    const readable = tokens.map(t => t.type==='num'?fracToStr((t as any).value,true):t.type==='op'?(t as any).value:t.type==='lparen'?'(':')').join(' ');
    steps.push({ text: `Interprétation : ${readable}`, type: 'calc' });
    const res = evaluateTokens(tokens);
    steps.push({ text: `Résultat : ${fracToStr(res, true)}`, highlight: true, type: 'result' });
    if (res.d !== 1) steps.push({ text: `Valeur décimale ≈ ${fracToDecimal(res).toFixed(6)}`, type: 'info' });
    return { result: fracToStr(res, true), steps };
  } catch (e: any) {
    steps.push({ text: `Erreur : ${e.message}`, type: 'warning' });
    return { result: "Erreur", steps };
  }
}

// ==================== FRACTION OPS ====================
export function solveFractionOp(aStr: string, bStr: string, op: string): { result: string; steps: Step[] } {
  const a = parseFrac(aStr), b = parseFrac(bStr), steps: Step[] = [];
  steps.push({ text: `Données : ${fracToStr(a,true)} ${op} ${fracToStr(b,true)}`, type: 'info' });
  let result: Frac;
  if (op==='+'||op==='-') {
    if (a.d !== b.d) {
      const l = lcm(a.d, b.d); steps.push({ text: `PPCM(${a.d}, ${b.d}) = ${l}`, type: 'calc' });
      const na = a.n*(l/a.d), nb = b.n*(l/b.d);
      steps.push({ text: `= ${na}/${l} ${op} ${nb}/${l}`, type: 'calc' });
      const num = op==='+'?na+nb:na-nb;
      steps.push({ text: `= ${num}/${l}`, type: 'calc' });
      result = simplifyFrac(num, l);
    } else { const num = op==='+'?a.n+b.n:a.n-b.n; steps.push({ text: `= ${num}/${a.d}`, type: 'calc' }); result = simplifyFrac(num, a.d); }
  } else if (op==='×') {
    steps.push({ text: `= (${a.n}×${b.n}) / (${a.d}×${b.d}) = ${a.n*b.n}/${a.d*b.d}`, type: 'calc' });
    result = mulFrac(a, b);
  } else {
    steps.push({ text: `= ${fracToStr(a,true)} × ${fracToStr({n:b.d,d:b.n},true)}`, type: 'calc' });
    result = divFrac(a, b);
  }
  if (gcd(Math.abs(result.n),result.d)>1||(result.n!==a.n||result.d!==a.d)) steps.push({ text: `Simplification → ${fracToStr(result,true)}`, type: 'calc' });
  steps.push({ text: `Résultat : ${fracToStr(result, true)}`, highlight: true, type: 'result' });
  if (result.d !== 1) steps.push({ text: `≈ ${fracToDecimal(result).toFixed(6)}`, type: 'info' });
  return { result: fracToStr(result, true), steps };
}

// ==================== PGCD / PPCM ====================
export function solveGCDLCM(a: number, b: number): { result: string; steps: Step[] } {
  assertFiniteNumbers(a,b);
  if (!Number.isInteger(a)||!Number.isInteger(b)) throw new Error("PGCD/PPCM : saisissez des entiers");
  a=Math.abs(a); b=Math.abs(b);
  if (a===0 && b===0) throw new Error("PGCD(0,0) n'est pas défini");
  const steps: Step[] = [{text:`PGCD et PPCM de ${a} et ${b}`,type:'info'}];
  if (a>1&&a<100000) steps.push({text:`${a} = ${formatPrimeFactors(a)}`,type:'calc'});
  if (b>1&&b<100000) steps.push({text:`${b} = ${formatPrimeFactors(b)}`,type:'calc'});
  let x=a,y=b;
  while (y!==0) { const q=Math.floor(x/y), r=x%y; steps.push({text:`${x} = ${y} × ${q} + ${r}`,type:'calc'}); x=y; y=r; }
  const g=x, l=a===0||b===0?0:Math.abs(a*b)/g;
  steps.push({text:`PGCD(${a}, ${b}) = ${g}`,highlight:true,type:'result'});
  steps.push({text:`PPCM(${a}, ${b}) = ${l}`,highlight:true,type:'result'});
  return {result:`PGCD = ${g}, PPCM = ${l}`,steps};
}

// ==================== RATIONALISATION ====================
export function solveRationalize(nA: number, nB: number, nR: number, dA: number, dB: number, dR: number): { result: string; steps: Step[] } {
  assertFiniteNumbers(nA,nB,nR,dA,dB,dR);
  if (!Number.isInteger(nR)||!Number.isInteger(dR)||nR<0||dR<0) throw new Error("Les radicandes doivent être des entiers positifs ou nuls");
  if (dA===0 && dB===0) throw new Error("Le dénominateur ne peut pas être nul");
  const steps: Step[] = [];
  const ns = nB===0?`${nA}`:nA===0?`${nB}√${nR}`:`${nA} ${signStr(nB).replace(/^([+-])/, '$1 ')}√${nR}`;
  const ds = dB===0?`${dA}`:dA===0?`${dB}√${dR}`:`${dA} ${signStr(dB).replace(/^([+-])/, '$1 ')}√${dR}`;
  steps.push({ text: `Rationaliser (${ns}) / (${ds})`, type: 'info' });

  if (dA===0 && dB!==0) {
    steps.push({ text: `Multiplier par √${dR}/√${dR}`, type: 'calc' });
    const newDen = dB*dR;
    if (nB===0) {
      steps.push({ text: `Num = ${nA}√${dR}`, type: 'calc' });
      steps.push({ text: `Dén = ${dB}×${dR} = ${newDen}`, type: 'calc' });
      const g = gcd(Math.abs(nA), Math.abs(newDen));
      const r = `${nA/g===1?'':nA/g===-1?'-':nA/g}√${dR}${newDen/g===1?'':`/${newDen/g}`}`;
      steps.push({ text: `Résultat : ${r}`, highlight: true, type: 'result' });
      return { result: r, steps };
    }
    const sp = simplifyRadical(nR*dR);
    steps.push({ text: `Num = ${nA}√${dR} + ${radToStr(sp, nB)}`, type: 'calc' });
    steps.push({ text: `Dén = ${newDen}`, type: 'calc' });
    const r = `(${nA}√${dR} + ${radToStr(sp, nB)}) / ${newDen}`;
    steps.push({ text: `Résultat : ${r}`, highlight: true, type: 'result' });
    return { result: r, steps };
  }
  if (dA!==0 && dB!==0) {
    const cs = dB>0?'-':'+'; const cb = -dB;
    steps.push({ text: `Conjugué : ${dA} ${cs} ${Math.abs(dB)}√${dR}`, type: 'info' });
    const newDen = dA*dA - dB*dB*dR;
    steps.push({ text: `Dén = ${dA}² - (${dB})²×${dR} = ${newDen}`, type: 'calc' });
    if (newDen===0) { steps.push({ text: `Dén = 0 : impossible`, type: 'warning' }); return { result: "Impossible", steps }; }
    if (nB===0) {
      const tc = nA*dA, tr = nA*cb;
      steps.push({ text: `Num = ${nA}×${dA} + ${nA}×(${cb})√${dR} = ${tc} ${signStr(tr)}√${dR}`, type: 'calc' });
      const g = gcd(gcd(Math.abs(tc), Math.abs(tr)), Math.abs(newDen));
      const rc = tc/g, rr = tr/g, rd = newDen/g;
      let r: string;
      if (rr===0) { const f = simplifyFrac(rc,rd); r = fracToStr(f,true); }
      else if (rd===1) { r = `${rc} ${signStr(rr)}√${dR}`; }
      else { r = `(${rc} ${signStr(rr)}√${dR}) / ${rd}`; }
      steps.push({ text: `Résultat : ${r}`, highlight: true, type: 'result' });
      return { result: r, steps };
    }
    // Full expansion (a+b√p)(c+d√q)
    const t1 = nA*dA, t2 = nA*cb, t3 = nB*dA, t4 = nB*cb;
    let constPart = t1;
    let radPart1Coeff = t2;
    let radPart2Coeff = t3;
    const sp4 = nR !== dR ? simplifyRadical(nR*dR) : null;
    let radPart3Coeff = 0;
    let radPart3 = 1;

    if (nR === dR) {
      constPart += t4*nR;
      steps.push({ text: `√${nR}×√${dR} = ${nR}`, type: 'calc' });
    } else if (sp4) {
      if (sp4.radicand === 1) constPart += t4*sp4.coeff;
      else { radPart3Coeff = t4*sp4.coeff; radPart3 = sp4.radicand; }
    }

    if (nR === dR) {
      radPart1Coeff += radPart2Coeff;
      radPart2Coeff = 0;
    }

    // Keep a positive denominator and reduce any common integer factor.
    let den = newDen;
    if (den < 0) {
      den = -den; constPart = -constPart; radPart1Coeff = -radPart1Coeff;
      radPart2Coeff = -radPart2Coeff; radPart3Coeff = -radPart3Coeff;
    }
    const coeffs = [Math.abs(constPart), Math.abs(radPart1Coeff), Math.abs(radPart2Coeff), Math.abs(radPart3Coeff), Math.abs(den)]
      .filter(v => v !== 0);
    const common = coeffs.reduce((g, v) => integerGcd(g, v));
    if (common > 1) {
      constPart /= common; radPart1Coeff /= common; radPart2Coeff /= common;
      radPart3Coeff /= common; den /= common;
    }

    let numerator = `${constPart}`;
    if (radPart1Coeff) numerator += signedRadTerm(radPart1Coeff, dR);
    if (radPart2Coeff) numerator += signedRadTerm(radPart2Coeff, nR);
    if (radPart3Coeff) numerator += signedRadTerm(radPart3Coeff, radPart3);
    if (constPart === 0) numerator = numerator.replace(/^0\s*/, '').replace(/^\+\s*/, '');

    steps.push({ text: `Numérateur après développement : ${numerator}`, type: 'calc' });
    const r = den === 1 ? numerator : `(${numerator}) / ${den}`;
    steps.push({ text: `Résultat : ${r}`, highlight: true, type: 'result' });
    return { result: r, steps };
  }
  steps.push({ text: `Dénominateur déjà rationnel`, type: 'info' });
  if (nB===0) { const f = simplifyFrac(nA,dA); steps.push({ text: `= ${fracToStr(f,true)}`, highlight: true, type: 'result' }); return { result: fracToStr(f,true), steps }; }
  const g = gcd(gcd(Math.abs(nA),Math.abs(nB)),Math.abs(dA));
  const r = `(${nA/g} ${signStr(nB/g)}√${nR}) / ${dA/g}`;
  steps.push({ text: `= ${r}`, highlight: true, type: 'result' }); return { result: r, steps };
}

// ==================== RADICALS ====================
export function solveRadicalSimplify(n: number): { result: string; steps: Step[] } {
  assertFiniteNumbers(n); if (!Number.isInteger(n)) throw new Error("Le radicande doit être un entier");
  const steps: Step[] = [];
  steps.push({ text: `Simplifier √${n}`, type: 'info' });
  if (n<0) { steps.push({ text: `Radicande négatif`, type: 'warning' }); return { result: "Impossible", steps }; }
  const p = Math.sqrt(n);
  if (Number.isInteger(p)) { steps.push({ text: `${n} = ${p}² → √${n} = ${p}`, type: 'calc' }); steps.push({ text: `${p}`, highlight: true, type: 'result' }); return { result: `${p}`, steps }; }
  steps.push({ text: `Décomposition : ${n} = ${formatPrimeFactors(n)}`, type: 'calc' });
  const r = simplifyRadical(n);
  if (r.coeff===1) { steps.push({ text: `√${n} ≈ ${Math.sqrt(n).toFixed(6)}`, highlight: true, type: 'result' }); return { result: `√${n}`, steps }; }
  steps.push({ text: `√${n} = √(${r.coeff}²×${r.radicand}) = ${r.coeff}√${r.radicand}`, type: 'calc' });
  steps.push({ text: `${radToStr(r)} ≈ ${(r.coeff*Math.sqrt(r.radicand)).toFixed(6)}`, highlight: true, type: 'result' });
  return { result: radToStr(r), steps };
}

export function solveRadicalOp(ac: number, ar: number, bc: number, br: number, op: string): { result: string; steps: Step[] } {
  assertFiniteNumbers(ac,ar,bc,br); if (!Number.isInteger(ar)||!Number.isInteger(br)) throw new Error("Les radicandes doivent être des entiers");
  if (!['+','-','×','÷'].includes(op)) throw new Error("Opération invalide");
  const steps: Step[] = [];
  const rA = simplifyRadical(Math.round(ar)), rB = simplifyRadical(Math.round(br));
  const cA = ac*rA.coeff, cB = bc*rB.coeff;
  steps.push({ text: `${ac}√${ar} ${op} ${bc}√${br}`, type: 'info' });
  if (rA.coeff>1) steps.push({ text: `${ac}√${ar} = ${radToStr(rA, ac)}`, type: 'calc' });
  if (rB.coeff>1) steps.push({ text: `${bc}√${br} = ${radToStr(rB, bc)}`, type: 'calc' });

  if (op==='+'||op==='-') {
    if (rA.radicand===rB.radicand) {
      const c = op==='+'?cA+cB:cA-cB;
      steps.push({ text: `Même radicande : ${cA} ${op} ${cB} = ${c}`, type: 'calc' });
      const rs = rA.radicand===1?`${c}`:c===0?"0":`${c}√${rA.radicand}`;
      steps.push({ text: `${rs}`, highlight: true, type: 'result' }); return { result: rs, steps };
    }
    steps.push({ text: `Radicandes différents`, type: 'warning' });
    const rs = `${radToStr(rA,ac)} ${op} ${radToStr(rB,bc)}`;
    steps.push({ text: rs, highlight: true, type: 'result' }); return { result: rs, steps };
  }
  if (op==='×') {
    const nc = cA*cB, nr = rA.radicand*rB.radicand;
    steps.push({ text: `Coeff : ${cA}×${cB} = ${nc}`, type: 'calc' });
    steps.push({ text: `Rad : √${rA.radicand}×√${rB.radicand} = √${nr}`, type: 'calc' });
    const f = simplifyRadical(nr); const tc = nc*f.coeff;
    if (f.coeff>1) steps.push({ text: `√${nr} = ${f.coeff}√${f.radicand}`, type: 'calc' });
    const rs = f.radicand<=1?`${tc}`:`${tc}√${f.radicand}`;
    steps.push({ text: rs, highlight: true, type: 'result' }); return { result: rs, steps };
  }
  // ÷ with rationalization
  if (cB===0) throw new Error("Division par zéro");
  steps.push({ text: `(${radToStr(rA,ac)}) / (${radToStr(rB,bc)})`, type: 'calc' });
  if (rA.radicand===rB.radicand) {
    const f = simplifyFrac(cA, cB);
    steps.push({ text: `Même radicande → ${fracToStr(f,true)}`, highlight: true, type: 'result' }); return { result: fracToStr(f,true), steps };
  }
  // Rationalize: multiply by √rB.radicand / √rB.radicand
  const newNumCoeff = cA;
  const newNumRad = rA.radicand * rB.radicand;
  const newDen = cB * rB.radicand;
  const sNR = simplifyRadical(newNumRad);
  const totalNum = newNumCoeff * sNR.coeff;
  const g = gcd(Math.abs(totalNum), Math.abs(newDen));
  const rn = totalNum/g, rd = newDen/g;
  const rs = sNR.radicand<=1?(rd===1?`${rn}`:`${rn}/${rd}`):(rd===1?`${rn}√${sNR.radicand}`:`(${rn}√${sNR.radicand})/${rd}`);
  steps.push({ text: `Rationalisation → ${rs}`, type: 'calc' });
  steps.push({ text: rs, highlight: true, type: 'result' }); return { result: rs, steps };
}

export function solveRadicalCompare(ac: number, ar: number, bc: number, br: number): { result: string; steps: Step[] } {
  const steps: Step[] = [];
  if (![ac, ar, bc, br].every(Number.isFinite)) throw new Error("Nombre invalide");
  if (ar < 0 || br < 0) throw new Error("Un radicande ne peut pas être négatif");
  const valA = ac * Math.sqrt(ar), valB = bc * Math.sqrt(br);
  steps.push({ text: `Comparer ${ac}√${ar} et ${bc}√${br}`, type: 'info' });
  steps.push({ text: `${ac}√${ar} ≈ ${valA.toFixed(6)}`, type: 'calc' });
  steps.push({ text: `${bc}√${br} ≈ ${valB.toFixed(6)}`, type: 'calc' });
  const diff = valA - valB;
  const sym = Math.abs(diff) < 1e-10 ? '=' : diff > 0 ? '>' : '<';
  steps.push({ text: `${ac}√${ar} ${sym} ${bc}√${br}`, highlight: true, type: 'result' });
  return { result: sym, steps };
}

// ==================== ABSOLUTE VALUE ====================
export function solveAbsoluteDistance(x1: number, x2: number): { result: string; steps: Step[] } {
  if (![x1, x2].every(Number.isFinite)) throw new Error("Nombre invalide");
  const steps: Step[] = [];
  steps.push({ text: `d(A,B) = |${x2} - (${x1})| = |${x2-x1}| = ${Math.abs(x2-x1)}`, type: 'calc' });
  steps.push({ text: `${Math.abs(x2-x1)}`, highlight: true, type: 'result' });
  return { result: `${Math.abs(x2-x1)}`, steps };
}
export function solveAbsoluteEquation(a: number, b: number, c: number): { result: string; steps: Step[] } {
  if (![a, b, c].every(Number.isFinite)) throw new Error("Nombre invalide");
  const steps: Step[] = [], bs = signStr(b);
  steps.push({ text: `|${a}x ${bs}| = ${c}`, type: 'info' });
  if (c < 0) { steps.push({ text: `Une valeur absolue est toujours ≥ 0 → S = ∅`, highlight: true, type: 'result' }); return { result: "S = ∅", steps }; }
  if (a === 0) {
    const ok = Math.abs(b) === c;
    const result = ok ? 'S = ℝ' : 'S = ∅';
    steps.push({ text: `L'expression ne dépend pas de x : |${b}| = ${Math.abs(b)}`, type: 'calc' });
    steps.push({ text: result, highlight: true, type: 'result' });
    return { result, steps };
  }
  if (c===0) { const x = simplifyFrac(-b,a); steps.push({ text: `${a}x ${bs} = 0 → x = ${fracToStr(x,true)}`, type: 'calc' }); steps.push({ text: `S = {${fracToStr(x,true)}}`, highlight: true, type: 'result' }); return { result: `S = {${fracToStr(x,true)}}`, steps }; }
  steps.push({ text: `Cas 1 : ${a}x ${bs} = ${c}`, type: 'calc' }); const x1 = simplifyFrac(c-b,a); steps.push({ text: `x₁ = ${fracToStr(x1,true)}`, type: 'calc' });
  steps.push({ text: `Cas 2 : ${a}x ${bs} = ${-c}`, type: 'calc' }); const x2 = simplifyFrac(-c-b,a); steps.push({ text: `x₂ = ${fracToStr(x2,true)}`, type: 'calc' });
  const [small, large] = fracToDecimal(x1)<fracToDecimal(x2)?[x1,x2]:[x2,x1];
  const result = `S = {${fracToStr(small,true)} ; ${fracToStr(large,true)}}`;
  steps.push({ text: result, highlight: true, type: 'result' });
  return { result, steps };
}
export function solveAbsoluteInequation(a: number, b: number, c: number, sign: string): { result: string; steps: Step[] } {
  if (![a, b, c].every(Number.isFinite)) throw new Error("Nombre invalide");
  if (!['<','≤','>','≥'].includes(sign)) throw new Error("Signe invalide");
  const steps: Step[] = [], bs = signStr(b), strict = sign==='<'||sign==='>';
  steps.push({ text: `|${a}x ${bs}| ${sign} ${c}`, type: 'info' });
  if (a === 0) {
    const value = Math.abs(b);
    const ok = sign==='<'?value<c:sign==='≤'?value<=c:sign==='>'?value>c:value>=c;
    const result = ok ? 'S = ℝ' : 'S = ∅';
    steps.push({ text: `|${b}| = ${value} : l'inéquation est ${ok?'vraie':'fausse'} pour tout x`, type: 'calc' });
    steps.push({ text: result, highlight: true, type: 'result' });
    return { result, steps };
  }
  const ob = strict?[']','[']:['[',']'];
  if (sign==='<'||sign==='≤') {
    if (c<0||(c===0&&strict)) { steps.push({ text: `S = ∅`, highlight: true, type: 'result' }); return { result: "S = ∅", steps }; }
    if (c===0 && sign==='≤') {
      const x = simplifyFrac(-b,a); const result=`S = {${fracToStr(x,true)}}`;
      steps.push({ text: result, highlight: true, type: 'result' }); return { result, steps };
    }
    let l = simplifyFrac(-c-b,a), r = simplifyFrac(c-b,a); if (fracToDecimal(l)>fracToDecimal(r)) [l,r]=[r,l];
    steps.push({ text: `-${c} ${sign} ${a}x ${bs} ${sign} ${c}`, type: 'calc' });
    const iv = `${ob[0]}${fracToStr(l,true)} ; ${fracToStr(r,true)}${ob[1]}`;
    steps.push({ text: `S = ${iv}`, highlight: true, type: 'result' }); return { result: `S = ${iv}`, steps };
  }
  if (c<0 || (c===0 && sign==='≥')) { steps.push({ text: `S = ℝ`, highlight: true, type: 'result' }); return { result: "S = ℝ", steps }; }
  if (c===0 && sign==='>') {
    const x = simplifyFrac(-b,a); const xs=fracToStr(x,true); const result=`S = ]-∞ ; ${xs}[ ∪ ]${xs} ; +∞[`;
    steps.push({ text: result, highlight:true, type:'result' }); return {result,steps};
  }
  const x1 = simplifyFrac(c-b,a), x2 = simplifyFrac(-c-b,a);
  const [lo,hi] = fracToDecimal(x2)<fracToDecimal(x1)?[x2,x1]:[x1,x2];
  const iv = `]-∞ ; ${fracToStr(lo,true)}${ob[1]} ∪ ${ob[0]}${fracToStr(hi,true)} ; +∞[`;
  steps.push({ text: `S = ${iv}`, highlight: true, type: 'result' }); return { result: `S = ${iv}`, steps };
}

// ==================== DEVELOPMENT ====================
export function solveDevelopment(type: string, a: number, b: number): { result: string; steps: Step[] } {
  const steps: Step[] = [];
  if (type==='(a+b)^2') {
    steps.push({ text: `(${a}x ${signStr(b)})²`, type: 'info' }); steps.push({ text: `= a² + 2ab + b²`, type: 'info' });
    const a2=a*a, ab2=2*a*b, b2=b*b;
    steps.push({ text: `a² = ${a2}x²`, type: 'calc' }); steps.push({ text: `2ab = ${ab2}x`, type: 'calc' }); steps.push({ text: `b² = ${b2}`, type: 'calc' });
    const r = `${a2}x² ${signStr(ab2)}x + ${b2}`; steps.push({ text: r, highlight: true, type: 'result' }); return { result: r, steps };
  }
  if (type==='(a-b)^2') {
    const ab = Math.abs(b); steps.push({ text: `(${a}x - ${ab})²`, type: 'info' }); steps.push({ text: `= a² - 2ab + b²`, type: 'info' });
    const a2=a*a, ab2=2*a*ab, b2=ab*ab;
    steps.push({ text: `a² = ${a2}x²`, type: 'calc' }); steps.push({ text: `2ab = ${ab2}x`, type: 'calc' }); steps.push({ text: `b² = ${b2}`, type: 'calc' });
    const r = `${a2}x² - ${ab2}x + ${b2}`; steps.push({ text: r, highlight: true, type: 'result' }); return { result: r, steps };
  }
  if (type==='(a+b)(a-b)') {
    steps.push({ text: `(${a}x + ${b})(${a}x - ${b})`, type: 'info' }); steps.push({ text: `= a² - b²`, type: 'info' });
    const r = `${a*a}x² - ${b*b}`; steps.push({ text: r, highlight: true, type: 'result' }); return { result: r, steps };
  }
  return { result: "", steps };
}
export function solveGeneralDevelopment(a: number, b: number, c: number, d: number): { result: string; steps: Step[] } {
  const steps: Step[] = [];
  steps.push({ text: `(${a}x ${signStr(b)})(${c}x ${signStr(d)})`, type: 'info' });
  const ac=a*c, ad=a*d, bc=b*c, bd=b*d, mid=ad+bc;
  steps.push({ text: `${a}x×${c}x = ${ac}x²`, type: 'calc' });
  steps.push({ text: `${a}x×(${d}) + (${b})×${c}x = ${ad}x + ${bc}x = ${mid}x`, type: 'calc' });
  steps.push({ text: `(${b})×(${d}) = ${bd}`, type: 'calc' });
  const r = `${ac}x² ${signStr(mid)}x ${signStr(bd)}`;
  steps.push({ text: r, highlight: true, type: 'result' }); return { result: r, steps };
}

// ==================== SIMPLIFICATION A(x)/B(x) ====================

// Internal: find roots of ax²+bx+c (returns array of {n,d} fracs)
function _findRoots(a: number, b: number, c: number): Frac[] {
  if (a === 0) {
    if (b === 0) return [];
    return [simplifyFrac(-c, b)];
  }
  const disc = b * b - 4 * a * c;
  if (disc < 0) return [];
  if (disc === 0) { const r = simplifyFrac(-b, 2 * a); return [r, r]; }
  const sd = Math.sqrt(disc);
  if (!Number.isInteger(sd)) return [];
  return [simplifyFrac(-b + sd, 2 * a), simplifyFrac(-b - sd, 2 * a)];
}

// Format polynomial string
function _polyStr(a: number, b: number, c: number): string {
  let s = '';
  if (a !== 0) s += `${coeffStr(a)}x²`;
  if (b !== 0) { if (s) s += ` ${signStr(b)}x`; else s += `${coeffStr(b)}x`; }
  if (c !== 0) { if (s) s += ` ${signStr(c)}`; else s += `${c}`; }
  return s || '0';
}

// Check if root r is a root of polynomial ax²+bx+c
function _isRoot(a: number, b: number, c: number, r: Frac): boolean {
  // Evaluate a*(n/d)²+b*(n/d)+c = (a*n²+b*n*d+c*d²)/d²
  const val = a * r.n * r.n + b * r.n * r.d + c * r.d * r.d;
  return Math.abs(val) < 0.0001;
}

// Factor as string given leading coeff and root
function _factorStr(r: Frac): string {
  if (r.n === 0) return 'x';
  if (r.d === 1) {
    return r.n >= 0 ? `(x - ${r.n})` : `(x + ${-r.n})`;
  }
  // (d*x - n)
  return r.n >= 0 ? `(${r.d}x - ${r.n})` : `(${r.d}x + ${-r.n})`;
}

export function solveSimplifyRational(
  a1: number, b1: number, c1: number,
  a2: number, b2: number, c2: number
): { result: string; steps: Step[] } {
  assertFiniteNumbers(a1,b1,c1,a2,b2,c2);
  if (![a1,b1,c1,a2,b2,c2].every(Number.isInteger)) throw new Error("Pour cette simplification, utilisez des coefficients entiers");
  if (a2===0&&b2===0&&c2===0) throw new Error("B(x) ne peut pas être le polynôme nul");
  const steps: Step[] = [];
  const numStr = _polyStr(a1, b1, c1);
  const denStr = _polyStr(a2, b2, c2);
  steps.push({ text: `Simplifier A(x)/B(x)`, type: 'info' });
  steps.push({ text: `A(x) = ${numStr}`, type: 'calc' });
  steps.push({ text: `B(x) = ${denStr}`, type: 'calc' });

  // Step 1: Factor numerator
  steps.push({ text: `--- Factorisation du numérateur ---`, type: 'info' });

  const gNum = gcd(gcd(Math.abs(a1), Math.abs(b1)), Math.abs(c1));
  let na = a1, nb = b1, nc = c1;
  let numPrefix = 1;
  if (gNum > 1) {
    numPrefix = gNum; na = a1 / gNum; nb = b1 / gNum; nc = c1 / gNum;
    steps.push({ text: `Facteur commun : ${gNum}`, type: 'calc' });
  }

  const numRoots = _findRoots(na, nb, nc);

  // Step 2: Factor denominator
  steps.push({ text: `--- Factorisation du dénominateur ---`, type: 'info' });

  const gDen = gcd(gcd(Math.abs(a2), Math.abs(b2)), Math.abs(c2));
  let da = a2, db = b2, dc = c2;
  let denPrefix = 1;
  if (gDen > 1) {
    denPrefix = gDen; da = a2 / gDen; db = b2 / gDen; dc = c2 / gDen;
    steps.push({ text: `Facteur commun : ${gDen}`, type: 'calc' });
  }

  const denRoots = _findRoots(da, db, dc);

  // Build factored forms
  const buildFactored = (prefix: number, a: number, roots: Frac[], origA: number, origB: number, origC: number): string => {
    if (roots.length === 0) {
      return prefix > 1 ? `${prefix}(${_polyStr(origA / prefix, origB / prefix, origC / prefix)})` : _polyStr(origA, origB, origC);
    }
    let s = '';
    if (prefix !== 1) s += `${prefix}`;
    if (a !== 1 && a !== -1 && roots.length > 0 && a !== 0) {
      // Leading coeff absorbed into factors for monic case
    }
    for (const r of roots) s += _factorStr(r);
    return s || _polyStr(origA, origB, origC);
  };

  const numFactored = buildFactored(numPrefix, na, numRoots, a1, b1, c1);
  const denFactored = buildFactored(denPrefix, da, denRoots, a2, b2, c2);

  steps.push({ text: `A(x) = ${numFactored}`, type: 'calc' });
  steps.push({ text: `B(x) = ${denFactored}`, type: 'calc' });

  // Step 3: Find common roots to cancel
  const commonRoots: Frac[] = [];
  const usedDen: boolean[] = denRoots.map(() => false);

  for (const nr of numRoots) {
    for (let j = 0; j < denRoots.length; j++) {
      if (!usedDen[j] && nr.n === denRoots[j].n && nr.d === denRoots[j].d) {
        // Also verify it's actually a root of both original polynomials
        if (_isRoot(a1, b1, c1, nr) && _isRoot(a2, b2, c2, nr)) {
          commonRoots.push(nr);
          usedDen[j] = true;
          break;
        }
      }
    }
  }

  if (commonRoots.length === 0) {
    // Try numeric GCD of prefixes
    const coeffGcd = gcd(numPrefix, denPrefix);
    if (coeffGcd > 1) {
      steps.push({ text: `Simplification des coefficients par ${coeffGcd}`, type: 'calc' });
      const simplifiedNum = _polyStr(a1 / coeffGcd, b1 / coeffGcd, c1 / coeffGcd);
      const simplifiedDen = _polyStr(a2 / coeffGcd, b2 / coeffGcd, c2 / coeffGcd);
      const r = `(${simplifiedNum}) / (${simplifiedDen})`;
      steps.push({ text: `Résultat : ${r}`, highlight: true, type: 'result' });
      return { result: r, steps };
    }
    steps.push({ text: `Aucun facteur commun trouvé`, type: 'warning' });
    const r = `(${numStr}) / (${denStr})`;
    steps.push({ text: `Résultat : ${r}`, highlight: true, type: 'result' });
    return { result: r, steps };
  }

  // Show what we cancel
  for (const cr of commonRoots) {
    const fStr = _factorStr(cr);
    steps.push({ text: `Facteur commun trouvé : ${fStr} (racine x = ${fracToStr(cr, true)})`, type: 'calc' });
  }

  // Build remaining factors
  const remainingNum: Frac[] = [];
  const usedNum: boolean[] = numRoots.map(() => false);
  // Mark which num roots are cancelled
  for (const cr of commonRoots) {
    for (let i = 0; i < numRoots.length; i++) {
      if (!usedNum[i] && numRoots[i].n === cr.n && numRoots[i].d === cr.d) {
        usedNum[i] = true; break;
      }
    }
  }
  for (let i = 0; i < numRoots.length; i++) {
    if (!usedNum[i]) remainingNum.push(numRoots[i]);
  }

  const remainingDen: Frac[] = [];
  for (let i = 0; i < denRoots.length; i++) {
    if (!usedDen[i]) remainingDen.push(denRoots[i]);
  }

  // Simplify coefficient ratio
  const coeffGcd2 = gcd(numPrefix, denPrefix);
  const finalNumCoeff = numPrefix / coeffGcd2;
  const finalDenCoeff = denPrefix / coeffGcd2;

  // Build result strings
  let numResult = '';
  if (remainingNum.length === 0 && na === 0) {
    // Was linear, fully cancelled
    numResult = finalNumCoeff === 1 ? '1' : `${finalNumCoeff}`;
  } else if (remainingNum.length === 0) {
    numResult = finalNumCoeff === 1 ? '1' : `${finalNumCoeff}`;
  } else {
    numResult = (finalNumCoeff !== 1 ? `${finalNumCoeff}` : '') + remainingNum.map(r => _factorStr(r)).join('');
  }

  let denResult = '';
  if (remainingDen.length === 0) {
    denResult = finalDenCoeff === 1 ? '1' : `${finalDenCoeff}`;
  } else {
    denResult = (finalDenCoeff !== 1 ? `${finalDenCoeff}` : '') + remainingDen.map(r => _factorStr(r)).join('');
  }

  // Conditions d'existence
  const forbidden = [...new Set(denRoots.map(r => fracToStr(r, true)))];
  if (forbidden.length) steps.push({ text: `Condition : x ≠ ${forbidden.join(' et x ≠ ')}`, type: 'warning' });

  let finalResult: string;
  if (denResult === '1') {
    finalResult = numResult;
  } else {
    finalResult = `${numResult} / ${denResult}`;
  }

  steps.push({ text: `Résultat : ${finalResult}`, highlight: true, type: 'result' });

  return { result: finalResult, steps };
}

// ==================== FACTORISATION ====================
export function solveFactorization(a: number, b: number, c: number): { result: string; steps: Step[] } {
  assertFiniteNumbers(a,b,c);
  if (![a,b,c].every(Number.isInteger)) throw new Error("Pour la factorisation automatique, saisissez des coefficients entiers");
  if (a === 0) {
    if (b === 0) return { result: `${c}`, steps: [{ text: `Expression constante : ${c}`, highlight: true, type: 'result' }] };
    const g = gcd(Math.abs(b), Math.abs(c));
    const ib = b/g, ic = c/g;
    const inside = `${coeffStr(ib)}x ${signStr(ic)}`;
    const result = g === 1 ? inside : `${g}(${inside})`;
    return { result, steps: [{ text: `Facteur commun : ${g}`, type: 'calc' }, { text: result, highlight: true, type: 'result' }] };
  }
  const steps: Step[] = [];
  steps.push({ text: `Factoriser ${a}x² ${signStr(b)}x ${signStr(c)}`, type: 'info' });
  const g = gcd(gcd(Math.abs(a),Math.abs(b)),Math.abs(c));
  let wa=a, wb=b, wc=c, pf='';
  if (g>1) { wa=a/g; wb=b/g; wc=c/g; pf=`${g}`;
    steps.push({ text: `Facteur commun ${g} → ${g}(${wa}x² ${signStr(wb)}x ${signStr(wc)})`, type: 'calc' }); }
  const sa = Math.sqrt(Math.abs(wa)), sc = Math.sqrt(Math.abs(wc));
  if (Number.isInteger(sa)&&Number.isInteger(sc)&&wa>0&&wc>0) {
    if (wb===2*sa*sc) { const r = `${pf}(${coeffStr(sa)}x + ${sc})²`; steps.push({ text: `(a+b)² reconnu`, type: 'info' }); steps.push({ text: r, highlight: true, type: 'result' }); return { result: r, steps }; }
    if (wb===-2*sa*sc) { const r = `${pf}(${coeffStr(sa)}x - ${sc})²`; steps.push({ text: `(a-b)² reconnu`, type: 'info' }); steps.push({ text: r, highlight: true, type: 'result' }); return { result: r, steps }; }
  }
  if (wb===0&&wc<0&&Number.isInteger(sa)&&wa>0) { const sc2 = Math.sqrt(-wc); if (Number.isInteger(sc2)) { const r = `${pf}(${coeffStr(sa)}x + ${sc2})(${coeffStr(sa)}x - ${sc2})`; steps.push({ text: `a²-b² reconnu`, type: 'info' }); steps.push({ text: r, highlight: true, type: 'result' }); return { result: r, steps }; } }
  const disc = wb*wb-4*wa*wc;
  steps.push({ text: `Δ = ${wb}² - 4×${wa}×${wc} = ${disc}`, type: 'calc' });
  if (disc<0) { if (pf) { const r = `${pf}(${wa}x² ${signStr(wb)}x ${signStr(wc)})`; steps.push({ text: `Δ < 0 → ${r}`, highlight: true, type: 'result' }); return { result: r, steps }; }
    steps.push({ text: `Non factorisable dans ℝ`, highlight: true, type: 'result' }); return { result: "Non factorisable", steps }; }
  if (disc===0) { const x0 = simplifyFrac(-wb,2*wa); const xs = x0.n>=0?`- ${fracToStr(x0,true)}`:`+ ${fracToStr({n:-x0.n,d:x0.d},true)}`; const r = `${pf}${coeffStr(wa)}(x ${xs})²`; steps.push({ text: `Racine double x₀ = ${fracToStr(x0,true)}`, type: 'calc' }); steps.push({ text: r, highlight: true, type: 'result' }); return { result: r, steps }; }
  const sd = Math.sqrt(disc);
  if (Number.isInteger(sd)) {
    const x1 = simplifyFrac(-wb+sd,2*wa), x2 = simplifyFrac(-wb-sd,2*wa);
    steps.push({ text: `√Δ = ${sd}`, type: 'calc' }); steps.push({ text: `x₁ = ${fracToStr(x1,true)}, x₂ = ${fracToStr(x2,true)}`, type: 'calc' });
    const xs1 = x1.n>=0?`- ${fracToStr(x1,true)}`:`+ ${fracToStr({n:-x1.n,d:x1.d},true)}`;
    const xs2 = x2.n>=0?`- ${fracToStr(x2,true)}`:`+ ${fracToStr({n:-x2.n,d:x2.d},true)}`;
    const r = `${pf}${coeffStr(wa)}(x ${xs1})(x ${xs2})`; steps.push({ text: r, highlight: true, type: 'result' }); return { result: r, steps };
  }
  const sr = simplifyRadical(disc);
  steps.push({ text: `√Δ = ${radToStr(sr)}`, type: 'calc' });
  const v1 = (-wb+sd)/(2*wa), v2 = (-wb-sd)/(2*wa);
  steps.push({ text: `x₁ ≈ ${v1.toFixed(4)}, x₂ ≈ ${v2.toFixed(4)}`, type: 'calc' });
  const r = `${pf}${coeffStr(wa)}(x - x₁)(x - x₂)`; steps.push({ text: r, highlight: true, type: 'result' }); return { result: r, steps };
}

export function solveFactorCommon(terms: string): { result: string; steps: Step[] } {
  const steps: Step[] = [];
  steps.push({ text: `Factoriser : ${terms}`, type: 'info' });
  // Normalize unicode superscripts
  const normalized = terms.replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4');
  const tl = normalized.replace(/\s/g,'').replace(/-/g,'+-').split('+').filter(t=>t);
  if (tl.length<2) { steps.push({ text: `Un seul terme`, type: 'warning' }); return { result: terms, steps }; }
  const parsed: {coeff:number;xPow:number}[] = [];
  for (const t of tl) {
    let c = 1, xp = 0;
    const m = t.match(/^(-?\d*)(x?)(?:\^(\d+))?$/);
    if (!m) { steps.push({ text: `Terme non reconnu : ${t}`, type: 'warning' }); return { result: terms, steps }; }
    if (m[1]===''||m[1]==='+') c = 1; else if (m[1]==='-') c = -1; else c = parseInt(m[1]);
    if (m[2]==='x') { xp = m[3] ? parseInt(m[3]) : 1; }
    parsed.push({coeff:c, xPow:xp});
  }
  let cg = Math.abs(parsed[0].coeff); for (let i=1;i<parsed.length;i++) cg = gcd(cg, Math.abs(parsed[i].coeff));
  let mp = parsed[0].xPow; for (let i=1;i<parsed.length;i++) mp = Math.min(mp, parsed[i].xPow);
  if (cg===1&&mp===0) { steps.push({ text: `Pas de facteur commun`, type: 'warning' }); return { result: terms, steps }; }
  const factor = `${cg>1?cg:''}${mp>0?`x${mp>1?'^'+mp:''}`:''}`;
  steps.push({ text: `Facteur commun : ${factor}`, type: 'calc' });
  const inside = parsed.map(p => {
    const nc = p.coeff/cg, np = p.xPow-mp;
    if (np===0) return `${nc}`;
    if (nc===1) return np===1?'x':`x^${np}`; if (nc===-1) return np===1?'-x':`-x^${np}`;
    return np===1?`${nc}x`:`${nc}x^${np}`;
  });
  let is = inside[0]; for (let i=1;i<inside.length;i++) is += inside[i].startsWith('-')?` ${inside[i]}`:` + ${inside[i]}`;
  const r = `${factor}(${is})`; steps.push({ text: r, highlight: true, type: 'result' }); return { result: r, steps };
}

// ==================== FACTORISATION PAR GROUPEMENT ====================
export function solveFactorGrouping(a: number, b: number, c: number, d: number): { result: string; steps: Step[] } {
  // ax + ay + bx + by  →  user gives 4 terms: t1, t2, t3, t4
  // Tries grouping (t1+t2)+(t3+t4) then extracting common factor from each group
  const steps: Step[] = [];
  steps.push({ text: `Termes : ${a} ; ${b} ; ${c} ; ${d}`, type: 'info' });
  steps.push({ text: `Groupement : (${a} + ${b}) + (${c} + ${d})`, type: 'info' });

  // Group 1: a + b — find their GCD
  const g1 = gcd(Math.abs(a), Math.abs(b));
  // Group 2: c + d
  const g2 = gcd(Math.abs(c), Math.abs(d));

  if (g1 === 0 || g2 === 0) {
    steps.push({ text: `Groupement impossible (terme nul)`, type: 'warning' });
    return { result: `${a} + ${b} + ${c} + ${d}`, steps };
  }

  // What's inside each group after factoring
  const in1a = a / g1, in1b = b / g1;
  const in2a = c / g2, in2b = d / g2;

  steps.push({ text: `Groupe 1 : ${a} + ${b} = ${g1}(${in1a} + ${in1b})`, type: 'calc' });
  steps.push({ text: `Groupe 2 : ${c} + ${d} = ${g2}(${in2a} + ${in2b})`, type: 'calc' });

  // Check if (in1a + in1b) === (in2a + in2b) — same factor
  if (in1a === in2a && in1b === in2b) {
    steps.push({ text: `Facteur commun : (${in1a} + ${in1b})`, type: 'calc' });
    const r = `(${in1a} + ${in1b})(${g1} + ${g2})`;
    steps.push({ text: `= ${r}`, highlight: true, type: 'result' });
    return { result: r, steps };
  }

  // Try other groupings: (a+c)+(b+d)
  const g3 = gcd(Math.abs(a), Math.abs(c));
  const g4 = gcd(Math.abs(b), Math.abs(d));
  if (g3 > 0 && g4 > 0) {
    const in3a = a / g3, in3b = c / g3;
    const in4a = b / g4, in4b = d / g4;
    if (in3a === in4a && in3b === in4b) {
      steps.push({ text: `Regroupement alternatif : (${a} + ${c}) + (${b} + ${d})`, type: 'calc' });
      steps.push({ text: `= ${g3}(${in3a} + ${in3b}) + ${g4}(${in4a} + ${in4b})`, type: 'calc' });
      const r = `(${in3a} + ${in3b})(${g3} + ${g4})`;
      steps.push({ text: `= ${r}`, highlight: true, type: 'result' });
      return { result: r, steps };
    }
  }

  steps.push({ text: `Pas de facteur commun trouvé entre les groupes`, type: 'warning' });
  steps.push({ text: `= ${g1}(${in1a} + ${in1b}) + ${g2}(${in2a} + ${in2b})`, highlight: true, type: 'result' });
  return { result: `${g1}(${in1a} + ${in1b}) + ${g2}(${in2a} + ${in2b})`, steps };
}

// Factorisation par groupement — version expression
export function solveFactorGroupingExpr(expr: string): { result: string; steps: Step[] } {
  const steps: Step[] = [{ text: `Factoriser par groupement : ${expr}`, type: 'info' }];
  const cleaned = expr.replace(/\s/g, '').replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4').replace(/-/g, '+-');
  const termStrs = cleaned.split('+').filter(Boolean);
  if (termStrs.length !== 4) {
    steps.push({ text: `Le groupement automatique attend exactement 4 termes`, type: 'warning' });
    return { result: expr, steps };
  }

  type Powers = Record<string, number>;
  interface Term { coeff: number; powers: Powers; raw: string; }

  const parseTerm = (raw: string): Term => {
    const m = raw.match(/^(-?(?:\d+(?:\.\d*)?|\.\d+)?)((?:[a-zA-Z](?:\^\d+)?)*)$/);
    if (!m) throw new Error(`Terme non reconnu : ${raw}`);
    let coeff: number;
    if (m[1] === '' || m[1] === '+') coeff = 1;
    else if (m[1] === '-') coeff = -1;
    else coeff = Number(m[1]);
    if (!Number.isFinite(coeff)) throw new Error(`Coefficient invalide : ${raw}`);
    const powers: Powers = {};
    const re = /([a-zA-Z])(?:\^(\d+))?/g;
    let hit: RegExpExecArray | null;
    while ((hit = re.exec(m[2]))) powers[hit[1]] = (powers[hit[1]] || 0) + Number(hit[2] || 1);
    return { coeff, powers, raw };
  };

  let terms: Term[];
  try { terms = termStrs.map(parseTerm); }
  catch (e: any) { steps.push({ text: e.message, type: 'warning' }); return { result: expr, steps }; }

  const fmtPowers = (powers: Powers): string => Object.keys(powers).sort().map(v => {
    const p = powers[v]; return p === 1 ? v : `${v}^${p}`;
  }).join('');
  const fmtMonomial = (coeff: number, powers: Powers): string => {
    const vars = fmtPowers(powers);
    if (!vars) return `${coeff}`;
    if (coeff === 1) return vars;
    if (coeff === -1) return `-${vars}`;
    return `${coeff}${vars}`;
  };
  const fmtSum = (items: string[]): string => items.reduce((acc, item, i) => i === 0 ? item : acc + (item.startsWith('-') ? ` - ${item.slice(1)}` : ` + ${item}`), '');

  const commonPowers = (a: Powers, b: Powers): Powers => {
    const out: Powers = {};
    for (const v of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const p = Math.min(a[v] || 0, b[v] || 0);
      if (p > 0) out[v] = p;
    }
    return out;
  };
  const subtractPowers = (src: Powers, common: Powers): Powers => {
    const out: Powers = {};
    for (const [v, p] of Object.entries(src)) {
      const left = p - (common[v] || 0);
      if (left > 0) out[v] = left;
    }
    return out;
  };

  interface GroupCandidate { factorCoeff: number; factorPowers: Powers; inside: string; }
  const groupCandidates = (t1: Term, t2: Term): GroupCandidate[] => {
    const coeffGcd = gcd(Math.abs(t1.coeff), Math.abs(t2.coeff));
    const pCommon = commonPowers(t1.powers, t2.powers);
    return [1, -1].map(sign => {
      const factorCoeff = coeffGcd * sign;
      const i1 = fmtMonomial(t1.coeff / factorCoeff, subtractPowers(t1.powers, pCommon));
      const i2 = fmtMonomial(t2.coeff / factorCoeff, subtractPowers(t2.powers, pCommon));
      return { factorCoeff, factorPowers: pCommon, inside: fmtSum([i1, i2]) };
    });
  };

  const factorLabel = (c: GroupCandidate): string => fmtMonomial(c.factorCoeff, c.factorPowers);
  const combineFactors = (a: string, b: string): string => b.startsWith('-') ? `${a} - ${b.slice(1)}` : `${a} + ${b}`;

  const tryGrouping = (g1: [number, number], g2: [number, number]): string | null => {
    const c1 = groupCandidates(terms[g1[0]], terms[g1[1]]);
    const c2 = groupCandidates(terms[g2[0]], terms[g2[1]]);
    for (const a of c1) for (const b of c2) {
      if (a.inside === b.inside) return `(${a.inside})(${combineFactors(factorLabel(a), factorLabel(b))})`;
    }
    return null;
  };

  const groupings: [[number, number], [number, number]][] = [
    [[0,1],[2,3]], [[0,2],[1,3]], [[0,3],[1,2]],
  ];
  for (const [g1, g2] of groupings) {
    const result = tryGrouping(g1, g2);
    if (result) {
      steps.push({ text: `Groupement : (${termStrs[g1[0]]} + ${termStrs[g1[1]]}) + (${termStrs[g2[0]]} + ${termStrs[g2[1]]})`, type: 'calc' });
      steps.push({ text: `Résultat : ${result}`, highlight: true, type: 'result' });
      return { result, steps };
    }
  }

  steps.push({ text: `Aucun groupement simple n'a été reconnu`, type: 'warning' });
  return { result: expr, steps };
}

// ==================== INÉQUATION PRODUIT / QUOTIENT ====================
// Résoudre (ax+b)(cx+d) > 0  ou  (ax+b)/(cx+d) > 0
export function solveProductQuotientIneq(
  a: number, b: number, c: number, d: number,
  sign: string, isQuotient: boolean
): { result: string; steps: Step[] } {
  if (![a,b,c,d].every(Number.isFinite)) throw new Error("Nombre invalide");
  if (!['<','≤','>','≥'].includes(sign)) throw new Error("Signe invalide");
  const steps: Step[] = [];
  const opLabel = isQuotient ? '/' : '×';
  steps.push({ text: `Résoudre (${a}x ${signStr(b)}) ${opLabel} (${c}x ${signStr(d)}) ${sign} 0`, type: 'info' });

  if (isQuotient && c === 0 && d === 0) {
    steps.push({ text: `Le dénominateur est toujours nul : expression non définie`, type: 'warning' });
    return { result: 'S = ∅', steps };
  }

  const numerator = (x: number) => a*x+b;
  const denominator = (x: number) => c*x+d;
  const exprValue = (x: number) => isQuotient ? numerator(x)/denominator(x) : numerator(x)*denominator(x);
  const satisfies = (v: number) => sign==='<'?v<0:sign==='≤'?v<=0:sign==='>'?v>0:v>=0;

  type Critical = { value: number; frac: Frac; numZero: boolean; denZero: boolean };
  const critMap = new Map<string, Critical>();
  const addCritical = (frac: Frac, kind: 'num'|'den') => {
    const key = `${frac.n}/${frac.d}`;
    const existing = critMap.get(key) ?? { value: fracToDecimal(frac), frac, numZero:false, denZero:false };
    if (kind==='num') existing.numZero = true; else existing.denZero = true;
    critMap.set(key, existing);
  };

  if (a !== 0) addCritical(simplifyFrac(-b,a), 'num');
  if (c !== 0) addCritical(simplifyFrac(-d,c), isQuotient ? 'den' : 'num');
  const criticals = [...critMap.values()].sort((x,y)=>x.value-y.value);

  if (a !== 0) steps.push({ text: `Zéro du premier facteur : x = ${fracToStr(simplifyFrac(-b,a),true)}`, type:'calc' });
  if (c !== 0) {
    const r = simplifyFrac(-d,c);
    steps.push({ text: `${isQuotient?'Valeur interdite':'Zéro du second facteur'} : x ${isQuotient?'≠':'='} ${fracToStr(r,true)}`, type:isQuotient?'warning':'calc' });
  }

  if (criticals.length === 0) {
    const den0 = denominator(0);
    if (isQuotient && den0 === 0) return { result:'S = ∅', steps:[...steps,{text:'Expression non définie',type:'warning'}] };
    const ok = satisfies(exprValue(0));
    const result = ok ? 'S = ℝ' : 'S = ∅';
    steps.push({ text: result, highlight:true, type:'result' });
    return { result, steps };
  }

  type Segment = { left:number; right:number; leftClosed:boolean; rightClosed:boolean };
  const segments: Segment[] = [];
  const bounds = [-Infinity, ...criticals.map(c=>c.value), Infinity];
  for (let i=0;i<bounds.length-1;i++) {
    const l=bounds[i], r=bounds[i+1];
    const test = !Number.isFinite(l) ? r-1 : !Number.isFinite(r) ? l+1 : (l+r)/2;
    const den=denominator(test);
    if (isQuotient && Math.abs(den)<1e-12) continue;
    if (satisfies(exprValue(test))) {
      const leftCrit = i>0 ? criticals[i-1] : null;
      const rightCrit = i<criticals.length ? criticals[i] : null;
      const leftClosed = !!leftCrit && !leftCrit.denZero && !['<','>'].includes(sign) && Math.abs(numerator(l))<1e-10;
      const rightClosed = !!rightCrit && !rightCrit.denZero && !['<','>'].includes(sign) && Math.abs(numerator(r))<1e-10;
      segments.push({left:l,right:r,leftClosed,rightClosed});
    }
  }

  // Add isolated zeros that satisfy ≤/≥ but are not already covered.
  if (!['<','>'].includes(sign)) {
    for (const cp of criticals) {
      if (cp.denZero) continue;
      if (!satisfies(0)) continue;
      const covered = segments.some(sg => (sg.left < cp.value && cp.value < sg.right) || (sg.left===cp.value && sg.leftClosed) || (sg.right===cp.value && sg.rightClosed));
      if (!covered && Math.abs(numerator(cp.value))<1e-10) segments.push({left:cp.value,right:cp.value,leftClosed:true,rightClosed:true});
    }
  }

  segments.sort((x,y)=>x.left-y.left || x.right-y.right);
  const merged: Segment[]=[];
  for (const seg of segments) {
    const last=merged[merged.length-1];
    if (last && (seg.left < last.right || (seg.left===last.right && (last.rightClosed || seg.leftClosed)))) {
      if (seg.right > last.right) { last.right=seg.right; last.rightClosed=seg.rightClosed; }
      else if (seg.right===last.right) last.rightClosed = last.rightClosed || seg.rightClosed;
    } else merged.push({...seg});
  }

  const fmtBound=(v:number)=>Number.isFinite(v)?fracToStr(decimalToFrac(v),true):(v<0?'-∞':'+∞');
  const fmtSeg=(seg:Segment)=>{
    if (seg.left===seg.right) return `{${fmtBound(seg.left)}}`;
    const lb=!Number.isFinite(seg.left)?']':seg.leftClosed?'[':']';
    const rb=!Number.isFinite(seg.right)?'[':seg.rightClosed?']':'[';
    return `${lb}${fmtBound(seg.left)} ; ${fmtBound(seg.right)}${rb}`;
  };
  const result = merged.length ? `S = ${merged.map(fmtSeg).join(' ∪ ')}` : 'S = ∅';
  steps.push({ text: result, highlight:true, type:'result' });
  return { result, steps };
}

// ==================== GÉOMÉTRIE PLANE — AIRES & PÉRIMÈTRES ====================
export function solvePlaneArea(shape: string, p: {[k:string]:number}): { result: string; steps: Step[] } {
  const steps: Step[] = [];
  let area = 0, perim = 0;
  const pi = Math.PI;
  const required: Record<string, string[]> = {
    triangle:['base','height'], triangle3:['a','b','c'], rectangle:['l','w'], carre:['c'], cercle:['r'],
    trapeze:['b1','b2','h'], parallelogramme:['base','height'], losange:['d1','d2'], disque_secteur:['r','angle'],
  };
  if (!required[shape]) throw new Error("Figure non reconnue");
  const dims: Record<string, number> = {};
  for (const key of required[shape]) dims[key] = p[key];
  assertPositive(dims);
  if (shape === 'triangle3') {
    const a=p.a,b=p.b,c=p.c;
    if (a+b<=c || a+c<=b || b+c<=a) throw new Error("Ces trois longueurs ne forment pas un triangle");
  }
  if (shape === 'disque_secteur' && p.angle > 360) throw new Error("L'angle du secteur doit être ≤ 360°");

  if (shape === 'triangle') {
    const b = p.base, h = p.height;
    steps.push({ text: `Triangle : base = ${b}, hauteur = ${h}`, type: 'info' });
    area = b * h / 2; perim = 0; // perim needs 3 sides
    steps.push({ text: `Aire = (base × hauteur) / 2 = (${b} × ${h}) / 2 = ${area}`, type: 'calc' });
    if (p.a && p.b && p.c) {
      perim = p.a + p.b + p.c;
      steps.push({ text: `Périmètre = ${p.a} + ${p.b} + ${p.c} = ${perim}`, type: 'calc' });
    }
  } else if (shape === 'triangle3') {
    // From 3 sides using Heron's formula
    const a = p.a, b = p.b, c = p.c;
    steps.push({ text: `Triangle côtés a=${a}, b=${b}, c=${c}`, type: 'info' });
    const s = (a + b + c) / 2;
    steps.push({ text: `Demi-périmètre s = (${a}+${b}+${c})/2 = ${s}`, type: 'calc' });
    const sq = s * (s - a) * (s - b) * (s - c);
    if (sq < 0) { steps.push({ text: `Ce triangle n'existe pas`, type: 'warning' }); return { result: "Impossible", steps }; }
    area = Math.sqrt(sq);
    perim = a + b + c;
    steps.push({ text: `Héron : A = √(s(s-a)(s-b)(s-c))`, type: 'info' });
    steps.push({ text: `A = √(${s}×${s-a}×${s-b}×${s-c}) = √${sq.toFixed(4)} = ${area.toFixed(4)}`, type: 'calc' });
    steps.push({ text: `Périmètre = ${perim}`, type: 'calc' });
  } else if (shape === 'rectangle') {
    const l = p.l, w = p.w;
    steps.push({ text: `Rectangle : L=${l}, l=${w}`, type: 'info' });
    area = l * w; perim = 2 * (l + w);
    steps.push({ text: `Aire = L × l = ${l} × ${w} = ${area}`, type: 'calc' });
    steps.push({ text: `Périmètre = 2(L+l) = 2(${l}+${w}) = ${perim}`, type: 'calc' });
    const d = Math.sqrt(l * l + w * w);
    steps.push({ text: `Diagonale = √(L²+l²) = √${l*l+w*w} ≈ ${d.toFixed(4)}`, type: 'calc' });
  } else if (shape === 'carre') {
    const c = p.c;
    steps.push({ text: `Carré : côté c=${c}`, type: 'info' });
    area = c * c; perim = 4 * c;
    steps.push({ text: `Aire = c² = ${c}² = ${area}`, type: 'calc' });
    steps.push({ text: `Périmètre = 4c = 4×${c} = ${perim}`, type: 'calc' });
    steps.push({ text: `Diagonale = c√2 = ${c}√2 ≈ ${(c*Math.sqrt(2)).toFixed(4)}`, type: 'calc' });
  } else if (shape === 'cercle') {
    const r = p.r;
    steps.push({ text: `Cercle : rayon r=${r}`, type: 'info' });
    area = pi * r * r; perim = 2 * pi * r;
    steps.push({ text: `Aire = πr² = π×${r}² = ${(r*r).toFixed(2)}π ≈ ${area.toFixed(4)}`, type: 'calc' });
    steps.push({ text: `Périmètre = 2πr = 2π×${r} = ${(2*r).toFixed(2)}π ≈ ${perim.toFixed(4)}`, type: 'calc' });
  } else if (shape === 'trapeze') {
    const b1 = p.b1, b2 = p.b2, h = p.h;
    steps.push({ text: `Trapèze : B=${b1}, b=${b2}, h=${h}`, type: 'info' });
    area = (b1 + b2) * h / 2;
    steps.push({ text: `Aire = (B+b)×h/2 = (${b1}+${b2})×${h}/2 = ${b1+b2}×${h}/2 = ${area}`, type: 'calc' });
  } else if (shape === 'parallelogramme') {
    const b = p.base, h = p.height;
    steps.push({ text: `Parallélogramme : base=${b}, hauteur=${h}`, type: 'info' });
    area = b * h;
    steps.push({ text: `Aire = base × hauteur = ${b} × ${h} = ${area}`, type: 'calc' });
  } else if (shape === 'losange') {
    const d1 = p.d1, d2 = p.d2;
    steps.push({ text: `Losange : D=${d1}, d=${d2}`, type: 'info' });
    area = d1 * d2 / 2;
    steps.push({ text: `Aire = D×d/2 = ${d1}×${d2}/2 = ${area}`, type: 'calc' });
    const c = Math.sqrt((d1/2)*(d1/2) + (d2/2)*(d2/2));
    perim = 4 * c;
    steps.push({ text: `Côté = √((D/2)²+(d/2)²) = √${(d1/2)*(d1/2)+(d2/2)*(d2/2)} ≈ ${c.toFixed(4)}`, type: 'calc' });
    steps.push({ text: `Périmètre = 4×côté ≈ ${perim.toFixed(4)}`, type: 'calc' });
  } else if (shape === 'disque_secteur') {
    const r = p.r, angle = p.angle;
    steps.push({ text: `Secteur : r=${r}, angle=${angle}°`, type: 'info' });
    area = pi * r * r * angle / 360;
    const arc = 2 * pi * r * angle / 360;
    steps.push({ text: `Aire = πr²×α/360 = π×${r}²×${angle}/360 ≈ ${area.toFixed(4)}`, type: 'calc' });
    steps.push({ text: `Longueur arc = 2πr×α/360 ≈ ${arc.toFixed(4)}`, type: 'calc' });
    perim = arc + 2 * r;
    steps.push({ text: `Périmètre = arc + 2r ≈ ${perim.toFixed(4)}`, type: 'calc' });
  }

  // Reciprocal Pythagoras check
  if (shape === 'triangle3') {
    const a = p.a, b = p.b, c = p.c;
    const sides = [a, b, c].sort((x, y) => x - y);
    const isRect = Math.abs(sides[2] * sides[2] - sides[0] * sides[0] - sides[1] * sides[1]) < 0.0001;
    steps.push({ text: `Réciproque Pythagore : ${sides[0]}² + ${sides[1]}² = ${sides[0]*sides[0]+sides[1]*sides[1]}, ${sides[2]}² = ${sides[2]*sides[2]} → ${isRect ? 'rectangle ✓' : 'non rectangle'}`, type: 'info' });
  }

  steps.push({ text: `Aire = ${area.toFixed(4)}`, highlight: true, type: 'result' });
  if (perim > 0) steps.push({ text: `Périmètre = ${perim.toFixed(4)}`, highlight: true, type: 'result' });

  return { result: `Aire = ${area.toFixed(2)}${perim > 0 ? `, P = ${perim.toFixed(2)}` : ''}`, steps };
}

// ==================== ESPACE — SOLIDES COMPOSÉS ====================
function spaceVolumeValue(shape: string, p: {[k:string]:number}): number {
  if (shape==='cube') return p.c**3;
  if (shape==='pave') return p.l*p.w*p.h;
  if (shape==='cylindre') return Math.PI*p.r*p.r*p.h;
  if (shape==='cone') return Math.PI*p.r*p.r*p.h/3;
  if (shape==='pyramide') return p.base*p.h/3;
  if (shape==='sphere') return 4*Math.PI*p.r**3/3;
  throw new Error("Solide non reconnu");
}

export function solveCompoundSolid(parts: { shape: string; params: {[k:string]:number} }[]): { result: string; steps: Step[] } {
  if (!parts.length) throw new Error("Ajoutez au moins une partie");
  const steps: Step[] = [{ text: `Solide composé de ${parts.length} partie${parts.length>1?'s':''}`, type: 'info' }];
  let totalV=0;
  parts.forEach((part,i)=>{
    // Reuse the full solver for validation and educational steps.
    solveSpaceVolume(part.shape,part.params);
    const v=spaceVolumeValue(part.shape,part.params);
    totalV+=v;
    steps.push({text:`Partie ${i+1} (${part.shape}) : V ≈ ${v.toFixed(4)}`,type:'calc'});
  });
  steps.push({text:`Volume total ≈ ${totalV.toFixed(4)}`,highlight:true,type:'result'});
  return {result:`V_total ≈ ${totalV.toFixed(2)}`,steps};
}

// ==================== EQUATIONS ====================
export function solveLinearEquation(a: number, b: number, c: number, d: number): { result: string; steps: Step[] } {
  assertFiniteNumbers(a,b,c,d);
  const steps: Step[] = [];
  steps.push({ text: `${a}x ${signStr(b)} = ${c}x ${signStr(d)}`, type: 'info' });
  const co = a-c, ct = d-b;
  steps.push({ text: `${co}x = ${ct}`, type: 'calc' });
  if (co===0) { const r = ct===0?"S = ℝ":"S = ∅"; steps.push({ text: r, highlight: true, type: 'result' }); return { result: r, steps }; }
  const sol = simplifyFrac(ct, co);
  steps.push({ text: `x = ${ct}/${co} = ${fracToStr(sol,true)}`, type: 'calc' });
  // Vérification
  const lhs = a*fracToDecimal(sol)+b, rhs = c*fracToDecimal(sol)+d;
  steps.push({ text: `Vérif : ${lhs.toFixed(4)} = ${rhs.toFixed(4)} ✓`, type: 'info' });
  steps.push({ text: `x = ${fracToStr(sol,true)}`, highlight: true, type: 'result' });
  return { result: `x = ${fracToStr(sol,true)}`, steps };
}

export function solveQuadraticEquation(a: number, b: number, c: number): { result: string; steps: Step[] } {
  assertFiniteNumbers(a,b,c);
  const steps: Step[] = [];
  steps.push({ text: `${a}x² ${signStr(b)}x ${signStr(c)} = 0`, type: 'info' });
  if (a === 0) {
    steps.push({ text: `a = 0 : ce n'est pas une équation du second degré`, type:'warning' });
    if (b === 0) {
      const result = c === 0 ? 'S = ℝ' : 'S = ∅';
      steps.push({text:result,highlight:true,type:'result'}); return {result,steps};
    }
    const x=simplifyFrac(-c,b); const result=`S = {${fracToStr(x,true)}}`;
    steps.push({text:`${b}x ${signStr(c)} = 0 → x = ${fracToStr(x,true)}`,type:'calc'});
    steps.push({text:result,highlight:true,type:'result'}); return {result,steps};
  }
  if (c === 0) {
    steps.push({ text: `c = 0 → on factorise par x`, type: 'calc' });
    steps.push({ text: `x(${a}x ${signStr(b)}) = 0`, type: 'calc' });
    const x2 = simplifyFrac(-b, a);
    if (x2.n===0) { steps.push({text:'S = {0}',highlight:true,type:'result'}); return {result:'S = {0}',steps}; }
    const [small,large] = 0<fracToDecimal(x2)?[{n:0,d:1},x2]:[x2,{n:0,d:1}];
    const result=`S = {${fracToStr(small,true)} ; ${fracToStr(large,true)}}`;
    steps.push({text:result,highlight:true,type:'result'}); return {result,steps};
  }
  const disc = b*b-4*a*c;
  steps.push({ text: `Δ = b² - 4ac = ${b*b} - ${4*a*c} = ${disc}`, type: 'calc' });
  if (disc<0) { steps.push({ text: `Δ < 0 → S = ∅`, highlight: true, type: 'result' }); return { result: "S = ∅", steps }; }
  if (disc===0) { const x0 = simplifyFrac(-b,2*a); const result=`S = {${fracToStr(x0,true)}}`; steps.push({ text: `Δ = 0 → x₀ = ${fracToStr(x0,true)}`, type: 'calc' }); steps.push({ text:result, highlight:true,type:'result'}); return {result,steps}; }
  const sd = Math.sqrt(disc); steps.push({ text: `Δ > 0 → deux solutions`, type: 'info' });
  if (Number.isInteger(sd)) {
    const x1=simplifyFrac(-b+sd,2*a), x2=simplifyFrac(-b-sd,2*a);
    const [small,large]=fracToDecimal(x1)<fracToDecimal(x2)?[x1,x2]:[x2,x1];
    steps.push({text:`√Δ = ${sd}`,type:'calc'});
    steps.push({text:`x₁ = ${fracToStr(small,true)}, x₂ = ${fracToStr(large,true)}`,type:'calc'});
    const result=`S = {${fracToStr(small,true)} ; ${fracToStr(large,true)}}`;
    steps.push({text:result,highlight:true,type:'result'}); return {result,steps};
  }
  const sr=simplifyRadical(disc), x1=(-b-sd)/(2*a), x2=(-b+sd)/(2*a);
  const [small,large]=x1<x2?[x1,x2]:[x2,x1];
  steps.push({text:`√Δ = ${radToStr(sr)}`,type:'calc'});
  steps.push({text:`x₁ ≈ ${small.toFixed(6)}, x₂ ≈ ${large.toFixed(6)}`,type:'calc'});
  const result=`x₁ ≈ ${small.toFixed(4)}, x₂ ≈ ${large.toFixed(4)}`;
  steps.push({text:result,highlight:true,type:'result'}); return {result,steps};
}

export function solveSystem2x2(a1: number, b1: number, c1: number, a2: number, b2: number, c2: number): { result: string; steps: Step[] } {
  assertFiniteNumbers(a1,b1,c1,a2,b2,c2);
  const steps: Step[] = [];
  steps.push({ text: `${a1}x + ${b1}y = ${c1}`, type: 'calc' });
  steps.push({ text: `${a2}x + ${b2}y = ${c2}`, type: 'calc' });
  const det = a1*b2-a2*b1;
  steps.push({ text: `D = ${a1}×${b2} - ${a2}×${b1} = ${det}`, type: 'calc' });
  if (Math.abs(det) < 1e-12) {
    const sameLine = Math.abs(a1*b2-a2*b1)<1e-12 && Math.abs(a1*c2-a2*c1)<1e-12 && Math.abs(b1*c2-b2*c1)<1e-12;
    const result = sameLine ? 'Infinité de solutions' : 'S = ∅';
    steps.push({text: sameLine?'Les deux équations représentent la même droite':'Les deux équations sont incompatibles',type:'info'});
    steps.push({text:result,highlight:true,type:'result'});
    return {result,steps};
  }
  const dx=c1*b2-c2*b1, dy=a1*c2-a2*c1;
  const x=simplifyFrac(dx,det), y=simplifyFrac(dy,det);
  steps.push({text:`Dₓ = ${dx}, Dᵧ = ${dy}`,type:'calc'});
  steps.push({text:`x = ${fracToStr(x,true)}, y = ${fracToStr(y,true)}`,highlight:true,type:'result'});
  return {result:`x = ${fracToStr(x,true)}, y = ${fracToStr(y,true)}`,steps};
}

export function solveLinearInequation(a: number, b: number, sign: string, c: number, d: number): { result: string; steps: Step[] } {
  assertFiniteNumbers(a,b,c,d); if (!['<','≤','>','≥'].includes(sign)) throw new Error("Signe invalide");
  const steps: Step[] = [];
  steps.push({ text: `${a}x ${signStr(b)} ${sign} ${c}x ${signStr(d)}`, type: 'info' });
  const co = a-c, ct = d-b; steps.push({ text: `${co}x ${sign} ${ct}`, type: 'calc' });
  if (co===0) { const v = (sign==='<'&&0<ct)||(sign==='>'&&0>ct)||(sign==='≤'&&0<=ct)||(sign==='≥'&&0>=ct); const r = v?"S = ℝ":"S = ∅"; steps.push({ text: r, highlight: true, type: 'result' }); return { result: r, steps }; }
  const sol = simplifyFrac(ct,co);
  let ns = sign; if (co<0) { ns = sign==='<'?'>':sign==='>'?'<':sign==='≤'?'≥':'≤'; steps.push({ text: `Div par ${co} (négatif) → inversion`, type: 'warning' }); }
  let iv: string; if (ns==='<') iv = `]-∞ ; ${fracToStr(sol,true)}[`; else if (ns==='≤') iv = `]-∞ ; ${fracToStr(sol,true)}]`; else if (ns==='>') iv = `]${fracToStr(sol,true)} ; +∞[`; else iv = `[${fracToStr(sol,true)} ; +∞[`;
  steps.push({ text: `x ${ns} ${fracToStr(sol,true)}`, type: 'calc' });
  steps.push({ text: `S = ${iv}`, highlight: true, type: 'result' }); return { result: `S = ${iv}`, steps };
}

export function solveIneqSystem2x2(a1: number, b1: number, s1: string, c1: number, a2: number, b2: number, s2: string, c2: number): { result: string; steps: Step[] } {
  assertFiniteNumbers(a1,b1,c1,a2,b2,c2);
  if (![s1,s2].every(s => ['<','≤','>','≥'].includes(s))) throw new Error("Signe d'inéquation invalide");
  const steps: Step[] = [], res: string[] = [];
  steps.push({ text: `(1) ${a1}x + ${b1}y ${s1} ${c1}`, type: 'calc' }); steps.push({ text: `(2) ${a2}x + ${b2}y ${s2} ${c2}`, type: 'calc' });
  const process = (a: number, b: number, s: string, c: number, lbl: string) => {
    if (b===0&&a===0) { const v = (s==='<'&&0<c)||(s==='>'&&0>c)||(s==='≤'&&0<=c)||(s==='≥'&&0>=c); res.push(v?'tout':'aucun'); return; }
    if (b===0) { let ns = s; if (a<0) { ns = s==='<'?'>':s==='>'?'<':s==='≤'?'≥':'≤'; } const bd = simplifyFrac(c,a); res.push(`x ${ns} ${fracToStr(bd,true)}`); steps.push({ text: `${lbl} → x ${ns} ${fracToStr(bd,true)}`, type: 'calc' }); return; }
    let ns = s; if (b<0) { ns = s==='<'?'>':s==='>'?'<':s==='≤'?'≥':'≤'; steps.push({ text: `${lbl} : div par ${b} (négatif) → inversion`, type: 'calc' }); }
    const cp = simplifyFrac(c,b), xc = simplifyFrac(-a,b);
    const xs = fracToDecimal(xc)>=0?`+ ${fracToStr(xc,true)}x`:`- ${fracToStr({n:-xc.n,d:xc.d},true)}x`;
    const expr = `${fracToStr(cp,true)} ${xs}`;
    steps.push({ text: `${lbl} → y ${ns} ${expr}`, highlight: true, type: 'result' }); res.push(`y ${ns} ${expr}`);
  };
  process(a1,b1,s1,c1,'(1)'); process(a2,b2,s2,c2,'(2)');
  const det = a1*b2-a2*b1;
  if (det!==0) { const xi = simplifyFrac(c1*b2-c2*b1,det), yi = simplifyFrac(a1*c2-a2*c1,det); steps.push({ text: `Intersection : (${fracToStr(xi,true)} ; ${fracToStr(yi,true)})`, type: 'info' }); }
  else steps.push({ text: `Frontières parallèles`, type: 'info' });
  const fr = res.join(' et '); steps.push({ text: `S = { (x,y) | ${fr} }`, highlight: true, type: 'result' }); return { result: fr, steps };
}

// ==================== GEOMETRY ====================
export function solvePythagoras(a: number, b: number, findHyp: boolean): { result: string; steps: Step[] } {
  assertFiniteNumbers(a,b);
  assertPositive({ 'Le premier côté': a, 'Le second côté': b });
  const steps: Step[] = [];
  if (findHyp) {
    const c2 = a*a+b*b;
    steps.push({ text: `c² = ${a}² + ${b}² = ${c2}`, type: 'calc' });
    const c = Math.sqrt(c2);
    if (Number.isInteger(c)) { steps.push({ text: `c = ${c}`, highlight: true, type: 'result' }); return { result: `c = ${c}`, steps }; }
    const sr = simplifyRadical(c2);
    steps.push({ text: `c = ${radToStr(sr)} ≈ ${c.toFixed(4)}`, highlight: true, type: 'result' }); return { result: `c = ${radToStr(sr)}`, steps };
  }
  const a2 = a*a-b*b;
  if (a2<=0) { steps.push({ text: `Impossible : l'hypoténuse doit être strictement plus grande que l'autre côté`, type: 'warning' }); return { result: "Impossible", steps }; }
  steps.push({ text: `côté² = ${a}² - ${b}² = ${a2}`, type: 'calc' });
  const av = Math.sqrt(a2);
  if (Number.isInteger(av)) { steps.push({ text: `côté = ${av}`, highlight: true, type: 'result' }); return { result: `côté = ${av}`, steps }; }
  const sr = simplifyRadical(a2);
  steps.push({ text: `côté = ${radToStr(sr)} ≈ ${av.toFixed(4)}`, highlight: true, type: 'result' }); return { result: `côté = ${radToStr(sr)}`, steps };
}

export function solveThales(a: number, b: number, c: number): { result: string; steps: Step[] } {
  assertFiniteNumbers(a,b,c);
  if (a===0) throw new Error("Le premier terme du rapport ne peut pas être nul");
  const steps: Step[] = [];
  steps.push({ text: `${a}/${b} = ${c}/x → x = (${b}×${c})/${a}`, type: 'calc' });
  const x = simplifyFrac(b*c, a);
  steps.push({ text: `x = ${fracToStr(x,true)}${x.d!==1?` ≈ ${fracToDecimal(x).toFixed(4)}`:''}`, highlight: true, type: 'result' });
  return { result: `x = ${fracToStr(x,true)}`, steps };
}

export function solveTrig(type: string, angle: number|null, opp: number|null, adj: number|null, hyp: number|null): { result: string; steps: Step[] } {
  const steps: Step[] = [], toR = (deg:number)=>deg*Math.PI/180, toD=(rad:number)=>rad*180/Math.PI;
  if (!['sin','cos','tan'].includes(type)) throw new Error("Fonction trigonométrique invalide");
  for (const [name,value] of [['angle',angle],['opposé',opp],['adjacent',adj],['hypoténuse',hyp]] as const) {
    if (value!==null && !Number.isFinite(value)) throw new Error(`${name} invalide`);
  }
  if (angle!==null && (angle<=0 || angle>=90)) throw new Error("Dans un triangle rectangle, l'angle aigu doit être compris entre 0° et 90°");
  if (opp!==null && opp<=0) throw new Error("Le côté opposé doit être positif");
  if (adj!==null && adj<=0) throw new Error("Le côté adjacent doit être positif");
  if (hyp!==null && hyp<=0) throw new Error("L'hypoténuse doit être positive");
  steps.push({ text: `${type}(α) = ${type==='sin'?'opposé / hypoténuse':type==='cos'?'adjacent / hypoténuse':'opposé / adjacent'}`, type:'info' });

  if (type==='sin') {
    if (angle!==null&&hyp!==null) { const v=hyp*Math.sin(toR(angle)); steps.push({text:`opposé = ${hyp}×sin(${angle}°) ≈ ${v.toFixed(4)}`,highlight:true,type:'result'}); return {result:`${v.toFixed(4)}`,steps}; }
    if (opp!==null&&hyp!==null) { if (opp>hyp) throw new Error("Le côté opposé ne peut pas dépasser l'hypoténuse"); const ratio=opp/hyp; const v=toD(Math.asin(ratio)); steps.push({text:`α = arcsin(${opp}/${hyp}) ≈ ${v.toFixed(2)}°`,highlight:true,type:'result'}); return {result:`${v.toFixed(2)}°`,steps}; }
    if (angle!==null&&opp!==null) { const sn=Math.sin(toR(angle)); if (Math.abs(sn)<1e-12) throw new Error("Calcul impossible"); const v=opp/sn; steps.push({text:`hypoténuse = ${opp}/sin(${angle}°) ≈ ${v.toFixed(4)}`,highlight:true,type:'result'}); return {result:`${v.toFixed(4)}`,steps}; }
  }
  if (type==='cos') {
    if (angle!==null&&hyp!==null) { const v=hyp*Math.cos(toR(angle)); steps.push({text:`adjacent = ${hyp}×cos(${angle}°) ≈ ${v.toFixed(4)}`,highlight:true,type:'result'}); return {result:`${v.toFixed(4)}`,steps}; }
    if (adj!==null&&hyp!==null) { if (adj>hyp) throw new Error("Le côté adjacent ne peut pas dépasser l'hypoténuse"); const v=toD(Math.acos(adj/hyp)); steps.push({text:`α = arccos(${adj}/${hyp}) ≈ ${v.toFixed(2)}°`,highlight:true,type:'result'}); return {result:`${v.toFixed(2)}°`,steps}; }
    if (angle!==null&&adj!==null) { const cs=Math.cos(toR(angle)); if (Math.abs(cs)<1e-12) throw new Error("Calcul impossible"); const v=adj/cs; steps.push({text:`hypoténuse = ${adj}/cos(${angle}°) ≈ ${v.toFixed(4)}`,highlight:true,type:'result'}); return {result:`${v.toFixed(4)}`,steps}; }
  }
  if (type==='tan') {
    if (angle!==null&&adj!==null) { const v=adj*Math.tan(toR(angle)); steps.push({text:`opposé = ${adj}×tan(${angle}°) ≈ ${v.toFixed(4)}`,highlight:true,type:'result'}); return {result:`${v.toFixed(4)}`,steps}; }
    if (opp!==null&&adj!==null) { const v=toD(Math.atan(opp/adj)); steps.push({text:`α = arctan(${opp}/${adj}) ≈ ${v.toFixed(2)}°`,highlight:true,type:'result'}); return {result:`${v.toFixed(2)}°`,steps}; }
    if (angle!==null&&opp!==null) { const tn=Math.tan(toR(angle)); if (Math.abs(tn)<1e-12) throw new Error("Calcul impossible"); const v=opp/tn; steps.push({text:`adjacent = ${opp}/tan(${angle}°) ≈ ${v.toFixed(4)}`,highlight:true,type:'result'}); return {result:`${v.toFixed(4)}`,steps}; }
  }
  steps.push({ text: `Données insuffisantes : renseignez deux informations compatibles`, type:'warning' });
  return { result:'Insuffisant', steps };
}

// ==================== STATISTICS ====================
export interface StatsResult {
  result: string;
  steps: Step[];
  table: { value: number; freq: number; relFreq: number; cumFreq: number; cumRelFreq: number }[];
  mean: number; median: number; mode: number[]; variance: number; stdDev: number;
  q1: number; q3: number; iqr: number; cv: number; range: number; N: number;
}

export function solveStatistics(values: number[], frequencies?: number[]): StatsResult {
  const steps: Step[] = [];
  if (!values.length) throw new Error("Ajoutez au moins une valeur");
  if (!values.every(Number.isFinite)) throw new Error("Une valeur statistique est invalide");
  if (frequencies && frequencies.length !== values.length) throw new Error("Il faut un effectif pour chaque valeur");
  const rawFreq = frequencies ?? values.map(()=>1);
  if (!rawFreq.every(v => Number.isInteger(v) && v >= 0)) throw new Error("Les effectifs doivent être des entiers positifs ou nuls");
  if (rawFreq.every(v=>v===0)) throw new Error("L'effectif total doit être supérieur à 0");

  const grouped = new Map<number, number>();
  values.forEach((value,i)=>grouped.set(value,(grouped.get(value)||0)+rawFreq[i]));
  const pairs=[...grouped.entries()].filter(([,f])=>f>0).map(([v,f])=>({v,f})).sort((a,b)=>a.v-b.v);
  const N=pairs.reduce((sum,p)=>sum+p.f,0);
  const sum=pairs.reduce((acc,p)=>acc+p.v*p.f,0);
  const mean=sum/N;
  steps.push({text:`Effectif total N = ${N}`,type:'calc'});
  steps.push({text:`Moyenne x̄ = Σ(xᵢnᵢ)/N = ${sum}/${N} = ${mean.toFixed(4)}`,highlight:true,type:'result'});

  let cum=0;
  const table: StatsResult['table']=pairs.map(p=>{
    cum+=p.f;
    return {value:p.v,freq:p.f,relFreq:p.f/N,cumFreq:cum,cumRelFreq:cum/N};
  });

  const valueAtRank=(rank:number):number=>{
    if (rank<1 || rank>N) throw new Error("Rang statistique invalide");
    let c=0;
    for (const p of pairs) { c+=p.f; if (c>=rank) return p.v; }
    return pairs[pairs.length-1].v;
  };
  const median = N%2===1 ? valueAtRank((N+1)/2) : (valueAtRank(N/2)+valueAtRank(N/2+1))/2;
  const q1=valueAtRank(Math.ceil(N/4));
  const q3=valueAtRank(Math.ceil(3*N/4));
  const iqr=q3-q1;
  steps.push({text:`Médiane = ${median}`,highlight:true,type:'result'});
  steps.push({text:`Q₁ = ${q1} (rang ${Math.ceil(N/4)})`,type:'calc'});
  steps.push({text:`Q₃ = ${q3} (rang ${Math.ceil(3*N/4)})`,type:'calc'});

  const vSum=pairs.reduce((acc,p)=>acc+p.f*Math.pow(p.v-mean,2),0);
  const variance=vSum/N, stdDev=Math.sqrt(variance), cv=mean!==0?stdDev/Math.abs(mean)*100:0;
  steps.push({text:`Variance σ² = ${variance.toFixed(4)}`,type:'calc'});
  steps.push({text:`Écart-type σ = ${stdDev.toFixed(4)}`,highlight:true,type:'result'});

  const maxFreq=Math.max(...pairs.map(p=>p.f));
  const modes=pairs.filter(p=>p.f===maxFreq).map(p=>p.v);
  const meaningfulModes = modes.length===pairs.length && pairs.length>1 ? [] : modes;
  steps.push({text: meaningfulModes.length ? `Mode = ${meaningfulModes.join(', ')} (effectif ${maxFreq})` : `Aucun mode dominant`,type:'result'});
  const range=pairs[pairs.length-1].v-pairs[0].v;
  steps.push({text:`Étendue = ${range}`,type:'calc'});

  return {result:`x̄=${mean.toFixed(2)}, Med=${median}, σ=${stdDev.toFixed(2)}, Q₁=${q1}, Q₃=${q3}`,steps,table,mean,median,mode:meaningfulModes,variance,stdDev,q1,q3,iqr,cv,range,N};
}

export function solveProportionality(x1: number, y1: number, x2: number, y2: number|null): { result: string; steps: Step[] } {
  assertFiniteNumbers(x1,y1,x2);
  if (y2!==null && !Number.isFinite(y2)) throw new Error("Nombre invalide");
  if (x1===0) throw new Error("La première valeur x₁ ne peut pas être nulle");
  const steps: Step[] = [];
  if (y2===null) {
    const k=y1/x1, r=x2*k;
    const fr=simplifyFrac(y1*x2,x1);
    steps.push({text:`Coefficient k = ${y1}/${x1} = ${k.toFixed(4)}`,type:'calc'});
    steps.push({text:`y₂ = ${x2} × k = ${fracToStr(fr,true)}${fr.d!==1?` ≈ ${r.toFixed(4)}`:''}`,highlight:true,type:'result'});
    return {result:`y₂ = ${fracToStr(fr,true)}`,steps};
  }
  if (x2===0) throw new Error("x₂ ne peut pas être nul pour comparer les coefficients");
  const r1=y1/x1, r2=y2/x2, proportional=Math.abs(r1-r2)<1e-10;
  steps.push({text:`k₁ = ${r1.toFixed(6)}, k₂ = ${r2.toFixed(6)}`,type:'calc'});
  steps.push({text:proportional?`Les deux rapports sont égaux`:`Les deux rapports sont différents`,highlight:true,type:'result'});
  return {result:proportional?`Proportionnel (k=${r1.toFixed(4)})`:'Non proportionnel',steps};
}

export function solvePercentage(type: string, value: number, percent: number): { result: string; steps: Step[] } {
  assertFiniteNumbers(value, percent);
  const steps: Step[] = [];
  if (type==='of') { const r = percent/100*value; steps.push({ text: `${percent}% de ${value} = ${r}`, highlight: true, type: 'result' }); return { result: `${r}`, steps }; }
  if (type==='increase') { const i = percent/100*value, r = value+i; steps.push({ text: `${value} + ${percent}% = ${value} + ${i} = ${r}`, type: 'calc' }); steps.push({ text: `${r}`, highlight: true, type: 'result' }); return { result: `${r}`, steps }; }
  if (type==='decrease') { const d = percent/100*value, r = value-d; steps.push({ text: `${value} - ${percent}% = ${value} - ${d} = ${r}`, type: 'calc' }); steps.push({ text: `${r}`, highlight: true, type: 'result' }); return { result: `${r}`, steps }; }
  if (type==='whatPercent') {
    if (value===0) throw new Error("Le total ne peut pas être nul");
    const r = percent/value*100; steps.push({ text: `${percent}/${value} × 100 = ${r.toFixed(2)}%`, type: 'calc' }); steps.push({ text: `${r.toFixed(2)}%`, highlight: true, type: 'result' }); return { result: `${r.toFixed(2)}%`, steps };
  }
  throw new Error("Type de pourcentage invalide");
}

// ==================== POWERS ====================
export function solvePowers(base: number, exp: number): { result: string; steps: Step[] } {
  assertFiniteNumbers(base, exp);
  if (!Number.isInteger(exp)) throw new Error("L'exposant doit être un entier");
  const steps: Step[] = [];
  steps.push({ text: `${base}^${exp}`, type: 'info' });
  if (base===0 && exp===0) { steps.push({text:'0⁰ est indéterminé dans ce contexte',type:'warning'}); return {result:'Indéterminé',steps}; }
  if (base===0 && exp<0) throw new Error("0 ne peut pas avoir un exposant négatif");
  if (exp===0) { steps.push({ text: `= 1`, highlight: true, type: 'result' }); return { result: "1", steps }; }
  const bf = decimalToFrac(base);
  const absExp=Math.abs(exp);
  const rn=Math.pow(bf.n,absExp), rd=Math.pow(bf.d,absExp);
  const rf=exp>0?simplifyFrac(rn,rd):simplifyFrac(rd,rn);
  steps.push({text:`(${fracToStr(bf,true)})^${exp} = ${fracToStr(rf,true)}`,highlight:true,type:'result'});
  if (rf.d!==1) steps.push({text:`≈ ${fracToDecimal(rf).toFixed(8)}`,type:'info'});
  return {result:fracToStr(rf,true),steps};
}

export function solvePowerRules(a: number, m: number, n: number, b: number, op: string): { result: string; steps: Step[] } {
  assertFiniteNumbers(a,m,n,b);
  if (!Number.isInteger(m)||!Number.isInteger(n)) throw new Error("Les exposants doivent être des entiers");
  if (!['×','÷','^'].includes(op)) throw new Error("Opération invalide");
  const steps: Step[] = [];
  if (op==='×'&&a===b) {
    const exponent=m+n; const r=solvePowers(a,exponent);
    steps.push({text:`${a}^${m} × ${a}^${n} = ${a}^${exponent}`,type:'calc'},...r.steps.filter(x=>x.type==='result'));
    return {result:`${a}^${exponent} = ${r.result}`,steps};
  }
  if (op==='÷'&&a===b) {
    if (a===0) throw new Error("Division par zéro");
    const exponent=m-n; const r=solvePowers(a,exponent);
    steps.push({text:`${a}^${m} ÷ ${a}^${n} = ${a}^${exponent}`,type:'calc'},...r.steps.filter(x=>x.type==='result'));
    return {result:r.result,steps};
  }
  if (op==='^') {
    const exponent=m*n; const r=solvePowers(a,exponent);
    steps.push({text:`(${a}^${m})^${n} = ${a}^${exponent}`,type:'calc'},...r.steps.filter(x=>x.type==='result'));
    return {result:`${a}^${exponent} = ${r.result}`,steps};
  }
  const r1=Math.pow(a,m), r2=Math.pow(b,n);
  if (!Number.isFinite(r1)||!Number.isFinite(r2)) throw new Error("Résultat hors limite");
  if (op==='×') { const result=r1*r2; steps.push({text:`${r1} × ${r2} = ${result}`,highlight:true,type:'result'}); return {result:`${result}`,steps}; }
  if (r2===0) throw new Error("Division par zéro");
  const f=simplifyFrac(r1,r2); steps.push({text:`${r1} ÷ ${r2} = ${fracToStr(f,true)}`,highlight:true,type:'result'}); return {result:fracToStr(f,true),steps};
}

// ==================== VECTORS ====================
export function solveVectorCoords(xA: number, yA: number, xB: number, yB: number): { result: string; steps: Step[] } {
  assertFiniteNumbers(xA,yA,xB,yB);
  const steps: Step[] = [], vx = xB-xA, vy = yB-yA;
  steps.push({ text: `AB = (${xB}-${xA} ; ${yB}-${yA}) = (${vx} ; ${vy})`, type: 'calc' });
  // Norme
  const n2 = vx*vx+vy*vy, n = Math.sqrt(n2);
  const sr = simplifyRadical(n2);
  steps.push({ text: `||AB|| = √(${vx}²+${vy}²) = √${n2} = ${Number.isInteger(n)?n:radToStr(sr)} ≈ ${n.toFixed(4)}`, type: 'calc' });
  steps.push({ text: `AB(${vx} ; ${vy})`, highlight: true, type: 'result' });
  return { result: `AB(${vx} ; ${vy}), ||AB|| ≈ ${n.toFixed(4)}`, steps };
}

export function solveVectorNorm(x: number, y: number): { result: string; steps: Step[] } {
  assertFiniteNumbers(x,y);
  const steps: Step[] = [], s = x*x+y*y;
  steps.push({ text: `||v|| = √(${x}²+${y}²) = √${s}`, type: 'calc' });
  const n = Math.sqrt(s);
  if (Number.isInteger(n)) { steps.push({ text: `= ${n}`, highlight: true, type: 'result' }); return { result: `${n}`, steps }; }
  const sr = simplifyRadical(s);
  steps.push({ text: `= ${radToStr(sr)} ≈ ${n.toFixed(6)}`, highlight: true, type: 'result' }); return { result: radToStr(sr), steps };
}

export function solveMidpoint(xA: number, yA: number, xB: number, yB: number): { result: string; steps: Step[] } {
  assertFiniteNumbers(xA,yA,xB,yB);
  const steps: Step[] = [], mx = (xA+xB)/2, my = (yA+yB)/2;
  steps.push({ text: `M = ((${xA}+${xB})/2 ; (${yA}+${yB})/2) = (${mx} ; ${my})`, type: 'calc' });
  steps.push({ text: `M(${mx} ; ${my})`, highlight: true, type: 'result' });
  return { result: `M(${mx} ; ${my})`, steps };
}

// ==================== SPACE GEOMETRY ====================
export function solveSpaceVolume(shape: string, p: {[k:string]:number}): { result: string; steps: Step[] } {
  const steps: Step[] = []; let V = 0, A = 0, showA = true;
  const pi = Math.PI;
  const required: Record<string, string[]> = { cube:['c'], pave:['l','w','h'], cylindre:['r','h'], cone:['r','h'], pyramide:['base','h'], sphere:['r'] };
  if (!required[shape]) throw new Error("Solide non reconnu");
  const dims: Record<string, number> = {};
  for (const key of required[shape]) dims[key] = p[key];
  assertPositive(dims);
  if (shape==='cube') {
    const c = p.c; V = c*c*c; A = 6*c*c;
    steps.push({ text: `Cube, arête c = ${c}`, type: 'info' });
    steps.push({ text: `V = c³ = ${c}³ = ${V}`, type: 'calc' });
    steps.push({ text: `A = 6c² = 6×${c*c} = ${A}`, type: 'calc' });
    steps.push({ text: `Diagonale d = c√3 = ${c}√3 ≈ ${(c*Math.sqrt(3)).toFixed(4)}`, type: 'calc' });
  } else if (shape==='pave') {
    const l=p.l, w=p.w, h=p.h; V = l*w*h; A = 2*(l*w+l*h+w*h);
    steps.push({ text: `Pavé L=${l}, l=${w}, h=${h}`, type: 'info' });
    steps.push({ text: `V = L×l×h = ${V}`, type: 'calc' });
    steps.push({ text: `A = 2(Ll+Lh+lh) = 2(${l*w}+${l*h}+${w*h}) = ${A}`, type: 'calc' });
    const d = Math.sqrt(l*l+w*w+h*h);
    steps.push({ text: `Diag = √(L²+l²+h²) = √${l*l+w*w+h*h} ≈ ${d.toFixed(4)}`, type: 'calc' });
  } else if (shape==='cylindre') {
    const r=p.r, h=p.h; V = pi*r*r*h; A = 2*pi*r*(r+h);
    steps.push({ text: `Cylindre r=${r}, h=${h}`, type: 'info' });
    steps.push({ text: `V = πr²h = π×${r*r}×${h} = ${(r*r*h).toFixed(2)}π ≈ ${V.toFixed(4)}`, type: 'calc' });
    steps.push({ text: `A_lat = 2πrh = ${(2*pi*r*h).toFixed(4)}`, type: 'calc' });
    steps.push({ text: `A_tot = 2πr(r+h) = ${A.toFixed(4)}`, type: 'calc' });
  } else if (shape==='cone') {
    const r=p.r, h=p.h; V = pi*r*r*h/3; const g = Math.sqrt(r*r+h*h); A = pi*r*(r+g);
    steps.push({ text: `Cône r=${r}, h=${h}`, type: 'info' });
    steps.push({ text: `V = πr²h/3 = ${(r*r*h/3).toFixed(4)}π ≈ ${V.toFixed(4)}`, type: 'calc' });
    steps.push({ text: `Apothème g = √(r²+h²) = √${r*r+h*h} ≈ ${g.toFixed(4)}`, type: 'calc' });
    steps.push({ text: `A_lat = πrg ≈ ${(pi*r*g).toFixed(4)}`, type: 'calc' });
    steps.push({ text: `A_tot = πr(r+g) ≈ ${A.toFixed(4)}`, type: 'calc' });
  } else if (shape==='pyramide') {
    const b=p.base, h=p.h; V = b*h/3; showA = false;
    steps.push({ text: `Pyramide, Aire_base=${b}, h=${h}`, type: 'info' });
    steps.push({ text: `V = (1/3)×B×h = (1/3)×${b}×${h} = ${V.toFixed(4)}`, type: 'calc' });
  } else if (shape==='sphere') {
    const r=p.r; V = 4*pi*r*r*r/3; A = 4*pi*r*r;
    steps.push({ text: `Sphère r=${r}`, type: 'info' });
    steps.push({ text: `V = (4/3)πr³ = (4/3)π×${r*r*r} = ${(4*r*r*r/3).toFixed(4)}π ≈ ${V.toFixed(4)}`, type: 'calc' });
    steps.push({ text: `A = 4πr² = 4π×${r*r} = ${(4*r*r).toFixed(2)}π ≈ ${A.toFixed(4)}`, type: 'calc' });
  }
  steps.push({ text: `V ≈ ${V.toFixed(4)}`, highlight: true, type: 'result' });
  if (showA && A > 0) steps.push({ text: `A ≈ ${A.toFixed(4)}`, highlight: true, type: 'result' });
  return { result: `V ≈ ${V.toFixed(2)}${showA&&A>0?`, A ≈ ${A.toFixed(2)}`:''}`, steps };
}
