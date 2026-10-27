/** Search chips shared by any image library. Values are passed as the provider query. */
export const IMAGE_TOPICS = [
  { id: 'abstract', label: 'Abstract' },
  { id: 'nature', label: 'Nature' },
  { id: 'texture', label: 'Texture' },
  { id: 'fashion', label: 'Fashion' },
  { id: 'pattern', label: 'Pattern' },
] as const

export type ImageTopicId = (typeof IMAGE_TOPICS)[number]['id']
