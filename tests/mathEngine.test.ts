import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseFrac, fracToStr, solveComplexFractionExpr, solveFractionOp, solveGCDLCM,
  solveRationalize, solveRadicalSimplify, solveRadicalCompare, solveAbsoluteEquation,
  solveAbsoluteInequation, solveDevelopment, solveFactorization, solveFactorGroupingExpr,
  solveSimplifyRational, solveProductQuotientIneq, solveLinearEquation, solveQuadraticEquation,
  solveSystem2x2, solveLinearInequation, solvePythagoras, solveThales, solveTrig,
  solveStatistics, solveProportionality, solvePercentage, solvePowers, solveVectorCoords,
  solveVectorNorm, solveMidpoint, solvePlaneArea, solveSpaceVolume,
} from '../src/utils/mathEngine.ts';

const result = (x: {result:string}) => x.result;
const throws = (fn: () => unknown) => assert.throws(fn);

test('fractions: virgule décimale exacte', () => assert.deepEqual(parseFrac('2,5'), {n:5,d:2}));
test('fractions: addition de décimaux négatifs', () => assert.equal(result(solveComplexFractionExpr('-0,5 + 0,2')), '-3/10'));
test('fractions: × et ÷ sont évalués de gauche à droite', () => assert.equal(result(solveComplexFractionExpr('1/2 ÷ 3/4 × 5/6')), '5/9'));
test('fractions: puissance', () => assert.equal(result(solveComplexFractionExpr('2^3')), '8'));
test('fractions: parenthèse fermante en trop refusée', () => assert.equal(result(solveComplexFractionExpr('1+2)')), 'Erreur'));
test('fractions: division par zéro refusée', () => throws(() => solveFractionOp('1/2','0','÷')));
test('PGCD/PPCM', () => assert.equal(result(solveGCDLCM(18,24)), 'PGCD = 6, PPCM = 72'));

test('fraction rationnelle: multiplicité des facteurs conservée', () => {
  assert.equal(result(solveSimplifyRational(1,-4,0,1,-8,16)), 'x / (x - 4)');
});
test('fraction rationnelle: polynôme dénominateur nul refusé', () => throws(() => solveSimplifyRational(1,0,0,0,0,0)));

test('rationalisation: radicaux croisés conservés', () => {
  assert.equal(result(solveRationalize(1,1,2,1,1,3)), '(-1 + √3 - √2 + √6) / 2');
});

test('radical: simplification', () => assert.equal(result(solveRadicalSimplify(72)), '6√2'));
test('radical: radicande négatif refusé', () => assert.equal(result(solveRadicalSimplify(-2)), 'Impossible'));
test('radical: comparaison avec coefficient négatif', () => assert.equal(result(solveRadicalCompare(-1,2,1,1)), '<'));

test('valeur absolue: équation dégénérée vraie', () => assert.equal(result(solveAbsoluteEquation(0,3,3)), 'S = ℝ'));
test('valeur absolue: membre droit négatif', () => assert.equal(result(solveAbsoluteEquation(2,1,-3)), 'S = ∅'));
test('valeur absolue: inéquation impossible', () => assert.equal(result(solveAbsoluteInequation(1,0,-1,'<')), 'S = ∅'));

test('développement identité remarquable', () => assert.match(result(solveDevelopment('(a+b)^2',2,3)), /4x²/));
test('factorisation: groupement', () => assert.equal(result(solveFactorGroupingExpr('x²+3x+2x+6')), '(x + 3)(x + 2)'));
test('factorisation: coefficient a=0 ne divise pas par zéro', () => assert.equal(result(solveFactorization(0,2,4)), '2(x + 2)'));
test('factorisation: coefficients décimaux explicitement refusés', () => throws(() => solveFactorization(0.5,1.5,1)));

test('inéquation produit: racine double sans intervalle vide', () => {
  assert.equal(result(solveProductQuotientIneq(1,-1,1,-1,'>',false)), 'S = ]-∞ ; 1[ ∪ ]1 ; +∞[');
});

test('équation linéaire avec décimaux', () => assert.equal(result(solveLinearEquation(0.5,0,0,1)), 'x = 2'));
test('équation du second degré dégénérée devient linéaire', () => assert.equal(result(solveQuadraticEquation(0,0.5,-1)), 'S = {2}'));
test('système incompatible', () => assert.equal(result(solveSystem2x2(1,0,1,2,0,3)), 'S = ∅'));
test('système identique', () => assert.equal(result(solveSystem2x2(1,2,3,2,4,6)), 'Infinité de solutions'));
test('inéquation linéaire: inversion du signe', () => assert.equal(result(solveLinearInequation(-2,0,'<',0,-4)), 'S = ]2 ; +∞['));

test('Pythagore: triplet 3-4-5', () => assert.equal(result(solvePythagoras(3,4,true)), 'c = 5'));
test('Pythagore: hypoténuse incohérente refusée', () => assert.equal(result(solvePythagoras(3,5,false)), 'Impossible'));
test('Thalès: décimaux exacts', () => assert.equal(result(solveThales(2.5,5,7.5)), 'x = 15'));
test('trigonométrie: rapport impossible refusé', () => throws(() => solveTrig('angle',null,5,null,3)));

test('statistiques: doublons regroupés et mode correct', () => {
  const s=solveStatistics([12,14,14,16,16,16,18,20]);
  assert.deepEqual(s.mode,[16]);
  assert.equal(s.table.find(r=>r.value===16)?.freq,3);
});
test('statistiques: convention quartiles BEPC', () => {
  const s=solveStatistics([1,2,3,4]); assert.equal(s.q1,1); assert.equal(s.q3,3);
});
test('statistiques: liste vide refusée', () => throws(() => solveStatistics([])));
test('statistiques: effectif négatif refusé', () => throws(() => solveStatistics([1,2],[1,-1])));

test('proportionnalité: décimaux', () => assert.equal(result(solveProportionality(2.5,5,7.5,null)), 'y₂ = 15'));
test('pourcentage: division par zéro refusée', () => throws(() => solvePercentage('whatPercent',0,20)));
test('puissance: base décimale exacte', () => assert.equal(result(solvePowers(0.5,2)), '1/4'));
test('puissance: 0 exposant négatif refusé', () => throws(() => solvePowers(0,-1)));

test('vecteur coordonnées', () => assert.match(result(solveVectorCoords(1,2,4,6)), /^AB\(3 ; 4\)/));
test('norme vecteur 3-4', () => assert.match(result(solveVectorNorm(3,4)), /5/));
test('milieu', () => assert.equal(result(solveMidpoint(0,0,4,6)), 'M(2 ; 3)'));

test('aire triangle impossible refusée', () => throws(() => solvePlaneArea('triangle3',{a:1,b:2,c:10})));
test('volume sphère négatif refusé', () => throws(() => solveSpaceVolume('sphere',{r:-2})));
test('volume cylindre positif', () => assert.match(result(solveSpaceVolume('cylindre',{r:2,h:5})), /V ≈ 62\.83/));

test('format fraction normalisé', () => assert.equal(fracToStr(parseFrac('-6/-8'),true), '3/4'));
