export type Lesson = {
  id: string
  title: string
  area: 'Algèbre' | 'Géométrie' | 'Données'
  description: string
  essentials: string[]
  method: string[]
  example: { question: string; solution: string[] }
}

export const lessons: Lesson[] = [
  {
    id: 'reels',
    title: 'Nombres réels et racines',
    area: 'Algèbre',
    description: 'Priorités opératoires, puissances, valeur absolue et simplification des racines carrées.',
    essentials: [
      'aᵐ × aⁿ = aᵐ⁺ⁿ',
      'aᵐ / aⁿ = aᵐ⁻ⁿ si a ≠ 0',
      '√(a²b) = |a|√b pour b ≥ 0',
      '|x| représente la distance de x à 0'
    ],
    method: [
      'Traiter d’abord les parenthèses.',
      'Calculer ensuite puissances et racines.',
      'Effectuer multiplications et divisions avant additions et soustractions.',
      'Contrôler le signe et l’ordre de grandeur du résultat.'
    ],
    example: {
      question: 'Simplifier √72.',
      solution: ['72 = 36 × 2', '√72 = √36 × √2', '√72 = 6√2']
    }
  },
  {
    id: 'polynomes',
    title: 'Calcul littéral et polynômes',
    area: 'Algèbre',
    description: 'Développer, réduire, factoriser et calculer la valeur numérique d’une expression.',
    essentials: [
      'k(a + b) = ka + kb',
      '(a + b)² = a² + 2ab + b²',
      '(a - b)² = a² - 2ab + b²',
      '(a - b)(a + b) = a² - b²'
    ],
    method: [
      'Repérer la structure de l’expression.',
      'Développer ou factoriser selon la consigne.',
      'Regrouper les termes de même degré.',
      'Vérifier en remplaçant x par une valeur simple.'
    ],
    example: {
      question: 'Développer et réduire 3(x - 2) + 2x.',
      solution: ['3(x - 2) = 3x - 6', '3x - 6 + 2x = 5x - 6']
    }
  },
  {
    id: 'equations',
    title: 'Équations, inéquations et systèmes',
    area: 'Algèbre',
    description: 'Résoudre des équations et inéquations du premier degré ainsi que des systèmes à deux inconnues.',
    essentials: [
      'ax + b = 0 donne x = -b/a si a ≠ 0',
      'Multiplier ou diviser une inégalité par un nombre négatif inverse son sens.',
      'Un système de deux équations cherche un couple (x ; y) vérifiant les deux égalités.'
    ],
    method: [
      'Développer et réduire chaque membre si nécessaire.',
      'Regrouper les termes contenant l’inconnue.',
      'Regrouper les constantes dans l’autre membre.',
      'Diviser par le coefficient de l’inconnue puis vérifier.'
    ],
    example: {
      question: 'Résoudre 3x + 7 = 19.',
      solution: ['3x = 19 - 7', '3x = 12', 'x = 4', 'Vérification : 3 × 4 + 7 = 19']
    }
  },
  {
    id: 'fonctions',
    title: 'Fonctions linéaires, affines et droites',
    area: 'Algèbre',
    description: 'Lire et exploiter f(x) = ax + b, déterminer une image, un antécédent et étudier une droite.',
    essentials: [
      'Fonction linéaire : f(x) = ax',
      'Fonction affine : f(x) = ax + b',
      'a est le coefficient directeur',
      'b est l’ordonnée à l’origine'
    ],
    method: [
      'Identifier a et b.',
      'Pour une image, remplacer x par la valeur donnée.',
      'Pour un antécédent, résoudre ax + b = y.',
      'Pour comparer deux droites, comparer leurs coefficients directeurs.'
    ],
    example: {
      question: 'Pour f(x) = 2x - 3, calculer f(5).',
      solution: ['f(5) = 2 × 5 - 3', 'f(5) = 10 - 3', 'f(5) = 7']
    }
  },
  {
    id: 'thales',
    title: 'Thalès et triangles semblables',
    area: 'Géométrie',
    description: 'Reconnaître une configuration de Thalès, calculer une longueur et justifier un parallélisme.',
    essentials: [
      'Dans une configuration de Thalès, les longueurs homologues sont proportionnelles.',
      'La réciproque de Thalès permet de justifier que deux droites sont parallèles.',
      'Deux triangles semblables ont leurs côtés homologues proportionnels.'
    ],
    method: [
      'Nommer clairement les deux triangles.',
      'Vérifier l’alignement des points et le parallélisme.',
      'Écrire les rapports dans le même ordre.',
      'Résoudre la proportion puis écrire l’unité.'
    ],
    example: {
      question: 'Si AM/AB = AN/AC, avec AM = 3, AB = 5 et AC = 10, calculer AN.',
      solution: ['3/5 = AN/10', '5 × AN = 30', 'AN = 6']
    }
  },
  {
    id: 'pythagore-trigo',
    title: 'Pythagore et trigonométrie',
    area: 'Géométrie',
    description: 'Calculer des longueurs et des angles dans un triangle rectangle.',
    essentials: [
      'Si ABC est rectangle en A : BC² = AB² + AC²',
      'cos(angle) = adjacent / hypoténuse',
      'sin(angle) = opposé / hypoténuse',
      'tan(angle) = opposé / adjacent'
    ],
    method: [
      'Identifier l’angle droit et l’hypoténuse.',
      'Choisir Pythagore ou le bon rapport trigonométrique.',
      'Écrire la formule avant de remplacer les valeurs.',
      'Arrondir uniquement à la fin.'
    ],
    example: {
      question: 'Triangle rectangle de côtés 6 cm et 8 cm. Calculer l’hypoténuse.',
      solution: ['c² = 6² + 8²', 'c² = 36 + 64 = 100', 'c = 10 cm']
    }
  },
  {
    id: 'cercle',
    title: 'Angles et cercle',
    area: 'Géométrie',
    description: 'Utiliser les premières propriétés des angles inscrits et les configurations liées au cercle.',
    essentials: [
      'Deux angles inscrits qui interceptent le même arc ont la même mesure.',
      'Un angle inscrit interceptant un diamètre est droit.',
      'L’angle au centre interceptant un même arc vaut le double de l’angle inscrit.'
    ],
    method: [
      'Identifier l’arc intercepté.',
      'Repérer si l’angle est inscrit ou au centre.',
      'Appliquer la propriété adaptée.',
      'Justifier par une phrase complète.'
    ],
    example: {
      question: 'Un angle au centre mesure 80°. Quel angle inscrit intercepte le même arc ?',
      solution: ['Angle inscrit = angle au centre / 2', 'Angle inscrit = 80° / 2 = 40°']
    }
  },
  {
    id: 'vecteurs',
    title: 'Vecteurs et coordonnées',
    area: 'Géométrie',
    description: 'Calculs vectoriels, distances, milieux, parallélisme et orthogonalité dans le plan.',
    essentials: [
      'AB⃗ = (xB - xA ; yB - yA)',
      'M milieu de [AB] : ((xA+xB)/2 ; (yA+yB)/2)',
      'AB = √((xB-xA)² + (yB-yA)²)',
      'Deux vecteurs sont colinéaires si leur déterminant est nul.'
    ],
    method: [
      'Écrire les coordonnées sans sauter d’étape.',
      'Calculer séparément les différences en x et en y.',
      'Appliquer la formule demandée.',
      'Contrôler le résultat sur un croquis.'
    ],
    example: {
      question: 'A(1 ; 2), B(4 ; 6). Calculer AB.',
      solution: ['Δx = 4 - 1 = 3', 'Δy = 6 - 2 = 4', 'AB = √(3² + 4²) = 5']
    }
  },
  {
    id: 'transformations',
    title: 'Transformations du plan',
    area: 'Géométrie',
    description: 'Translation, symétries et homothétie pour construire et justifier des propriétés.',
    essentials: [
      'Une translation conserve longueurs, angles et parallélisme.',
      'Une symétrie centrale équivaut à un demi-tour.',
      'Une homothétie multiplie toutes les longueurs par |k|.'
    ],
    method: [
      'Identifier la transformation et ses données.',
      'Construire l’image des points caractéristiques.',
      'Utiliser les propriétés de conservation.',
      'Conclure sur la figure obtenue.'
    ],
    example: {
      question: 'Une homothétie de rapport 2 transforme un segment de 3 cm.',
      solution: ['Longueur image = |2| × 3', 'Longueur image = 6 cm']
    }
  },
  {
    id: 'statistiques',
    title: 'Statistiques',
    area: 'Données',
    description: 'Organiser une série, calculer moyenne, médiane, mode, étendue et exploiter des classes.',
    essentials: [
      'Moyenne = somme des valeurs / effectif total',
      'La médiane partage une série ordonnée en deux groupes de même effectif.',
      'Le mode est la valeur la plus fréquente.',
      'Étendue = maximum - minimum'
    ],
    method: [
      'Ordonner ou regrouper les données.',
      'Calculer l’effectif total.',
      'Appliquer la formule de la moyenne.',
      'Lire ensuite médiane, mode et étendue.'
    ],
    example: {
      question: 'Série : 8 ; 10 ; 10 ; 12. Calculer la moyenne.',
      solution: ['Somme = 8 + 10 + 10 + 12 = 40', 'Effectif = 4', 'Moyenne = 40/4 = 10']
    }
  },
  {
    id: 'espace',
    title: 'Géométrie dans l’espace',
    area: 'Géométrie',
    description: 'Aires, volumes, patrons et propriétés des solides usuels.',
    essentials: [
      'Pavé droit : V = L × l × h',
      'Cylindre : V = πr²h',
      'Pyramide : V = (aire de base × hauteur) / 3',
      'Cône : V = πr²h / 3'
    ],
    method: [
      'Identifier le solide.',
      'Repérer les mesures utiles et leurs unités.',
      'Choisir la formule correcte.',
      'Convertir les unités avant de calculer si nécessaire.'
    ],
    example: {
      question: 'Cylindre de rayon 3 cm et hauteur 5 cm.',
      solution: ['V = πr²h', 'V = π × 3² × 5', 'V = 45π cm³']
    }
  }
]
