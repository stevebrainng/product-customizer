import { DesignerProvider } from '@/providers/DesignerProvider'
import { EditorProvider } from '@/engine'
import { DesignerLayout } from '@/layout/DesignerLayout'

export default function App() {
  return (
    <DesignerProvider>
      <EditorProvider products={[]}>
        <DesignerLayout />
      </EditorProvider>
    </DesignerProvider>
  )
}
