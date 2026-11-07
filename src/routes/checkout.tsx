import { createFileRoute } from '@tanstack/react-router'
import { CheckoutPage } from '@/shop/CheckoutPage'
import { validateCheckoutSearch } from '@/shop/search'

export const Route = createFileRoute('/checkout')({
  validateSearch: validateCheckoutSearch,
  component: CheckoutPage,
})
