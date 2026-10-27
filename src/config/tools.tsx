import type { ComponentType } from 'react'
import {
  LibraryBig, Upload, Image as ImageIcon, Type, Shapes, Sticker, Layers, type LucideIcon,
} from 'lucide-react'
import type { ToolId } from '@/store/designerStore'
import { ElementsPanel } from '@/panels/ElementsPanel'
import { UploadsPanel } from '@/panels/UploadsPanel'
import { ImagesPanel } from '@/panels/ImagesPanel'
import { TextPanel } from '@/panels/TextPanel'
import { ShapesPanel } from '@/panels/ShapesPanel'
import { StickersPanel } from '@/panels/StickersPanel'
import { LayersPanel } from '@/panels/LayersPanel'

export interface ToolDef {
  id: ToolId
  label: string
  icon: LucideIcon
  placement: 'top' | 'bottom'
  panel: ComponentType
}

/**
 * Single source of truth for the rail and side panels.
 * Add a tool: extend ToolId, add an entry here, and the rail + panel shell pick it up.
 */
export const TOOLS: ToolDef[] = [
  { id: 'elements', label: 'Elements', icon: LibraryBig, placement: 'top', panel: ElementsPanel },
  { id: 'uploads', label: 'Uploads', icon: Upload, placement: 'top', panel: UploadsPanel },
  { id: 'images', label: 'Images', icon: ImageIcon, placement: 'top', panel: ImagesPanel },
  { id: 'text', label: 'Text', icon: Type, placement: 'top', panel: TextPanel },
  { id: 'shapes', label: 'Shapes', icon: Shapes, placement: 'top', panel: ShapesPanel },
  { id: 'stickers', label: 'Stickers', icon: Sticker, placement: 'top', panel: StickersPanel },
  { id: 'layers', label: 'Layers', icon: Layers, placement: 'bottom', panel: LayersPanel },
]

export const getTool = (id: ToolId) => TOOLS.find((t) => t.id === id)!
