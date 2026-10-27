import { DesignerProvider } from '@/providers/DesignerProvider'
import { EditorProvider } from '@/engine'
import { DEFAULT_PRODUCTS } from '@/config/products'
import { DesignerLayout } from '@/layout/DesignerLayout'

export default function App() {
  return (
    <DesignerProvider>
      <EditorProvider products={DEFAULT_PRODUCTS}>
        <DesignerLayout />
      </EditorProvider>
    </DesignerProvider>
  )
}
