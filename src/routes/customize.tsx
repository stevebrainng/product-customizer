import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  ProductCustomizer,
  defaultSelection,
  readLastDraftId,
  writeLastDraftId,
} from '@/customizer'
import { HOODIE_PRODUCT, colorway, withColorway } from '@/shop/catalog'
import { orderFromLine, parseQtyParam, readShopOrder, saveShopOrder } from '@/shop/order'
import { validateCustomizeSearch } from '@/shop/search'

export const Route = createFileRoute('/customize')({
  validateSearch: validateCustomizeSearch,
  component: CustomizePage,
})

function CustomizePage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const order = readShopOrder()
  const colorId = search.color ?? order?.colorId ?? null
  const product = withColorway(HOODIE_PRODUCT, colorId)
  const quantities = parseQtyParam(search.qty) ?? order?.quantities
  const [generatedId] = useState(() => search.draft || readLastDraftId() || mintDraftId())
  const draftId = search.draft || generatedId

  useEffect(() => {
    if (search.draft) return
    void navigate({
      to: '/customize',
      search: (prev) => ({ ...prev, draft: draftId }),
      replace: true,
    })
  }, [draftId, navigate, search.draft])

  const initialSelection = {
    ...defaultSelection(product),
    colorId: colorway(product, colorId).id,
    note: order?.note ?? '',
    style: order?.style ?? ('printed' as const),
    ...(quantities ? { quantities } : {}),
  }

  return (
    <ProductCustomizer
      product={product}
      draftId={draftId}
      initialSelection={initialSelection}
      onSave={(draft) => {
        console.info('[customizer] saved', draft.id, draft.updatedAt)
      }}
      onAddToCart={(line) => {
        saveShopOrder(orderFromLine(line))
        void navigate({ to: '/checkout', search: { draft: line.customizationId } })
      }}
      onCheckout={(line) => {
        saveShopOrder(orderFromLine(line))
        void navigate({ to: '/checkout', search: { draft: line.customizationId } })
      }}
      onChangeProduct={() => {
        void navigate({ to: '/' })
      }}
    />
  )
}

function mintDraftId() {
  const id = crypto.randomUUID()
  writeLastDraftId(id)
  return id
}
