import type { SideId } from '@/engine'

/** Generates the built-in t-shirt photo. Real products ship the same way: an image URL in config. */
export function tshirtSvg(side: SideId) {
  const neck = side === 'front' ? 111 : 40
  const inner = side === 'front' ? 50 : 14
  const outline = `M170,13 C150,25 100,45 63,70 Q25,140 5,223 L88,267 L101,227 C96,330 90,450 92,550 C150,576 360,576 419,550 C417,450 411,330 403,237 L419,263 L507,223 Q487,140 447,70 C410,45 360,25 339,13 Q255,${neck} 170,13 Z`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 507 580" width="507" height="580">
<defs>
<linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbfbfb"/><stop offset=".55" stop-color="#e4e4e5"/><stop offset="1" stop-color="#cbcbcc"/></linearGradient>
<linearGradient id="h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".2"/><stop offset=".2" stop-color="#000" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></linearGradient>
<linearGradient id="n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8c8c8e"/><stop offset="1" stop-color="#d9d9da"/></linearGradient>
</defs>
<path d="${outline}" fill="url(#v)"/><path d="${outline}" fill="url(#h)"/>
<path d="M176,10 Q255,-2 333,10 Q326,${inner} 255,${inner + 2} Q184,${inner} 176,10 Z" fill="url(#n)"/>
<path d="M170,13 Q255,${neck} 339,13" fill="none" stroke="#b4b4b6" stroke-width="1.5"/>
<path d="M88,267 L101,227 M419,263 L403,237" stroke="#b9b9bb" stroke-width="1.2" fill="none"/>
</svg>`
}

export const svgDataUrl = (svg: string) => `data:image/svg+xml;base64,${btoa(svg)}`
