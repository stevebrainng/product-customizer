import { useRef, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowDown, ArrowDownToLine, ArrowUp, ArrowUpToLine, Copy, Eye, EyeOff, GripVertical, Lock, LockOpen, Trash2,
} from 'lucide-react'
import {
  getNodeDefinition, selectActiveNodes, useEditor, type Asset, type DesignNode,
} from '@/engine'
import { cssFontFamily } from '@/config/fonts'
import { NODE_ICONS } from '@/config/nodeIcons'
import { IconButton } from '@/ui/Button'
import { EmptyState } from '@/ui/EmptyState'
import { cn } from '@/lib/cn'

function layerName(node: DesignNode, assets: Record<string, Asset>) {
  if (node.label) return node.label
  if (node.type === 'text') return node.text.split('\n')[0].slice(0, 28) || 'Text'
  if (node.type === 'image') return assets[node.assetId]?.name ?? 'Image'
  return getNodeDefinition(node.type).label
}

function swatch(node: DesignNode): string {
  if (node.type === 'line') return node.stroke
  if (node.type === 'text') return node.fill
  if (node.type === 'image') return '#ffffff'
  return node.fill
}

function LayerThumb({ node, assets }: { node: DesignNode; assets: Record<string, Asset> }) {
  if (node.type === 'image') {
    const src = assets[node.assetId]?.src
    if (src) return <img src={src} alt="" className="size-8 rounded-md object-cover" draggable={false} />
  }
  if (node.type === 'text') {
    return (
      <span
        className="grid size-8 place-items-center rounded-md bg-white text-[12px] font-semibold"
        style={{ color: node.fill, fontFamily: cssFontFamily(node.fontFamily) }}
      >
        Ag
      </span>
    )
  }
  const Icon = NODE_ICONS[node.type]
  return (
    <span className="grid size-8 place-items-center rounded-md" style={{ background: swatch(node), color: '#26262b' }}>
      <Icon size={15} />
    </span>
  )
}

function LayerRow({
  node,
  assets,
  active,
  front,
  onSelect,
  onRename,
  onToggleLock,
  onToggleHidden,
}: {
  node: DesignNode
  assets: Record<string, Asset>
  active: boolean
  front: boolean
  onSelect: (shift: boolean) => void
  onRename: (label: string) => void
  onToggleLock: () => void
  onToggleHidden: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: node.id })
  const name = layerName(node, assets)
  const [renaming, setRenaming] = useState(false)
  const [draft, setDraft] = useState(name)
  const cancel = useRef(false)
  const opacity = node.opacity < 0.995 ? `${Math.round(node.opacity * 100)}%` : null
  const meta = [getNodeDefinition(node.type).label, front ? 'In front' : null, opacity].filter(Boolean).join(' · ')

  const commit = () => {
    setRenaming(false)
    if (cancel.current) {
      cancel.current = false
      return
    }
    const next = draft.trim()
    if (next !== name) onRename(next)
  }

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && 'z-10 opacity-70')}
    >
      <div
        className={cn(
          'flex items-center gap-1 rounded-lg border py-1 pr-1',
          active ? 'border-accent-line bg-accent-soft' : 'border-transparent bg-black/[0.03] hover:bg-black/[0.06]',
          node.hidden && 'opacity-60',
        )}
      >
        <button
          type="button"
          className="grid h-10 w-6 shrink-0 cursor-grab place-items-center text-muted-foreground active:cursor-grabbing"
          aria-label={`Reorder ${name}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>
        <LayerThumb node={node} assets={assets} />
        {renaming ? (
          <input
            autoFocus
            aria-label={`Rename ${name}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur()
              if (e.key === 'Escape') {
                cancel.current = true
                setDraft(name)
                setRenaming(false)
              }
            }}
            className="h-8 min-w-0 flex-1 rounded-md bg-white px-1.5 text-[13px] outline-none ring-1 ring-primary/40"
          />
        ) : (
          <button
            type="button"
            onClick={(e) => onSelect(e.shiftKey)}
            onDoubleClick={() => {
              setDraft(name)
              setRenaming(true)
            }}
            className={cn(
              'flex h-10 min-w-0 flex-1 flex-col justify-center rounded-md text-left outline-none',
              'focus-visible:ring-2 focus-visible:ring-primary/40',
              node.hidden && 'text-muted-foreground',
            )}
          >
            <span className={cn('truncate text-[13px]', node.hidden && 'line-through')}>{name}</span>
            <span className="truncate text-[11px] text-muted-foreground">{meta}</span>
          </button>
        )}
        <IconButton
          icon={node.locked ? Lock : LockOpen}
          label={node.locked ? 'Unlock' : 'Lock'}
          size="icon-sm"
          variant="ghost"
          onClick={onToggleLock}
        />
        <IconButton
          icon={node.hidden ? EyeOff : Eye}
          label={node.hidden ? 'Show' : 'Hide'}
          size="icon-sm"
          variant="ghost"
          onClick={onToggleHidden}
        />
      </div>
    </li>
  )
}

/** Top of the list is the front of the canvas. Drag a row to restack it. */
export function LayersPanel() {
  const nodes = useEditor(selectActiveNodes)
  const side = useEditor((s) => s.activeSide)
  const selection = useEditor((s) => s.selection)
  const assets = useEditor((s) => s.assets)
  const select = useEditor((s) => s.select)
  const toggleSelect = useEditor((s) => s.toggleSelect)
  const updateNode = useEditor((s) => s.updateNode)
  const reorderSelected = useEditor((s) => s.reorderSelected)
  const setLayerOrder = useEditor((s) => s.setLayerOrder)
  const duplicateSelected = useEditor((s) => s.duplicateSelected)
  const removeSelected = useEditor((s) => s.removeSelected)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const none = selection.length === 0
  const rows = [...nodes].reverse()
  const ids = rows.map((n) => n.id)

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    setLayerOrder(arrayMove(ids, oldIndex, newIndex))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between px-0.5">
        <p className="text-[13px] font-medium capitalize">{side}</p>
        <p className="text-[12px] text-muted-foreground">
          {rows.length === 0 ? 'Empty' : `${rows.length} ${rows.length === 1 ? 'layer' : 'layers'}`}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <IconButton icon={ArrowUpToLine} label="Bring to front" disabled={none} onClick={() => reorderSelected('front')} />
        <IconButton icon={ArrowUp} label="Bring forward" disabled={none} onClick={() => reorderSelected('forward')} />
        <IconButton icon={ArrowDown} label="Send backward" disabled={none} onClick={() => reorderSelected('backward')} />
        <IconButton icon={ArrowDownToLine} label="Send to back" disabled={none} onClick={() => reorderSelected('back')} />
        <span className="flex-1" />
        <IconButton icon={Copy} label="Duplicate" disabled={none} onClick={duplicateSelected} />
        <IconButton icon={Trash2} label="Delete" disabled={none} onClick={removeSelected} />
      </div>

      {rows.length === 0 ? (
        <div className="grid place-items-center pt-8">
          <EmptyState title="No layers on this side">
            <p className="max-w-[220px] text-[12px] text-muted-foreground">
              Drag a shape, sticker, text, or photo onto the product. A click still drops it in the print area.
            </p>
          </EmptyState>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <ul className="space-y-1">
              {rows.map((node, index) => (
                <LayerRow
                  key={node.id}
                  node={node}
                  assets={assets}
                  active={selection.includes(node.id)}
                  front={index === 0}
                  onSelect={(shift) => (shift ? toggleSelect(node.id) : select([node.id]))}
                  onRename={(label) => updateNode(node.id, { label })}
                  onToggleLock={() => updateNode(node.id, { locked: !node.locked })}
                  onToggleHidden={() => updateNode(node.id, { hidden: !node.hidden })}
                />
              ))}
            </ul>
          </SortableContext>
          <p className="px-0.5 pt-1 text-[11px] text-muted-foreground">Drag the handle to reorder. Double-click a name to rename it.</p>
        </DndContext>
      )}
    </div>
  )
}
