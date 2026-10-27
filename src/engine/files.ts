/** Opens the native file picker. Resolves to [] when cancelled. */
export function pickFiles({ accept, multiple = false }: { accept: string; multiple?: boolean }): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.multiple = multiple
    input.onchange = () => resolve(Array.from(input.files ?? []))
    input.oncancel = () => resolve([])
    input.click()
  })
}

export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/svg+xml'
