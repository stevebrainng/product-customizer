import { useEffect } from 'react'
import { useEditorStore } from '../provider/EditorProvider'
import { selectActiveNodes } from '../store/editorStore'

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))

/** Keyboard parity for pointer actions: undo/redo, delete, duplicate, nudge, deselect. */
export function useEditorShortcuts() {
  const store = useEditorStore()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return
      const s = store.getState()
      const mod = e.metaKey || e.ctrlKey
      const key = e.key.toLowerCase()
      const step = e.shiftKey ? 10 : 1

      if (mod && key === 'z') { e.preventDefault(); e.shiftKey ? s.redo() : s.undo() }
      else if (mod && key === 'y') { e.preventDefault(); s.redo() }
      else if (mod && key === 'd') { e.preventDefault(); s.duplicateSelected() }
      else if (key === 'delete' || key === 'backspace') { if (s.selection.length) { e.preventDefault(); s.removeSelected() } }
      else if (mod && key === 'a') { e.preventDefault(); s.select(selectActiveNodes(s).filter((n) => !n.hidden).map((n) => n.id)) }
      else if (key === 'escape') s.clearSelection()
      else if (key.startsWith('arrow') && s.selection.length) {
        e.preventDefault()
        s.nudgeSelected(key === 'arrowleft' ? -step : key === 'arrowright' ? step : 0, key === 'arrowup' ? -step : key === 'arrowdown' ? step : 0)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [store])
}
