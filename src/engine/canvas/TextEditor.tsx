import { useLayoutEffect, useRef, useState } from 'react'
import { cssFontFamily } from '@/config/fonts'
import type { TextNode } from '../types'
import { selectActiveNodes } from '../store/editorStore'
import { useEditor, useEditorStore } from '../provider/EditorProvider'

/**
 * Inline text editing via a DOM <textarea> overlaid on the Konva text.
 * Konva cannot host a caret (Canvas API limitation); this is the official pattern:
 * https://konvajs.org/docs/sandbox/Editable_Text.html
 *
 * Enter = new line · Cmd/Ctrl+Enter or click away = apply · Esc = cancel.
 * Formatting (font/size/style/color) comes from the node — live via the toolbar.
 */
export function TextEditor({ scale }: { scale: number }) {
  const node = useEditor((s) => {
    const id = s.editingTextId
    return id ? selectActiveNodes(s).find((n) => n.id === id) : undefined
  })
  if (!node || node.type !== 'text') return null
  return <TextEditorField key={node.id} node={node} scale={scale} />
}

function TextEditorField({ node, scale }: { node: TextNode; scale: number }) {
  const store = useEditorStore()
  const ref = useRef<HTMLTextAreaElement>(null)
  const state = useRef({ done: false, cancelled: false })
  const [value, setValue] = useState(node.text)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.focus()
    el.select()
  }, [])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = '0'
    el.style.height = `${el.scrollHeight}px`
  }, [value, scale, node.fontSize, node.fontFamily, node.fontStyle, node.width])

  const finish = () => {
    if (state.current.done) return
    state.current.done = true
    const s = store.getState()
    s.stopEditing()
    if (state.current.cancelled || value === node.text) return
    if (value.trim() === '') {
      s.select([node.id])
      s.removeSelected()
    } else {
      s.updateNode(node.id, { text: value })
    }
  }

  const bold = /bold/.test(node.fontStyle)
  const italic = /italic/.test(node.fontStyle)

  return (
    <textarea
      ref={ref}
      value={value}
      spellCheck={false}
      aria-label="Edit text"
      onChange={(e) => setValue(e.target.value)}
      onBlur={finish}
      onKeyDown={(e) => {
        e.stopPropagation()
        if (e.key === 'Escape') {
          state.current.cancelled = true
          e.currentTarget.blur()
        } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          e.currentTarget.blur()
        }
      }}
      style={{
        position: 'absolute',
        left: node.x * scale,
        top: node.y * scale,
        width: (node.width ?? 200) * scale,
        transform: `rotate(${node.rotation}deg)`,
        transformOrigin: '0 0',
        fontSize: node.fontSize * scale,
        fontFamily: cssFontFamily(node.fontFamily),
        fontWeight: bold ? 700 : 400,
        fontStyle: italic ? 'italic' : 'normal',
        lineHeight: 1.15,
        color: node.fill,
        textAlign: node.align,
        opacity: node.opacity,
        background: 'transparent',
        border: 'none',
        outline: '1px dashed #3a43c8',
        resize: 'none',
        overflow: 'hidden',
        padding: 0,
        margin: 0,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        zIndex: 10,
        caretColor: node.fill,
      }}
    />
  )
}
