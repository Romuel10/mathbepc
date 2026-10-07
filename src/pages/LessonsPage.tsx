import { useMemo, useState } from 'react'
import { lessons, type Lesson } from '../data/lessons'
import { Icon } from '../ui/Icon'
import { MathLine } from '../ui/MathView'

export function LessonsPage() {
  const [selected, setSelected] = useState<Lesson | null>(null)
  const [query, setQuery] = useState('')
  const [area, setArea] = useState<'Tous' | 'Algèbre' | 'Géométrie' | 'Données'>('Tous')

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return lessons.filter(lesson => {
      const areaOk = area === 'Tous' || lesson.area === area
      const textOk = !term || (lesson.title + ' ' + lesson.description).toLowerCase().includes(term)
      return areaOk && textOk
    })
  }, [query, area])

  if (selected) {
    return (
      <div className="page">
        <button className="back-link" onClick={() => setSelected(null)}>
          <Icon name="back" size={17} /> Retour aux chapitres
        </button>

        <article className="lesson-detail">
          <div className="lesson-detail-head">
            <span className="chapter-tag">{selected.area}</span>
            <h1>{selected.title}</h1>
            <p>{selected.description}</p>
          </div>

          <div className="lesson-content-grid">
            <section className="course-block">
              <div className="course-block-title"><span>01</span><h2>À retenir</h2></div>
              <div className="formula-list">
                {selected.essentials.map(item => <MathLine key={item}>{item}</MathLine>)}
              </div>
            </section>

            <section className="course-block">
              <div className="course-block-title"><span>02</span><h2>Méthode</h2></div>
              <ol className="method-list">
                {selected.method.map(item => <li key={item}>{item}</li>)}
              </ol>
            </section>
          </div>

          <section className="worked-example">
            <div className="worked-head">
              <span className="section-kicker">Exemple corrigé</span>
              <h2>{selected.example.question}</h2>
            </div>
            <div className="worked-steps">
              {selected.example.solution.map((line, index) => (
                <div key={line}>
                  <span>{index + 1}</span>
                  <MathLine>{line}</MathLine>
                </div>
              ))}
            </div>
          </section>
        </article>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="workspace-header">
        <div>
          <span className="section-kicker">Cours</span>
          <h1>Le programme, organisé pour réviser vite.</h1>
          <p>Formules essentielles, méthode de rédaction et exemple corrigé dans chaque chapitre.</p>
        </div>
      </header>

      <div className="lesson-filters">
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher un chapitre" />
        <div>
          {(['Tous', 'Algèbre', 'Géométrie', 'Données'] as const).map(item => (
            <button className={area === item ? 'active' : ''} key={item} onClick={() => setArea(item)}>{item}</button>
          ))}
        </div>
      </div>

      <div className="chapters-grid">
        {filtered.map((lesson, index) => (
          <button key={lesson.id} className="chapter-card" onClick={() => setSelected(lesson)}>
            <div className="chapter-top">
              <span className="chapter-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="chapter-tag">{lesson.area}</span>
            </div>
            <strong>{lesson.title}</strong>
            <p>{lesson.description}</p>
            <span className="chapter-open">Ouvrir le cours <Icon name="arrow" size={15} /></span>
          </button>
        ))}
      </div>
    </div>
  )
}
