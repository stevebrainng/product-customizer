import { DesignerProvider } from '@/providers/DesignerProvider'
import { EditorProvider } from '@/engine'
import { DesignerLayout } from '@/layout/DesignerLayout'
import {
  ProductCustomizer,
  defaultSelection,
  draftIdFromUrl,
  type CustomizationDraft,
  type CustomizationLine,
} from '@/customizer'
import { CheckoutPage } from '@/shop/CheckoutPage'
import { ProductPage } from '@/shop/ProductPage'
import { HOODIE_PRODUCT, colorway, withColorway } from '@/shop/catalog'
import { colorFromSearch, orderFromLine, quantitiesFromSearch, readShopOrder, saveShopOrder } from '@/shop/order'

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
  const order = readShopOrder()
  const colorId = colorFromSearch() ?? order?.colorId ?? null
  const product = withColorway(HOODIE_PRODUCT, colorId)
  const quantities = quantitiesFromSearch() ?? order?.quantities
  const initialSelection = {
    ...defaultSelection(product),
    colorId: colorway(product, colorId).id,
    note: order?.note ?? '',
    style: order?.style ?? 'printed' as const,
    ...(quantities ? { quantities } : {}),
  }

  return (
    <ProductCustomizer
      product={product}
      draftId={draftIdFromUrl() ?? undefined}
      initialSelection={initialSelection}
      onSave={(draft: CustomizationDraft) => {
        console.info('[customizer] saved', draft.id, draft.updatedAt)
      }}
      onAddToCart={(line: CustomizationLine) => {
        saveShopOrder(orderFromLine(line))
        location.assign(`/checkout?draft=${encodeURIComponent(line.customizationId)}`)
      }}
      onCheckout={(line: CustomizationLine) => {
        saveShopOrder(orderFromLine(line))
        location.assign(`/checkout?draft=${encodeURIComponent(line.customizationId)}`)
      }}
      onChangeProduct={() => {
        location.assign('/product')
      }}
    />
  )
}

/** `/` designer, `/product` store PDP, `/customize` editor, `/checkout` delivery. */
export default function App() {
  const path = typeof location !== 'undefined' ? location.pathname.replace(/\/+$/, '') || '/' : '/'
  if (path === '/product') return <ProductPage />
  if (path === '/customize') return <CustomizeApp />
  if (path === '/checkout') return <CheckoutPage />
  return <DesignerApp />
}
