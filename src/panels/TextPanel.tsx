import { useMemo, useState } from 'react'
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Type } from 'lucide-react'
import { FONTS, DEFAULT_FONT_FAMILY, findFont, fontLoadSpecs, cssFontFamily } from '@/config/fonts'
import { TEXT_PRESETS } from '@/data/presets'
import { TEXT_TOTAL } from '@/data/catalog'
import {
  selectActiveNodes,
  useEditor,
  useEditorRuntime,
  type TextNode,
} from '@/engine'
import { SearchInput } from '@/ui/SearchInput'
import { PanelSection } from '@/ui/PanelSection'
import { ScrollRow } from '@/ui/ScrollRow'
import { Tile } from '@/ui/Tile'
import { Field, NumberInput, inputClass } from '@/ui/Field'
import { Button } from '@/ui/Button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'

type Align = TextNode['align']

function useSelectedText(): TextNode | null {
  return useEditor((s) => {
    if (s.selection.length !== 1) return null
    const node = selectActiveNodes(s).find((n) => n.id === s.selection[0])
    return node?.type === 'text' ? node : null
  })
}

function StyleToggles({ node }: { node: TextNode }) {
  const updateNode = useEditor((s) => s.updateNode)
  const bold = /bold/.test(node.fontStyle)
  const italic = /italic/.test(node.fontStyle)
  const setStyle = (nextBold: boolean, nextItalic: boolean) => {
    const parts: string[] = []
    if (nextBold) parts.push('bold')
    if (nextItalic) parts.push('italic')
    updateNode(node.id, { fontStyle: parts.join(' ') || 'normal' })
  }
  const setAlign = (align: Align) => updateNode(node.id, { align })
  const styleValue = [...(bold ? ['bold'] : []), ...(italic ? ['italic'] : [])]

  return (
    <div className="flex flex-wrap gap-1.5">
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
          const align = next[0] as Align | undefined
          if (align) setAlign(align)
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
    </div>
  )
}

function SelectedTextControls({ node }: { node: TextNode }) {
  const updateNode = useEditor((s) => s.updateNode)
  const startEditing = useEditor((s) => s.startEditing)
  const runtime = useEditorRuntime()
  const current = findFont(node.fontFamily)

  const applyFont = (family: string) => {
    updateNode(node.id, { fontFamily: family })
    void runtime.ensureFonts(fontLoadSpecs(family, node.fontSize))
  }

  return (
    <PanelSection title="Selected text">
      <Button className="w-full" onClick={() => startEditing(node.id)}>
        <Type size={14} /> Edit on canvas
      </Button>
      <Field label="Content">
        <textarea
          className={cn(inputClass, 'h-20 resize-y py-2')}
          value={node.text}
          onChange={(e) => updateNode(node.id, { text: e.target.value })}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Size">
          <NumberInput
            value={node.fontSize}
            min={6}
            max={400}
            onChange={(fontSize) => updateNode(node.id, { fontSize: Math.max(6, fontSize) })}
          />
        </Field>
        <Field label="Color">
          <input
            type="color"
            aria-label="Text color"
            className="h-9 w-full cursor-pointer rounded-lg border border-line bg-surface p-1"
            value={/^#[0-9a-fA-F]{6}$/.test(node.fill) ? node.fill : '#111111'}
            onChange={(e) => updateNode(node.id, { fill: e.target.value })}
          />
        </Field>
      </div>
      <Field label="Font">
        <select
          className={inputClass}
          value={current?.family ?? DEFAULT_FONT_FAMILY}
          onChange={(e) => applyFont(e.target.value)}
        >
          {FONTS.map((f) => (
            <option key={f.id} value={f.family} style={{ fontFamily: cssFontFamily(f.family) }}>
              {f.label}
            </option>
          ))}
        </select>
      </Field>
      <StyleToggles node={node} />
    </PanelSection>
  )
}

export function TextPanel() {
  const addNode = useEditor((s) => s.addNode)
  const startEditing = useEditor((s) => s.startEditing)
  const updateNode = useEditor((s) => s.updateNode)
  const runtime = useEditorRuntime()
  const selected = useSelectedText()
  const [query, setQuery] = useState('')

  const fonts = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return FONTS
    return FONTS.filter((f) => f.label.toLowerCase().includes(q) || f.category.includes(q))
  }, [query])

  const addText = (overrides: Partial<TextNode> = {}) => {
    const id = addNode('text', {
      fontFamily: DEFAULT_FONT_FAMILY,
      ...overrides,
    })
    const family = (overrides.fontFamily as string | undefined) ?? DEFAULT_FONT_FAMILY
    void runtime.ensureFonts(fontLoadSpecs(family, overrides.fontSize ?? 48))
    startEditing(id)
  }

  const applyFontToSelectionOrAdd = (family: string) => {
    void runtime.ensureFonts(fontLoadSpecs(family))
    if (selected) {
      updateNode(selected.id, { fontFamily: family })
      return
    }
    addText({ fontFamily: family, text: 'Your text', fontStyle: 'bold' })
  }

  return (
    <div className="space-y-5">
      <SearchInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search fonts" />

      {selected && <SelectedTextControls node={selected} />}

      <PanelSection title="Add text" total={TEXT_TOTAL}>
        <div className="grid gap-2">
          <Button
            className="h-11 justify-start px-3 text-[15px] font-extrabold tracking-tight"
            onClick={() => addText(TEXT_PRESETS.title.overrides as Partial<TextNode>)}
          >
            Add a title
          </Button>
          <Button
            className="h-10 justify-start px-3 text-[14px] font-medium"
            onClick={() => addText({ text: 'Subtitle', fontSize: 36, fontStyle: 'normal' })}
          >
            Add a subtitle
          </Button>
          <Button
            className="h-9 justify-start px-3 text-[13px] font-normal"
            onClick={() => addText({ text: 'Body text', fontSize: 24, fontStyle: 'normal', align: 'left' })}
          >
            Add body text
          </Button>
        </div>
        <ScrollRow>
          <Tile aria-label="Add title text" onClick={() => addText(TEXT_PRESETS.title.overrides as Partial<TextNode>)}>
            <span className="text-[19px] font-extrabold tracking-tight">TITLE</span>
          </Tile>
          <Tile aria-label="Add fashion text" onClick={() => addText(TEXT_PRESETS.fashion.overrides as Partial<TextNode>)}>
            <span className="rounded-sm bg-emerald-50 px-1 text-[14px] font-light tracking-wide text-emerald-900">
              FASHION
            </span>
          </Tile>
          <Tile aria-label="Add boxed text" onClick={() => addText(TEXT_PRESETS.box.overrides as Partial<TextNode>)}>
            <span className="w-[71px] bg-blue-200 px-1 py-1.5 text-center text-[7px] font-bold leading-[1.15] text-blue-950">
              Text in a box. Not message in a bottle.
            </span>
          </Tile>
        </ScrollRow>
      </PanelSection>

      <PanelSection title="Fonts">
        <div className="grid gap-1.5">
          {fonts.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => applyFontToSelectionOrAdd(f.family)}
              className={cn(
                'flex h-11 items-center rounded-lg border border-line bg-surface px-3 text-left text-[18px] transition-colors',
                'hover:border-accent-line hover:bg-accent-soft/40',
                selected && findFont(selected.fontFamily)?.id === f.id && 'border-accent-line bg-accent-soft text-primary',
              )}
              style={{ fontFamily: cssFontFamily(f.family) }}
            >
              <span className="min-w-0 flex-1 truncate">{f.label}</span>
              <span className="ml-2 text-[11px] font-sans capitalize text-muted-foreground">{f.category}</span>
            </button>
          ))}
          {fonts.length === 0 && (
            <p className="py-6 text-center text-[13px] text-muted-foreground">No fonts match “{query}”</p>
          )}
        </div>
      </PanelSection>
    </div>
  )
}
