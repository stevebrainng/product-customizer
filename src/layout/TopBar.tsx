import { PanelRight, Redo2, Undo2 } from 'lucide-react'
import { selectCanRedo, selectCanUndo, useEditor } from '@/engine'
import { useDesigner } from '@/providers/DesignerProvider'
import { Button, ButtonGroup, IconButton } from '@/ui/Button'
import { ZoomControl } from './ZoomControl'

export function TopBar() {
  const canUndo = useEditor(selectCanUndo)
  const canRedo = useEditor(selectCanRedo)
  const undo = useEditor((s) => s.undo)
  const redo = useEditor((s) => s.redo)
  const rightOpen = useDesigner((s) => s.rightPanelOpen)
  const toggleRight = useDesigner((s) => s.toggleRightPanel)

  return (
    <header className="flex h-[50px] shrink-0 items-center justify-between border-b border-border px-2">
      <ButtonGroup aria-label="History">
        <Button onClick={undo} disabled={!canUndo} className="px-3 font-normal">
          <Undo2 data-icon="inline-start" />
          Undo
        </Button>
        <IconButton icon={Redo2} label="Redo" onClick={redo} disabled={!canRedo} />
      </ButtonGroup>
      <div className="flex items-center gap-2">
        <ZoomControl />
        <IconButton
          icon={PanelRight}
          label="Product settings"
          aria-pressed={rightOpen}
          onClick={toggleRight}
          variant={rightOpen ? 'secondary' : 'outline'}
        />
      </div>
    </header>
  )
}
