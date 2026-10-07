export type IconName =
  | 'solve' | 'tools' | 'book' | 'exam' | 'history' | 'check'
  | 'arrow' | 'back' | 'chart' | 'geometry' | 'fraction' | 'clock'

const paths: Record<IconName, string> = {
  solve: 'M4 5h16M4 12h6m4 0h6M4 19h16M8 2v6m8 8v6',
  tools: 'M7 7h10M7 12h10M7 17h6M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z',
  book: 'M4 4.5A2.5 2.5 0 0 1 6.5 2H11a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H6.5A2.5 2.5 0 0 0 4 19.5v-15Zm16 0A2.5 2.5 0 0 0 17.5 2H14v18a3 3 0 0 1 3-3h.5a2.5 2.5 0 0 1 2.5 2.5v-15Z',
  exam: 'M8 3h8l2 3v15H6V6l2-3Zm1 7h6m-6 4h6m-6 4h4',
  history: 'M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5m4-2v6l4 2',
  check: 'm5 12 4 4L19 6',
  arrow: 'm9 18 6-6-6-6',
  back: 'm15 18-6-6 6-6',
  chart: 'M4 20V10m6 10V4m6 16v-7m4 7H2',
  geometry: 'M12 3 3 20h18L12 3Zm0 6v5m0 3h.01',
  fraction: 'M7 5h10M7 19h10M6 12h12',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-15v5l3 2'
}

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}
