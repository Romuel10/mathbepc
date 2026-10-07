export type PracticeQuestion = {
  id: string
  area: 'Calcul numérique' | 'Algèbre' | 'Géométrie' | 'Statistiques'
  level: 1 | 2 | 3
  prompt: string
  hint: string
  answer: string
  solution: string[]
}

export const practiceQuestions: PracticeQuestion[] = [
  {
    id: 'q1',
    area: 'Calcul numérique',
    level: 1,
    prompt: 'Calculer A = 3 + 5 × 2².',
    hint: 'Commence par la puissance, puis la multiplication.',
    answer: '23',
    solution: ['2² = 4', '5 × 4 = 20', '3 + 20 = 23']
  },
  {
    id: 'q2',
    area: 'Calcul numérique',
    level: 2,
    prompt: 'Simplifier √108.',
    hint: 'Cherche le plus grand carré parfait qui divise 108.',
    answer: '6√3',
    solution: ['108 = 36 × 3', '√108 = √36 × √3', '√108 = 6√3']
  },
  {
    id: 'q3',
    area: 'Algèbre',
    level: 1,
    prompt: 'Résoudre 5x - 7 = 18.',
    hint: 'Ajoute 7 aux deux membres.',
    answer: 'x = 5',
    solution: ['5x = 18 + 7', '5x = 25', 'x = 5']
  },
  {
    id: 'q4',
    area: 'Algèbre',
    level: 2,
    prompt: 'Résoudre 3(x - 2) = 2x + 5.',
    hint: 'Développe le membre de gauche.',
    answer: 'x = 11',
    solution: ['3x - 6 = 2x + 5', '3x - 2x = 5 + 6', 'x = 11']
  },
  {
    id: 'q5',
    area: 'Algèbre',
    level: 2,
    prompt: 'Résoudre 4x + 3 < 19.',
    hint: 'Isole 4x puis divise par 4.',
    answer: 'x < 4',
    solution: ['4x < 19 - 3', '4x < 16', 'x < 4']
  },
  {
    id: 'q6',
    area: 'Géométrie',
    level: 1,
    prompt: 'Un triangle rectangle a pour côtés de l’angle droit 9 cm et 12 cm. Calculer l’hypoténuse.',
    hint: 'Utilise le théorème de Pythagore.',
    answer: '15 cm',
    solution: ['c² = 9² + 12²', 'c² = 81 + 144 = 225', 'c = √225 = 15 cm']
  },
  {
    id: 'q7',
    area: 'Géométrie',
    level: 2,
    prompt: 'Dans une configuration de Thalès : AM = 4, AB = 10, AC = 15. Calculer AN si MN est parallèle à BC.',
    hint: 'Écris AM/AB = AN/AC.',
    answer: 'AN = 6',
    solution: ['4/10 = AN/15', '10 × AN = 4 × 15', '10 × AN = 60', 'AN = 6']
  },
  {
    id: 'q8',
    area: 'Géométrie',
    level: 2,
    prompt: 'A(2 ; 1) et B(5 ; 5). Calculer la distance AB.',
    hint: 'Calcule d’abord Δx et Δy.',
    answer: 'AB = 5',
    solution: ['Δx = 5 - 2 = 3', 'Δy = 5 - 1 = 4', 'AB = √(3² + 4²) = √25 = 5']
  },
  {
    id: 'q9',
    area: 'Statistiques',
    level: 1,
    prompt: 'Série : 7 ; 9 ; 10 ; 10 ; 14. Donner la médiane et le mode.',
    hint: 'La série est déjà ordonnée.',
    answer: 'Médiane = 10 ; mode = 10',
    solution: ['Il y a 5 valeurs : la 3e est la médiane.', 'La valeur 10 apparaît deux fois, plus que les autres.']
  },
  {
    id: 'q10',
    area: 'Statistiques',
    level: 2,
    prompt: 'Notes : 8 ; 12 ; 12 ; 14 ; 14. Calculer la moyenne.',
    hint: 'Additionne les cinq notes puis divise par 5.',
    answer: '12',
    solution: ['Somme = 8 + 12 + 12 + 14 + 14 = 60', 'Moyenne = 60/5 = 12']
  },
  {
    id: 'q11',
    area: 'Algèbre',
    level: 3,
    prompt: 'Résoudre le système : 2x + y = 7 et x - y = 2.',
    hint: 'Additionne les deux équations après avoir gardé la première telle quelle.',
    answer: 'x = 3 ; y = 1',
    solution: ['2x + y = 7', 'x - y = 2', 'En additionnant : 3x = 9', 'x = 3', 'Puis 3 - y = 2, donc y = 1']
  },
  {
    id: 'q12',
    area: 'Géométrie',
    level: 3,
    prompt: 'Un cylindre a un rayon de 4 cm et une hauteur de 10 cm. Donner son volume exact.',
    hint: 'Utilise V = πr²h.',
    answer: '160π cm³',
    solution: ['V = π × 4² × 10', 'V = π × 16 × 10', 'V = 160π cm³']
  }
]
