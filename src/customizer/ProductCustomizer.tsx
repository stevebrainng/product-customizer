import { useCallback, useState } from 'react'
import { EditorProvider } from '@/engine'
import { CanvasDnd } from '@/dnd/CanvasDnd'
import { CustomizerProvider } from './CustomizerProvider'
import { CustomizerTopBar } from './CustomizerTopBar'
import { CustomizerRail } from './CustomizerRail'
import { CustomizerSidePanel } from './CustomizerSidePanel'
import { CustomizerCanvas } from './CustomizerCanvas'
import { defaultSelection } from './demoProduct'
import { useDraftPersistence } from './useDraftPersistence'
import type { ProductCustomizerProps } from './types'

function CustomizerBody(props: ProductCustomizerProps) {
  const { product, onChangeProduct } = props
  const { flush, addToCart, checkout } = useDraftPersistence(product, props)
  const [busy, setBusy] = useState(false)

  const run = useCallback(async (fn: () => Promise<unknown>) => {
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }, [])

  return (
    <CanvasDnd>
      <div className="flex h-full flex-col bg-canvas">
        <CustomizerTopBar
          product={product}
          busy={busy}
          onSave={() => void run(flush)}
          onAddToCart={() => void run(addToCart)}
          onCheckout={() => void run(checkout)}
        />
        <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
          <CustomizerRail />
          <CustomizerSidePanel product={product} onChangeProduct={onChangeProduct} />
          <CustomizerCanvas />
        </div>
      </div>
    </CanvasDnd>
  )
}

/** Host entry: mounts the editor engine with a fixed catalog product and checkout chrome. */
export function ProductCustomizer(props: ProductCustomizerProps) {
  const selection = defaultSelection(props.product)

  return (
    <EditorProvider products={[props.product.spec]}>
      <CustomizerProvider draftId={props.draftId ?? ''} selection={selection}>
        <CustomizerBody {...props} />
      </CustomizerProvider>
    </EditorProvider>
  )
}
