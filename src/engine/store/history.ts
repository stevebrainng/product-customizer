export interface History<T> { past: T[]; present: T; future: T[] }

export const createHistory = <T>(present: T): History<T> => ({ past: [], present, future: [] })

/** One entry per finished user action (drag end, transform end, add, delete), never per pointer move. */
export function pushHistory<T>(h: History<T>, next: T, limit = 100): History<T> {
  if (Object.is(h.present, next)) return h
  return { past: [...h.past, h.present].slice(-limit), present: next, future: [] }
}

export function undoHistory<T>(h: History<T>): History<T> {
  if (!h.past.length) return h
  return { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] }
}

export function redoHistory<T>(h: History<T>): History<T> {
  if (!h.future.length) return h
  return { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) }
}
