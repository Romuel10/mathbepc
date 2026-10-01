import test from 'node:test';
import assert from 'node:assert/strict';
import {
  solveSimplifyRational, solveFactorGroupingExpr, solveStatistics,
  solveLinearEquation, solveComplexFractionExpr, solveSystem2x2,
  solveProductQuotientIneq, solveAbsoluteEquation, solveTrig, solveSpaceVolume,
} from '../src/utils/mathEngine.ts';

// Cas de non-régression explicitement conservés pour le projet MathBEPC.
test('question conservée : fraction rationnelle avec racine double',()=>{
  assert.equal(solveSimplifyRational(1,-4,0,1,-8,16).result,'x / (x - 4)');
});
test('question conservée : factorisation par groupement',()=>{
  assert.equal(solveFactorGroupingExpr('x^2+3x+2x+6').result,'(x + 3)(x + 2)');
});
test('question conservée : mode statistique',()=>{
  assert.deepEqual(solveStatistics([12,14,14,16,16,16,18,20]).mode,[16]);
});
test('question conservée : 0,5x=1',()=>{assert.equal(solveLinearEquation(.5,0,0,1).result,'x = 2');});
test('question conservée : ordre × et ÷',()=>{assert.equal(solveComplexFractionExpr('1/2÷3/4×5/6').result,'5/9');});
test('question conservée : système incompatible',()=>{assert.equal(solveSystem2x2(1,0,1,2,0,3).result,'S = ∅');});
test('question conservée : racine double en inéquation produit',()=>{assert.equal(solveProductQuotientIneq(1,-1,1,-1,'>',false).result,'S = ]-∞ ; 1[ ∪ ]1 ; +∞[');});
test('question conservée : valeur absolue constante',()=>{assert.equal(solveAbsoluteEquation(0,3,3).result,'S = ℝ');});
test('question conservée : trigonométrie impossible refusée',()=>{assert.throws(()=>solveTrig('sin',null,5,null,3));});
test('question conservée : rayon négatif refusé',()=>{assert.throws(()=>solveSpaceVolume('sphere',{r:-2}));});
