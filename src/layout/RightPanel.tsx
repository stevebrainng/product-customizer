import { useDesigner } from '@/providers/DesignerProvider'
import { ProductPanel } from '@/panels/ProductPanel'
import { PanelShell } from '@/ui/PanelShell'

export function RightPanel() {
  const open = useDesigner((s) => s.rightPanelOpen)
  const setOpen = useDesigner((s) => s.setRightPanelOpen)
  if (!open) return null
  return (
    <PanelShell title="Product" edge="right" onClose={() => setOpen(false)}>
      <ProductPanel />
    </PanelShell>
  )
}
