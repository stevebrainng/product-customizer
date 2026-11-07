import { DesignerProvider } from '@/providers/DesignerProvider'
import { EditorProvider } from '@/engine'
import { DesignerLayout } from '@/layout/DesignerLayout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/designer')({
  component: DesignerPage,
})

function DesignerPage() {
  return (
    <DesignerProvider>
      <EditorProvider products={[]}>
        <DesignerLayout />
      </EditorProvider>
    </DesignerProvider>
  )
}
