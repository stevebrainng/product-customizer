import { createFileRoute } from '@tanstack/react-router'
import { ProductPage } from '@/shop/ProductPage'

export const Route = createFileRoute('/')({
  component: ProductPage,
})
