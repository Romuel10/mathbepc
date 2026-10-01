export interface ChapterProgress {
  attempts: number;
  correct: number;
  visits: number;
  bestExamScore: number;
}

export interface ProgressData {
  attempts: number;
  correct: number;
  examsCompleted: number;
  bestExamPercent: number;
  streakDays: number;
  lastActiveDate: string;
  byChapter: Record<string, ChapterProgress>;
}

const STORAGE_KEY = 'mathbepc-progress-v2';

function emptyChapter(): ChapterProgress {
  return { attempts: 0, correct: 0, visits: 0, bestExamScore: 0 };
}

export function emptyProgress(): ProgressData {
  return {
    attempts: 0,
    correct: 0,
    examsCompleted: 0,
    bestExamPercent: 0,
    streakDays: 0,
    lastActiveDate: '',
    byChapter: {},
  };
}

export function loadProgress(): ProgressData {
  if (typeof window === 'undefined') return emptyProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    return { ...emptyProgress(), ...JSON.parse(raw) };
  } catch {
    return emptyProgress();
  }
}

function dateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function updateStreak(data: ProgressData): void {
  const today = dateKey();
  if (data.lastActiveDate === today) return;
  if (!data.lastActiveDate) {
    data.streakDays = 1;
  } else {
    const previous = new Date(`${data.lastActiveDate}T00:00:00`);
    const current = new Date(`${today}T00:00:00`);
    const days = Math.round((current.getTime() - previous.getTime()) / 86400000);
    data.streakDays = days === 1 ? data.streakDays + 1 : 1;
  }
  data.lastActiveDate = today;
}

export function saveProgress(data: ProgressData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent('mathbepc-progress', { detail: data }));
}

export function recordVisit(chapterId: string): ProgressData {
  const data = loadProgress();
  updateStreak(data);
  data.byChapter[chapterId] ??= emptyChapter();
  data.byChapter[chapterId].visits += 1;
  saveProgress(data);
  return data;
}

export function recordAttempt(chapterId: string, correct: boolean): ProgressData {
  const data = loadProgress();
  updateStreak(data);
  data.attempts += 1;
  if (correct) data.correct += 1;
  data.byChapter[chapterId] ??= emptyChapter();
  data.byChapter[chapterId].attempts += 1;
  if (correct) data.byChapter[chapterId].correct += 1;
  saveProgress(data);
  return data;
}

export function recordExam(score: number, total: number, chapterIds: string[]): ProgressData {
  const data = loadProgress();
  updateStreak(data);
  const percent = total ? Math.round((score / total) * 100) : 0;
  data.examsCompleted += 1;
  data.bestExamPercent = Math.max(data.bestExamPercent, percent);
  for (const chapterId of new Set(chapterIds)) {
    data.byChapter[chapterId] ??= emptyChapter();
    data.byChapter[chapterId].bestExamScore = Math.max(data.byChapter[chapterId].bestExamScore, percent);
  }
  saveProgress(data);
  return data;
}

export function resetProgress(): void {
  saveProgress(emptyProgress());
}
