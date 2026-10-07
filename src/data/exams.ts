export type ExamQuestion = {
  id: string
  section: string
  points: number
  prompt: string
  answer: string
  solution: string[]
}

export type ExamSet = {
  id: string
  title: string
  subtitle: string
  questions: ExamQuestion[]
}

export const examSets: ExamSet[] = [
  {
    id: 'type-a',
    title: 'Sujet type A',
    subtitle: 'Calcul numérique, algèbre, statistiques et géométrie',
    questions: [
      {
        id: 'a1',
        section: 'Activités numériques',
        points: 3,
        prompt: 'Calculer A = 5/3 − (2/3) × (7/4) et donner le résultat sous forme irréductible.',
        answer: 'A = 1/2',
        solution: ['(2/3) × (7/4) = 14/12 = 7/6', '5/3 = 10/6', 'A = 10/6 − 7/6 = 3/6 = 1/2']
      },
      {
        id: 'a2',
        section: 'Algèbre',
        points: 4,
        prompt: 'Développer puis réduire B = (x + 3)(x − 2) + 2x.',
        answer: 'B = x² + 3x − 6',
        solution: ['(x + 3)(x − 2) = x² + x − 6', 'B = x² + x − 6 + 2x', 'B = x² + 3x − 6']
      },
      {
        id: 'a3',
        section: 'Statistiques',
        points: 4,
        prompt: 'On considère la série 8 ; 10 ; 10 ; 11 ; 13 ; 14. Calculer la moyenne, la médiane et le mode.',
        answer: 'Moyenne = 11 ; médiane = 10,5 ; mode = 10',
        solution: ['Somme = 66 et effectif = 6', 'Moyenne = 66/6 = 11', 'Médiane = (10 + 11)/2 = 10,5', 'Le mode est 10']
      },
      {
        id: 'a4',
        section: 'Géométrie',
        points: 5,
        prompt: 'ABC est rectangle en A avec AB = 6 cm et AC = 8 cm. Calculer BC puis cos(B).',
        answer: 'BC = 10 cm ; cos(B) = 0,6',
        solution: ['BC² = AB² + AC² = 36 + 64 = 100', 'BC = 10 cm', 'cos(B) = adjacent/hypoténuse = AB/BC = 6/10 = 0,6']
      }
    ]
  },
  {
    id: 'type-b',
    title: 'Sujet type B',
    subtitle: 'Équations, Thalès, coordonnées et problèmes',
    questions: [
      {
        id: 'b1',
        section: 'Algèbre',
        points: 4,
        prompt: 'Résoudre 3(x − 2) = 2x + 7.',
        answer: 'x = 13',
        solution: ['3x − 6 = 2x + 7', '3x − 2x = 7 + 6', 'x = 13']
      },
      {
        id: 'b2',
        section: 'Inéquation',
        points: 3,
        prompt: 'Résoudre −2x + 5 ≥ 11.',
        answer: 'x ≤ −3',
        solution: ['−2x ≥ 6', 'On divise par −2 : le sens change', 'x ≤ −3']
      },
      {
        id: 'b3',
        section: 'Thalès',
        points: 5,
        prompt: 'Dans le triangle ABC, M appartient à [AB], N à [AC] et MN // BC. AM = 4, AB = 10, AC = 15. Calculer AN.',
        answer: 'AN = 6',
        solution: ['AM/AB = AN/AC', '4/10 = AN/15', '10 × AN = 60', 'AN = 6']
      },
      {
        id: 'b4',
        section: 'Coordonnées',
        points: 4,
        prompt: 'A(1 ; 2) et B(5 ; 5). Calculer les coordonnées du milieu I de [AB] et la distance AB.',
        answer: 'I(3 ; 3,5) ; AB = 5',
        solution: ['I((1+5)/2 ; (2+5)/2) = I(3 ; 3,5)', 'AB = √((5−1)² + (5−2)²)', 'AB = √(16 + 9) = 5']
      }
    ]
  },
  {
    id: 'type-c',
    title: 'Sujet type C',
    subtitle: 'Révision générale avec difficulté progressive',
    questions: [
      {
        id: 'c1',
        section: 'Nombres réels',
        points: 3,
        prompt: 'Simplifier √108.',
        answer: '6√3',
        solution: ['108 = 36 × 3', '√108 = √36 × √3', '√108 = 6√3']
      },
      {
        id: 'c2',
        section: 'Factorisation',
        points: 4,
        prompt: 'Factoriser x² − 9.',
        answer: '(x − 3)(x + 3)',
        solution: ['x² − 9 = x² − 3²', 'a² − b² = (a − b)(a + b)', 'Donc x² − 9 = (x − 3)(x + 3)']
      },
      {
        id: 'c3',
        section: 'Système',
        points: 4,
        prompt: 'Résoudre : 2x + y = 7 et x − y = 2.',
        answer: 'x = 3 ; y = 1',
        solution: ['Addition des deux équations : 3x = 9', 'x = 3', '3 − y = 2', 'y = 1']
      },
      {
        id: 'c4',
        section: 'Géométrie dans l’espace',
        points: 4,
        prompt: 'Un cylindre a pour rayon 3 cm et hauteur 8 cm. Donner son volume exact.',
        answer: '72π cm³',
        solution: ['V = πr²h', 'V = π × 3² × 8', 'V = 72π cm³']
      }
    ]
  }
]
