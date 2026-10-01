import type { Lang } from './i18n';

export function explainStep(text: string, lang: Lang): string {
  const t = text.toLowerCase();
  if (t.includes('erreur') || t.includes('impossible') || t.includes('interdit')) {
    return lang === 'mg'
      ? 'Jereo indray ny angona nampidirinao: misy fepetra matematika tsy voahaja.'
      : 'Vérifie les données saisies : une condition mathématique n’est pas respectée.';
  }
  if (t.includes('coefficient directeur') || t.includes('ordonnée à l'origine') || t.includes('variation')) {
    return lang === 'mg' ? 'Ao amin’ny f(x)=ax+b, ny a no coefficient directeur ary izy no mamaritra raha miakatra na midina ny droite.' : 'Dans f(x)=ax+b, a est le coefficient directeur : son signe indique si la droite monte, descend ou reste horizontale.';
  }
  if (t.includes('det(u,v)') || t.includes('colinéaire')) {
    return lang === 'mg' ? 'Raha mitovy aotra ny déterminant dia colinéaires ireo vecteurs roa.' : 'Deux vecteurs du plan sont colinéaires lorsque leur déterminant est nul.';
  }
  if (t.includes('u·v') || t.includes('orthogonal')) {
    return lang === 'mg' ? 'Raha mitovy aotra ny produit scalaire dia mifampijoro mahitsy ireo vecteurs.' : 'Deux vecteurs sont orthogonaux lorsque leur produit scalaire est nul.';
  }
  if (t.includes('angle inscrit') || t.includes('angle au centre')) {
    return lang === 'mg' ? 'Ny zoro inscrit dia antsasaky ny zoro au centre izay manapaka arc mitovy.' : 'Un angle inscrit mesure la moitié de l’angle au centre qui intercepte le même arc.';
  }
  if (t.includes('classe modale') || t.includes('fréquence') || t.includes('effectif total')) {
    return lang === 'mg' ? 'Amin’ny statistique regroupée, ny classe modale no classe manana effectif lehibe indrindra.' : 'Dans une série regroupée, la classe modale est celle dont l’effectif est le plus élevé.';
  }
  if (t.includes('k³') || t.includes('k²') || t.includes('réduction')) {
    return lang === 'mg' ? 'Raha ampitomboina amin’ny k ny halavana, ny aire dia ampitomboina amin’ny k² ary ny volume amin’ny k³.' : 'Lors d’une réduction ou d’un agrandissement, les longueurs sont multipliées par k, les aires par k² et les volumes par k³.';
  }
  if (t.includes('pgcd')) {
    return lang === 'mg' ? 'Ny PGCD dia mpizara lehibe indrindra iraisan’ireo isa roa.' : 'Le PGCD est le plus grand nombre qui divise exactement les deux nombres.';
  }
  if (t.includes('ppcm')) {
    return lang === 'mg' ? 'Ny PPCM no multiple iombonana kely indrindra; ilaina amin’ny fampitoviana dénominateur.' : 'Le PPCM est le plus petit multiple commun ; il sert notamment à trouver un dénominateur commun.';
  }
  if (t.includes('δ') || t.includes('discriminant')) {
    return lang === 'mg' ? 'Ny discriminant no manambara raha misy vahaolana 0, 1 na 2 ny équation degré 2.' : 'Le discriminant permet de savoir si une équation du second degré a 0, 1 ou 2 solutions réelles.';
  }
  if (t.includes('pythagore') || t.includes('hypot')) {
    return lang === 'mg' ? 'Ao amin’ny triangle rectangle ihany no ampiasaina ny théorème de Pythagore.' : 'Le théorème de Pythagore s’utilise uniquement dans un triangle rectangle.';
  }
  if (t.includes('thalès') || t.includes('rapport')) {
    return lang === 'mg' ? 'Rehefa parallèle ny tsipika dia mitovy ny rapports amin’ireo lafiny mifanaraka.' : 'Avec des droites parallèles, les longueurs correspondantes sont proportionnelles.';
  }
  if (t.includes('moyenne')) {
    return lang === 'mg' ? 'Ampiana ny sanda rehetra (araka ny effectif) dia zaraina amin’ny isan’ny sanda.' : 'On additionne les valeurs en tenant compte des effectifs, puis on divise par l’effectif total.';
  }
  if (t.includes('médiane') || t.includes('quartile')) {
    return lang === 'mg' ? 'Alahatra aloha ny sanda, avy eo tadiavina ny toerana mifanaraka amin’ny 25 %, 50 % na 75 %.' : 'On classe d’abord les valeurs puis on repère la position correspondant à 25 %, 50 % ou 75 %.';
  }
  if (t.includes('on divise') || t.includes('÷')) {
    return lang === 'mg' ? 'Mizara ny lafiny roa amin’ny isa iray ihany mba hitazonana ny fitoviana.' : 'On divise les deux membres par la même quantité pour conserver l’égalité.';
  }
  if (t.includes('on soustrait') || t.includes('on ajoute')) {
    return lang === 'mg' ? 'Atao amin’ny lafiny roa ilay opération iray ihany mba tsy hiova ny équation.' : 'On effectue la même opération dans les deux membres pour garder une équation équivalente.';
  }
  if (t.includes('simplif') || t.includes('rédu')) {
    return lang === 'mg' ? 'Ahena amin’ny endrika tsotra kokoa ilay expression, nefa mitovy sanda foana.' : 'On écrit l’expression sous une forme plus simple sans changer sa valeur.';
  }
  if (t.includes('factor')) {
    return lang === 'mg' ? 'Mitady facteur commun na identité remarquable isika mba hanoratana produit.' : 'On cherche un facteur commun ou une identité remarquable afin d’écrire l’expression sous forme de produit.';
  }
  if (t.includes('dévelop')) {
    return lang === 'mg' ? 'Ampiharina amin’ny terme tsirairay ny distributivité, avy eo atambatra ireo termes mitovy.' : 'On applique la distributivité à chaque terme puis on regroupe les termes semblables.';
  }
  if (t.includes('résultat') || t.includes('solution')) {
    return lang === 'mg' ? 'Io no valiny farany; azonao hamarinina amin’ny fanoloana azy ao amin’ny fanontaniana voalohany.' : 'C’est le résultat final ; tu peux le vérifier en le remplaçant dans l’énoncé de départ.';
  }
  return lang === 'mg'
    ? 'Ity dingana ity dia manova ny soratra matematika ho endrika mora kokoa, nefa mitahiry ny sanda mitovy.'
    : 'Cette étape transforme l’écriture mathématique en une forme plus simple tout en conservant la même valeur.';
}
