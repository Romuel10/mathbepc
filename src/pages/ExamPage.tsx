import { useEffect, useMemo, useState } from 'react'
import { examSets } from '../data/exams'
import { Icon } from '../ui/Icon'
import { MathLine } from '../ui/MathView'

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return [hours, minutes, secs].map(value => String(value).padStart(2, '0')).join(':')
}

export function ExamPage({
  completed,
  onCompleted
}: {
  completed: string[]
  onCompleted: (ids: string[]) => void
}) {
  const [setId, setSetId] = useState(examSets[0]?.id ?? '')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [showCorrection, setShowCorrection] = useState(false)
  const [duration, setDuration] = useState(180)
  const [secondsLeft, setSecondsLeft] = useState(180 * 60)
  const [running, setRunning] = useState(false)

  const exam = useMemo(() => examSets.find(item => item.id === setId) ?? examSets[0], [setId])
  const question = exam?.questions[questionIndex]

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setSecondsLeft(current => {
        if (current <= 1) {
          setRunning(false)
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  if (!exam || !question) return null

  const setDurationValue = (minutes: number) => {
    setDuration(minutes)
    setSecondsLeft(minutes * 60)
    setRunning(false)
  }

  const go = (index: number) => {
    const next = Math.max(0, Math.min(exam.questions.length - 1, index))
    setQuestionIndex(next)
    setShowCorrection(false)
  }

  const mark = () => {
    setShowCorrection(true)
    if (!completed.includes(question.id)) onCompleted([...completed, question.id])
  }

  const examDone = exam.questions.filter(item => completed.includes(item.id)).length
  const points = exam.questions.reduce((sum, item) => sum + item.points, 0)

  return (
    <div className="page">
      <header className="workspace-header exam-header">
        <div>
          <span className="section-kicker">Entraînement examen</span>
          <h1>Sujets type BEPC</h1>
          <p>Des sujets originaux construits sur les grands types d’exercices du programme de 3e à Madagascar.</p>
        </div>
        <div className="exam-score"><strong>{examDone}/{exam.questions.length}</strong><span>corrigés vus</span></div>
      </header>

      <section className="exam-toolbar">
        <div className="exam-selector">
          {examSets.map(item => (
            <button
              key={item.id}
              className={setId === item.id ? 'active' : ''}
              onClick={() => {
                setSetId(item.id)
                setQuestionIndex(0)
                setShowCorrection(false)
              }}
            >
              <strong>{item.title}</strong>
              <span>{item.subtitle}</span>
            </button>
          ))}
        </div>

        <div className="timer-card">
          <div className="timer-title"><Icon name="clock" size={18} /><span>Minuteur d’entraînement</span></div>
          <strong className={secondsLeft < 600 ? 'urgent' : ''}>{formatTime(secondsLeft)}</strong>
          <div className="timer-options">
            {[120, 180].map(minutes => (
              <button key={minutes} className={duration === minutes ? 'active' : ''} onClick={() => setDurationValue(minutes)}>
                {minutes / 60} h
              </button>
            ))}
          </div>
          <button className="timer-action" onClick={() => setRunning(value => !value)}>
            {running ? 'Pause' : secondsLeft === 0 ? 'Terminé' : 'Démarrer'}
          </button>
        </div>
      </section>

      <section className="exam-paper">
        <div className="paper-head">
          <div>
            <span>Mathématiques · Entraînement BEPC</span>
            <h2>{exam.title}</h2>
          </div>
          <div><strong>{points}</strong><span>points</span></div>
        </div>

        <div className="question-nav">
          {exam.questions.map((item, index) => (
            <button
              key={item.id}
              className={questionIndex === index ? 'active' : completed.includes(item.id) ? 'done' : ''}
              onClick={() => go(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <article className="exam-question">
          <div className="question-meta">
            <span>{question.section}</span>
            <strong>{question.points} pts</strong>
          </div>
          <h3>{question.prompt}</h3>

          <div className="exam-actions">
            <button className="secondary-action" disabled={questionIndex === 0} onClick={() => go(questionIndex - 1)}>
              <Icon name="back" size={16} /> Précédente
            </button>
            <button className="primary-action" onClick={mark}>Voir le corrigé</button>
            <button className="secondary-action" disabled={questionIndex === exam.questions.length - 1} onClick={() => go(questionIndex + 1)}>
              Suivante <Icon name="arrow" size={16} />
            </button>
          </div>

          {showCorrection ? (
            <div className="exam-correction enter">
              <div className="correction-answer">
                <span>Réponse attendue</span>
                <MathLine large>{question.answer}</MathLine>
              </div>
              <div className="worked-steps">
                {question.solution.map((line, index) => (
                  <div key={line}>
                    <span>{index + 1}</span>
                    <MathLine>{line}</MathLine>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </article>
      </section>
    </div>
  )
}
