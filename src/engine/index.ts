// Public surface of the editor engine. The app imports from here only.
export * from './types'
export { EditorProvider, useEditor, useEditorStore, useEditorRuntime } from './provider/EditorProvider'
export {
  selectActiveNodes, selectProduct, selectCanUndo, selectCanRedo, ZOOM_STEPS, type Zoom,
} from './store/editorStore'
export { EditorStage } from './canvas/EditorStage'
export { useAssetUpload } from './hooks/useAssetUpload'
export { useElementSize, resolveScale } from './hooks/useStageViewport'
export { registerNode, defineNode, getNodeDefinition, createId } from './nodes'
export {
  resolveSide, createProductFromImage, pickProductImage, readProductImage, worldFor, clampRect,
  type ProductImage,
} from './product'
export type { ExportOptions } from './runtime/EditorRuntime'
