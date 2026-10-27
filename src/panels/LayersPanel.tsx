import {
  ArrowDown, ArrowDownToLine, ArrowUp, ArrowUpToLine, Copy, Eye, EyeOff, Lock, LockOpen, Trash2,
} from 'lucide-react'
import { getNodeDefinition, selectActiveNodes, useEditor, type Asset, type DesignNode } from '@/engine'
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

/** Top of the list = front of the canvas. Uses the same store actions as the canvas and shortcuts. */
export function LayersPanel() {
  const nodes = useEditor(selectActiveNodes)
  const selection = useEditor((s) => s.selection)
  const assets = useEditor((s) => s.assets)
  const select = useEditor((s) => s.select)
  const toggleSelect = useEditor((s) => s.toggleSelect)
  const updateNode = useEditor((s) => s.updateNode)
  const reorderSelected = useEditor((s) => s.reorderSelected)
  const duplicateSelected = useEditor((s) => s.duplicateSelected)
  const removeSelected = useEditor((s) => s.removeSelected)

  const none = selection.length === 0
  const rows = [...nodes].reverse()

  return (
    <div className="space-y-3">
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
        <div className="grid place-items-center pt-10">
          <EmptyState title="No layers yet" />
        </div>
      ) : (
        <ul className="space-y-1">
          {rows.map((node) => {
            const Icon = NODE_ICONS[node.type]
            const active = selection.includes(node.id)
            return (
              <li key={node.id}>
                <div
                  className={cn(
                    'flex h-10 items-center gap-1 rounded-lg border pr-1 transition-colors',
                    active ? 'border-accent-line bg-accent-soft' : 'border-transparent bg-black/[0.03] hover:bg-black/[0.06]',
                  )}
                >
                  <button
                    type="button"
                    onClick={(e) => (e.shiftKey ? toggleSelect(node.id) : select([node.id]))}
                    className={cn(
                      'flex h-full min-w-0 flex-1 items-center gap-2 rounded-lg pl-2.5 text-left text-[13px] outline-none',
                      'focus-visible:ring-2 focus-visible:ring-primary/40',
                      node.hidden && 'text-muted-foreground line-through',
                    )}
                  >
                    <Icon size={16} className="shrink-0" />
                    <span className="truncate">{layerName(node, assets)}</span>
                  </button>
                  <IconButton
                    icon={node.locked ? Lock : LockOpen}
                    label={node.locked ? 'Unlock' : 'Lock'}
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => updateNode(node.id, { locked: !node.locked })}
                  />
                  <IconButton
                    icon={node.hidden ? EyeOff : Eye}
                    label={node.hidden ? 'Show' : 'Hide'}
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => updateNode(node.id, { hidden: !node.hidden })}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
