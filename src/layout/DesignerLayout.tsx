import { TopBar } from './TopBar'
import { ToolRail } from './ToolRail'
import { SidePanel } from './SidePanel'
import { CanvasStage } from './CanvasStage'
import { RightPanel } from './RightPanel'

export function DesignerLayout() {
  return (
    <div className="flex h-full flex-col bg-canvas">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <ToolRail />
        <SidePanel />
        <CanvasStage />
        <RightPanel />
      </div>
    </div>
  )
}
