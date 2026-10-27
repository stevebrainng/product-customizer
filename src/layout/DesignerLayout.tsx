import { CanvasDnd } from '@/dnd/CanvasDnd'
import { TopBar } from './TopBar'
import { ToolRail } from './ToolRail'
import { SidePanel } from './SidePanel'
import { CanvasStage } from './CanvasStage'
import { RightPanel } from './RightPanel'

export function DesignerLayout() {
  return (
    <CanvasDnd>
      <div className="flex h-full flex-col bg-canvas">
        <TopBar />
        <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
          <ToolRail />
          <SidePanel />
          <CanvasStage />
          <RightPanel />
        </div>
      </div>
    </CanvasDnd>
  )
}
