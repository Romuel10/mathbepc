import test from 'node:test';
import assert from 'node:assert/strict';
import {
  solveAffineImage, solveAffineAntecedent, solveAffineStudy, solveAffineIntersection,
  solveVectorOperation, solveVectorRelations, solveLineThroughPoints, solvePointOnLine,
  solveTranslationPoint, solveCentralSymmetry, solveAxialSymmetryPoint,
  solveInscribedAngle, solveLineCirclePosition, solveScaleReduction, solveFrustumFromSimilarity,
  solveGroupedStatistics, solveSqrtBounds, solveThalesReciprocal, solveSimilarTriangles,
} from '../src/utils/mathEngine.ts';

test('application affine : image',()=>assert.equal(solveAffineImage(2,1,3).result,'f(3) = 7'));
test('application affine : antécédent',()=>assert.equal(solveAffineAntecedent(2,1,7).result,'x = 3'));
test('application affine : variation',()=>assert.equal(solveAffineStudy(-2,3).variation,'décroissante'));
test('applications affines : intersection',()=>assert.equal(solveAffineIntersection(2,1,-1,7).result,'I(2 ; 5)'));
test('vecteurs : somme',()=>assert.equal(solveVectorOperation(1,2,3,4,'+').result,'(4 ; 6)'));
test('vecteurs : colinéarité',()=>assert.equal(solveVectorRelations(1,2,2,4).collinear,true));
test('vecteurs : orthogonalité',()=>assert.equal(solveVectorRelations(1,0,0,2).orthogonal,true));
test('droite par deux points',()=>assert.equal(solveLineThroughPoints(0,1,2,5).result,'y = 2x + 1'));
test('appartenance à une droite',()=>assert.equal(solvePointOnLine(1,-1,0,3,3).belongs,true));
test('translation',()=>assert.equal(solveTranslationPoint(2,3,4,-1).result,"M'(6 ; 2)"));
test('symétrie centrale',()=>assert.equal(solveCentralSymmetry(2,3,0,0).result,"M'(-2 ; -3)"));
test('symétrie axiale axe x=0',()=>assert.equal(solveAxialSymmetryPoint(2,3,1,0,0).result,"M'(-2 ; 3)"));
test('angle inscrit moitié du centre',()=>assert.equal(solveInscribedAngle('centerToInscribed',120).result,'60°'));
test('angle inscrit demi-cercle',()=>assert.equal(solveInscribedAngle('semicircle').result,'90°'));
test('droite-cercle sécante',()=>assert.equal(solveLineCirclePosition(3,5).result,'La droite est sécante au cercle'));
test('réduction volume k³',()=>assert.equal(solveScaleReduction(.5,800,'volume').result,'100'));
test('volume tronc',()=>assert.equal(solveFrustumFromSimilarity(800,.5).result,'Vtronc = 700'));
test('statistiques groupées',()=>{const r=solveGroupedStatistics([0,5,10,15,20],[17,11,12,10]);assert.equal(r.n,50);assert.deepEqual(r.modalClasses,['[0 ; 5[']);});
test('encadrement racine',()=>assert.equal(solveSqrtBounds(7,2).result,'2.64 < √7 < 2.65'));
test('réciproque de Thalès',()=>assert.equal(solveThalesReciprocal(3,6,4,8).parallel,true));
test('triangles semblables',()=>assert.equal(solveSimilarTriangles(3,4,5,6,8,10).similar,true));

for(let i=1;i<=30;i++){
  test(`programme 3e affine généré #${i}`,()=>{
    const a=(i%7)+1,b=(i%9)-4,x=(i%11)-5;
    assert.equal(solveAffineImage(a,b,x).result,`f(${x}) = ${a*x+b}`);
  });
}
