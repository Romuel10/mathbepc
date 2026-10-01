import type { Lang } from '../utils/i18n';
const sections=[
  ['Nombres réels','Radicaux, comparaison, encadrement, puissances','radicals'],
  ['Polynômes & fractions rationnelles','Développement, factorisation, domaine, simplification','factorization'],
  ['Équations & inéquations','1er degré, systèmes, problèmes, résolution graphique','equations'],
  ['Applications affines & linéaires','Image, antécédent, variation, coefficient directeur, graphique','functions'],
  ['Thalès & triangles semblables','Calcul de distances, parallélisme, propriétés directe et réciproque','geometry'],
  ['Trigonométrie','Sinus, cosinus, tangente dans le triangle rectangle','geometry'],
  ['Angles inscrits','Angle au centre, même arc, demi-cercle','circle'],
  ['Vecteurs & géométrie analytique','Opérations, colinéarité, orthogonalité, droites','vectors'],
  ['Transformations du plan','Translation, symétrie centrale, homothétie utile en révision','vectors'],
  ['Configuration de l’espace','Pyramides, cônes, sections, réduction, troncs','space'],
  ['Statistiques','Classes d’égale amplitude, histogramme, cumul, classe modale','stats'],
];
export default function ProgrammeMap({lang,onOpenChapter}:{lang:Lang;onOpenChapter:(id:string)=>void}){const mg=lang==='mg';return <div className="max-w-4xl mx-auto animate-fade-up"><h1 className="text-2xl sm:text-4xl font-extrabold">{mg?'Programme officiel kilasy faha-3':'Programme officiel de 3e'}</h1><p className="mt-2 text-sm text-[--color-text-secondary]">{mg?'Ity lisitra ity dia manaraka ny programme scolaire 3e navoakan’ny Ministère de l’Éducation Nationale de Madagascar.':'Cette carte suit le programme scolaire de 3e publié par le Ministère de l’Éducation nationale de Madagascar.'}</p><div className="mt-5 space-y-3">{sections.map(([title,desc,id])=><button key={title} onClick={()=>onOpenChapter(id)} className="w-full rounded-2xl border border-[--color-border] bg-[--color-card] p-4 text-left flex justify-between gap-4 cursor-pointer hover:border-[--color-accent]/35"><div><p className="font-bold">{title}</p><p className="text-xs text-[--color-text-secondary] mt-1">{desc}</p></div><span className="text-[--color-accent] font-bold">✓</span></button>)}</div><a href="https://www.education.gov.mg/wp-content/uploads/2016/10/Programme-Scolaire-3eme.pdf" target="_blank" rel="noreferrer" className="inline-flex mt-5 text-xs font-bold text-[--color-accent]">{mg?'Hijery ny programme ofisialy ↗':'Voir le programme officiel ↗'}</a></div>}
