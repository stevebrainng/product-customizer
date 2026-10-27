# Product designer

Vite + React 18 + TypeScript + Tailwind v4 + Zustand + lucide-react + Konva (react-konva 18).

    npm install
    npm run dev

## Layers

    src/engine/    Generic editor engine. Knows nothing about this app's UI.
    src/layout/    App chrome (top bar, rail, side panel, canvas host)
    src/panels/    Library panels; add things via engine actions only
    src/ui/        Design primitives
    src/config/    products.ts (what can be designed), tools.tsx (rail + panels)
    src/data/      Catalog + presets (app-specific content)

The app imports the engine only through `@/engine` (src/engine/index.ts).

## Engine

- `types.ts`: plain-data document (`DesignNode` union) and plain-data `ProductSpec` (photo, print area, colours, sizes)
- `product.ts`: product helpers + `createProductFromImage` (upload a photo -> a product)
- `interaction/`: snapping guides and the multi-node drag session
- `store/editorStore.ts`: document, history, selection, active side, zoom. Single write path (`commitNodes`), one undo step per finished interaction
- `provider/EditorProvider.tsx`: store + `EditorRuntime` via context. `useEditor(selector)`, `useEditorStore()`, `useEditorRuntime()`
- `runtime/EditorRuntime.ts`: owns the Konva stage; print-resolution export (`download`, `toBlob`, `toDataURL`), font loading
- `nodes/`: node registry. One definition per type (rect, ellipse, polygon, text, image)
- `canvas/`: `EditorStage` (mockup photo + #design layer clipped to print area + #overlay), `NodeView`, `SelectionTransformer`, `TextEditor` (double-click), `PrintAreaEditor`, `ProductMockup`
- `hooks/`: shortcuts, uploads, viewport fit, image loading

World coordinates = product space (`ProductSpec.world`). The stage scales to fit; nodes never store scale.

## Recipes

Add a node type: extend `DesignNode` in `types.ts`, write `nodes/<type>.tsx` with `defineNode`, add it to the list in `nodes/index.ts`.

Add a product: users do it in the right sidebar (Upload product photo). In code, add a `ProductSpec` (pure data) to `config/products.ts`; `<EditorProvider products={...}>` takes the seed list.

Export the active side at print size: `useEditorRuntime().download('front.png', { widthPx: 4000 })`.

Shortcuts: Cmd/Ctrl+Z undo, Shift+Cmd/Ctrl+Z or Ctrl+Y redo, Cmd/Ctrl+D duplicate, Delete remove, arrows nudge (Shift = 10), Esc deselect.

Colour: a tint is a multiply layer masked by the photo's alpha, so it only works on photos with a transparent background (detected on upload). Opaque JPEGs get a note instead of swatches.

Interaction: shift-click toggles selection, drag on empty space = marquee, dragging moves the whole selection (one undo step), snapping to print area and other nodes (hold Alt to disable), double-click text to edit (Cmd/Ctrl+Enter applies, Esc cancels).
