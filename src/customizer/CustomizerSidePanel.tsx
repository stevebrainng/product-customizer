import { PanelShell } from '@/ui/PanelShell'
import { TextPanel } from '@/panels/TextPanel'
import { UploadsPanel } from '@/panels/UploadsPanel'
import { useCustomizer } from './CustomizerProvider'
import { CheckoutProductPanel } from './CheckoutProductPanel'
import type { CheckoutProduct, CustomizerPanelId } from './types'

const TITLES: Record<CustomizerPanelId, string> = {
  product: 'Product',
  images: 'Images',
  text: 'Text',
}

export function CustomizerSidePanel({
  product,
  onChangeProduct,
}: {
  product: CheckoutProduct
  onChangeProduct?: () => void
}) {
  const active = useCustomizer((s) => s.activePanel)
  const close = useCustomizer((s) => s.setPanel)
  if (!active) return null

  return (
    <PanelShell title={TITLES[active]} edge="left" onClose={() => close(null)}>
      {active === 'product' && <CheckoutProductPanel product={product} onChangeProduct={onChangeProduct} />}
      {active === 'images' && <UploadsPanel />}
      {active === 'text' && <TextPanel />}
    </PanelShell>
  )
}
