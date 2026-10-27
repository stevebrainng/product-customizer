import { useDesigner } from '@/providers/DesignerProvider'
import { getTool } from '@/config/tools'
import { PanelShell } from '@/ui/PanelShell'

export function SidePanel() {
  const activeTool = useDesigner((s) => s.activeTool)
  const close = useDesigner((s) => s.closePanel)
  if (!activeTool) return null

  const tool = getTool(activeTool)
  const Body = tool.panel
  return (
    <PanelShell title={tool.label} edge="left" onClose={close}>
      <Body />
    </PanelShell>
  )
}
