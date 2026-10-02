import type { Lang } from '../utils/i18n';
import PageHeader from './PageHeader';

const sections=[
  ['Nombres réels','Radicaux, comparaison, encadrement, puissances','radicals'],
  ['Polynômes & fractions rationnelles','Développement, factorisation, domaine, simplification','factorization'],
  ['Équations & inéquations','1er degré, systèmes, problèmes, résolution graphique','equations'],
  ['Applications affines & linéaires','Image, antécédent, variation, coefficient directeur, graphique','functions'],
  ['Thalès & triangles semblables','Calcul de distances, parallélisme, propriétés directe et réciproque','geometry'],
  ['Trigonométrie','Sinus, cosinus, tangente dans le triangle rectangle','geometry'],
  ['Angles inscrits','Angle au centre, même arc, demi-cercle','circle'],
  ['Vecteurs & géométrie analytique','Opérations, colinéarité, orthogonalité, droites','vectors'],
  ['Transformations du plan','Translation, symétrie centrale, homothétie','vectors'],
  ['Configuration de l’espace','Pyramides, cônes, sections, réduction, troncs','space'],
  ['Statistiques','Classes d’égale amplitude, histogramme, cumul, classe modale','stats'],
];

export default function ProgrammeMap({lang,onOpenChapter}:{lang:Lang;onOpenChapter:(id:string)=>void}){
  const mg=lang==='mg';
  return <div className="page-medium animate-fade-up">
    <PageHeader title={mg?'Programme ofisialy kilasy faha-3':'Programme de 3e'} description={mg?'Ireo lohahevitra lehibe amin’ny programme matematika kilasy faha-3 eto Madagasikara.':'Les grandes notions du programme de mathématiques de 3e à Madagascar.'}/>
    <div className="programme-list">
      {sections.map(([title,desc,id],index)=><button key={title} type="button" onClick={()=>onOpenChapter(id)} className="programme-row">
        <span className="programme-index">{String(index+1).padStart(2,'0')}</span>
        <span className="min-w-0 flex-1"><strong>{title}</strong><small>{desc}</small></span>
        <span className="row-arrow" aria-hidden="true">→</span>
      </button>)}
    </div>
    <a href="https://www.education.gov.mg/wp-content/uploads/2016/10/Programme-Scolaire-3eme.pdf" target="_blank" rel="noreferrer" className="external-link">{mg?'Hijery ny programme ofisialy':'Voir le document officiel'} ↗</a>
  </div>;
}
