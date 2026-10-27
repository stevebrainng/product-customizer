import { useState } from 'react'
import { ChevronDown, ImagePlus, Move, Plus, Trash2, Upload } from 'lucide-react'
import {
  clampRect, createId, createProductFromImage, pickProductImage, selectProduct, useEditor, worldFor,
  type ProductImage, type SideId,
} from '@/engine'
import { SIZE_PRESETS } from '@/config/products'
import { Button } from '@/ui/Button'
import { Chip } from '@/ui/Chip'
import { Field, TextInput } from '@/ui/Field'
import { PanelSection } from '@/ui/PanelSection'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'


function ImageSlot({ side, label }: { side: SideId; label: string }) {
  const product = useEditor(selectProduct)
  const updateProduct = useEditor((s) => s.updateProduct)
  const updateSide = useEditor((s) => s.updateSide)
  const cfg = product.sides[side]
  const shown = cfg.image ?? product.sides.front.image

  const replace = async () => {
    const img: ProductImage | null = await pickProductImage()
    if (!img) return
    if (side === 'front') {
      const world = worldFor(img.width, img.height)
      updateProduct({ world })
      updateSide('front', { image: img.src, tintable: img.tintable, printArea: clampRect(cfg.printArea, world) })
    } else {
      updateSide('back', { image: img.src, tintable: img.tintable })
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="grid aspect-square place-items-center overflow-hidden rounded-xl bg-linear-to-b from-tile-from to-tile-to">
        {shown ? <img src={shown} alt={`${label} photo`} className="size-full object-contain p-1" /> : <ImagePlus className="text-muted-foreground" />}
      </div>
      <div className="flex flex-col items-center justify-between gap-1">
        <span className="text-[12px] text-muted-foreground">{label}{side === 'back' && !cfg.image ? ' (uses front)' : ''}</span>
        <div className="flex gap-1">
          <Button className="h-7 px-2 text-[12px]" onClick={replace}>
            <Upload data-icon="inline-start" /> {cfg.image || side === 'front' ? 'Replace' : 'Upload'}
          </Button>
          {side === 'back' && cfg.image && (
            <Button className="h-7 px-2 text-[12px]" onClick={() => updateSide('back', { image: null, tintable: product.sides.front.tintable })}>
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function DimInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (n: number) => void
}) {
  return (
    <InputGroup className="h-8 w-[7.25rem]">
      <InputGroupAddon>
        <InputGroupText className="min-w-4 justify-center px-0 text-[11px] font-semibold tracking-wide">
          {label}
        </InputGroupText>
      </InputGroupAddon>
      <InputGroupInput
        type="number"
        aria-label={label}
        className="px-1.5 text-[13px] tabular-nums"
        value={Math.round(value)}
        onChange={(e) => {
          const n = e.currentTarget.valueAsNumber
          if (Number.isFinite(n)) onChange(n)
        }}
      />
    </InputGroup>
  )
}

function PrintAreaSection() {
  const product = useEditor(selectProduct)
  const side = useEditor((s) => s.activeSide)
  const editing = useEditor((s) => s.editingPrintArea)
  const setEditing = useEditor((s) => s.setEditingPrintArea)
  const updateSide = useEditor((s) => s.updateSide)
  const area = product.sides[side].printArea
  const set = (patch: Partial<typeof area>) => updateSide(side, { printArea: clampRect({ ...area, ...patch }, product.world) })
  const [open, setOpen] = useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger
        className={cn(
          'flex h-8 w-full items-center justify-between rounded-lg px-1 text-left text-[14px] font-semibold',
          'hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        )}
      >
        Print area ({side})
        <ChevronDown
          className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-2.5 pt-2 data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0">
        <div className="flex flex-wrap gap-1.5">
          <DimInput label="X" value={area.x} onChange={(x) => set({ x })} />
          <DimInput label="Y" value={area.y} onChange={(y) => set({ y })} />
          <DimInput label="W" value={area.width} onChange={(width) => set({ width })} />
          <DimInput label="H" value={area.height} onChange={(height) => set({ height })} />
        </div>
        <Button
          className={cn(
            'w-full',
            editing && 'border-accent-line bg-accent-soft text-primary hover:bg-accent-soft',
          )}
          onClick={() => setEditing(!editing)}
        >
          <Move data-icon="inline-start" /> {editing ? 'Done adjusting' : 'Adjust on canvas'}
        </Button>
      </CollapsibleContent>
    </Collapsible>
  )
}

function ColorSection() {
  const product = useEditor(selectProduct)
  const colorId = useEditor((s) => s.variant.colorId)
  const side = useEditor((s) => s.activeSide)
  const setColor = useEditor((s) => s.setColor)
  const updateProduct = useEditor((s) => s.updateProduct)
  const [draft, setDraft] = useState('#4f46e5')

  const tintable = product.sides[side].image ? product.sides[side].tintable : product.sides.front.tintable
  const selected = product.colors.find((c) => c.id === colorId)

  const add = () => {
    const color = { id: createId('color'), name: draft.toUpperCase(), hex: draft }
    updateProduct({ colors: [...product.colors, color] })
    setColor(color.id)
  }
  const remove = () => selected && updateProduct({ colors: product.colors.filter((c) => c.id !== selected.id) })

  return (
    <PanelSection title="Color">
      <div className={cn('flex flex-wrap gap-2', !tintable && 'pointer-events-none opacity-40')}>
        {product.colors.map((c) => (
          <button
            key={c.id}
            type="button"
            title={c.name}
            aria-label={c.name}
            aria-pressed={c.id === colorId}
            onClick={() => setColor(c.id)}
            className={cn(
              'size-7 rounded-full border border-black/15 outline-none transition-shadow',
              'focus-visible:ring-2 focus-visible:ring-primary/50',
              c.id === colorId && 'ring-2 ring-accent ring-offset-2 ring-offset-canvas',
            )}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>
      {tintable ? (
        <p className="text-[12px] text-muted-foreground">{selected?.name ?? 'No color'}</p>
      ) : (
        <p className="text-[12px] text-muted-foreground">
          This photo has a solid background, so it can’t be recolored. Upload a PNG with a transparent background to enable colors.
        </p>
      )}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="New color"
          className="h-9 w-10 shrink-0 cursor-pointer rounded-lg border border-input bg-background p-1"
        />
        <Button className="flex-1" onClick={add}><Plus data-icon="inline-start" /> Add color</Button>
        <Button size="icon-lg" aria-label="Remove selected color" disabled={!selected || product.colors.length < 2} onClick={remove}>
          <Trash2 />
        </Button>
      </div>
    </PanelSection>
  )
}

function SizeSection() {
  const product = useEditor(selectProduct)
  const size = useEditor((s) => s.variant.size)
  const setSize = useEditor((s) => s.setSize)
  const updateProduct = useEditor((s) => s.updateProduct)
  const [editing, setEditing] = useState(false)

  const toggle = (sz: string) =>
    updateProduct({
      sizes: product.sizes.includes(sz)
        ? product.sizes.filter((x) => x !== sz)
        : SIZE_PRESETS.filter((x) => x === sz || product.sizes.includes(x)),
    })

  return (
    <PanelSection
      title="Size"
      actions={
        <button type="button" onClick={() => setEditing(!editing)} className="ml-auto text-[13px] text-primary hover:underline">
          {editing ? 'Done' : 'Edit sizes'}
        </button>
      }
    >
      <div className="flex flex-wrap gap-1.5">
        {(editing ? SIZE_PRESETS : product.sizes).map((sz) => (
          <Chip
            key={sz}
            active={editing ? product.sizes.includes(sz) : sz === size}
            onClick={() => (editing ? toggle(sz) : setSize(sz))}
          >
            {sz}
          </Chip>
        ))}
      </div>
      <p className="text-[12px] text-muted-foreground">
        {editing ? 'Choose the sizes this product is offered in.' : `Selected: ${size ?? 'none'}`}
      </p>
    </PanelSection>
  )
}

export function ProductPanel() {
  const products = useEditor((s) => s.products)
  const productId = useEditor((s) => s.productId)
  const product = useEditor(selectProduct)
  const setProduct = useEditor((s) => s.setProduct)
  const addProduct = useEditor((s) => s.addProduct)
  const removeProduct = useEditor((s) => s.removeProduct)
  const updateProduct = useEditor((s) => s.updateProduct)
  const list = Object.values(products)

  const upload = async () => {
    const img = await pickProductImage()
    if (img) addProduct(createProductFromImage(`Product ${list.length + 1}`, img))
  }

  return (
    <div className="space-y-6">
      <PanelSection title="Product">
        <div className="flex gap-2">
          <Select value={productId} onValueChange={(id) => id && setProduct(id)}>
            <SelectTrigger className="h-9 flex-1" aria-label="Product">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {list.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button size="icon-lg" aria-label="Delete product" disabled={list.length < 2} onClick={() => removeProduct(productId)}>
            <Trash2 />
          </Button>
        </div>
        <Button className="w-full" onClick={upload}><Upload data-icon="inline-start" /> Upload product photo</Button>
        <Field label="Name">
          <TextInput value={product.name} onChange={(e) => updateProduct({ name: e.target.value })} />
        </Field>
      </PanelSection>

      <PanelSection title="Photos">
        <div className="grid grid-cols-2 gap-3">
          <ImageSlot side="front" label="Front" />
          <ImageSlot side="back" label="Back" />
        </div>
      </PanelSection>

      <PrintAreaSection />
      <ColorSection />
      <SizeSection />
    </div>
  )
}
