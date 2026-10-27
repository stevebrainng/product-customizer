import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Type,
} from 'lucide-react'
import { FONTS, FONT_SIZES, DEFAULT_FONT_FAMILY, findFont, fontLoadSpecs, cssFontFamily } from '@/config/fonts'
import {
  selectActiveNodes,
  useEditor,
  useEditorRuntime,
  type TextNode,
} from '@/engine'
import { IconButton } from '@/ui/Button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

/**
 * Floating formatting bar for the selected text node.
 * Mirrors Konva.Text props (one style per node — not mixed-span rich text).
 */
export function TextToolbar() {
  const runtime = useEditorRuntime()
  const updateNode = useEditor((s) => s.updateNode)
  const startEditing = useEditor((s) => s.startEditing)
  const editing = useEditor((s) => s.editingTextId)

  const node = useEditor((s) => {
    if (s.selection.length !== 1) return null
    const n = selectActiveNodes(s).find((x) => x.id === s.selection[0])
    return n?.type === 'text' && !n.locked ? n : null
  })

  if (!node) return null

  const bold = /bold/.test(node.fontStyle)
  const italic = /italic/.test(node.fontStyle)
  const current = findFont(node.fontFamily)
  const patch = (p: Partial<TextNode>) => updateNode(node.id, p)

  const setStyle = (nextBold: boolean, nextItalic: boolean) => {
    const parts: string[] = []
    if (nextBold) parts.push('bold')
    if (nextItalic) parts.push('italic')
    patch({ fontStyle: parts.join(' ') || 'normal' })
  }

  const applyFont = (family: string | null) => {
    if (!family) return
    patch({ fontFamily: family })
    void runtime.ensureFonts(fontLoadSpecs(family, node.fontSize))
  }

  const styleValue = [
    ...(bold ? ['bold'] : []),
    ...(italic ? ['italic'] : []),
  ]

  const sizeValue = FONT_SIZES.includes(node.fontSize as (typeof FONT_SIZES)[number])
    ? String(node.fontSize)
    : String(Math.round(node.fontSize))

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      className="pointer-events-auto absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-border bg-card/95 p-1.5 shadow-md backdrop-blur"
      onMouseDown={(e) => e.preventDefault()}
    >
      <IconButton
        icon={Type}
        label={editing === node.id ? 'Editing…' : 'Edit text'}
        variant={editing === node.id ? 'secondary' : 'outline'}
        onClick={() => startEditing(node.id)}
      />

      <Select value={current?.family ?? DEFAULT_FONT_FAMILY} onValueChange={applyFont}>
        <SelectTrigger className="w-[148px]" aria-label="Font">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {FONTS.map((f) => (
              <SelectItem key={f.id} value={f.family}>
                <span style={{ fontFamily: cssFontFamily(f.family) }}>{f.label}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select
        value={sizeValue}
        onValueChange={(v) => {
          const n = Number(v)
          if (Number.isFinite(n)) patch({ fontSize: n })
        }}
      >
        <SelectTrigger className="w-[72px]" aria-label="Font size">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {!FONT_SIZES.includes(node.fontSize as (typeof FONT_SIZES)[number]) && (
              <SelectItem value={String(Math.round(node.fontSize))}>
                {Math.round(node.fontSize)}
              </SelectItem>
            )}
            {FONT_SIZES.map((s) => (
              <SelectItem key={s} value={String(s)}>
                {s}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="mx-0.5! h-7" />

      <ToggleGroup
        multiple
        variant="outline"
        spacing={0}
        value={styleValue}
        onValueChange={(next) => setStyle(next.includes('bold'), next.includes('italic'))}
        aria-label="Font style"
      >
        <ToggleGroupItem value="bold" aria-label="Bold">
          <Bold />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          <Italic />
        </ToggleGroupItem>
      </ToggleGroup>

      <ToggleGroup
        variant="outline"
        spacing={0}
        value={[node.align]}
        onValueChange={(next) => {
          const align = next[0] as TextNode['align'] | undefined
          if (align) patch({ align })
        }}
        aria-label="Text alignment"
      >
        <ToggleGroupItem value="left" aria-label="Align left">
          <AlignLeft />
        </ToggleGroupItem>
        <ToggleGroupItem value="center" aria-label="Align center">
          <AlignCenter />
        </ToggleGroupItem>
        <ToggleGroupItem value="right" aria-label="Align right">
          <AlignRight />
        </ToggleGroupItem>
      </ToggleGroup>

      <input
        type="color"
        aria-label="Text color"
        className="size-9 cursor-pointer rounded-lg border border-input bg-background p-1"
        value={/^#[0-9a-fA-F]{6}$/.test(node.fill) ? node.fill : '#111111'}
        onChange={(e) => patch({ fill: e.target.value })}
      />
    </div>
  )
}
