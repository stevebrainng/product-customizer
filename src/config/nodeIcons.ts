import { Circle, Image as ImageIcon, Minus, Pentagon, Square, Type, type LucideIcon } from 'lucide-react'
import type { NodeType } from '@/engine'

export const NODE_ICONS: Record<NodeType, LucideIcon> = {
  rect: Square,
  ellipse: Circle,
  polygon: Pentagon,
  line: Minus,
  text: Type,
  image: ImageIcon,
}
