import { DesignerProvider } from '@/providers/DesignerProvider'
import { EditorProvider } from '@/engine'
import { DesignerLayout } from '@/layout/DesignerLayout'
import {
  DEMO_CHECKOUT_PRODUCT,
  ProductCustomizer,
  draftIdFromUrl,
  listCartLines,
  type CustomizationDraft,
  type CustomizationLine,
} from '@/customizer'

function DesignerApp() {
  return (
    <DesignerProvider>
      <EditorProvider products={[]}>
        <DesignerLayout />
      </EditorProvider>
    </DesignerProvider>
  )
}

function CustomizeApp() {
  const draftId = draftIdFromUrl() ?? undefined

  return (
    <ProductCustomizer
      product={DEMO_CHECKOUT_PRODUCT}
      draftId={draftId}
      onSave={(draft: CustomizationDraft) => {
        console.info('[customizer] saved', draft.id, draft.updatedAt)
      }}
      onAddToCart={(line: CustomizationLine) => {
        console.info('[customizer] add-to-cart', line)
      }}
      onCheckout={async (line: CustomizationLine) => {
        console.info('[customizer] checkout', line)
        console.info('[customizer] cart', await listCartLines())
      }}
      onChangeProduct={() => {
        console.info('[customizer] change-product — host store would open a product picker here')
      }}
    />
  )
}

/** Path-based pages without a router package: `/` designer, `/customize` checkout customizer. */
export default function App() {
  const path = typeof location !== 'undefined' ? location.pathname.replace(/\/+$/, '') || '/' : '/'
  if (path === '/customize') return <CustomizeApp />
  return <DesignerApp />
}
