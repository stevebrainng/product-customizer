import type { ImageLibraryProvider } from './types'
import { unsplashProvider } from './unsplash/provider'

/** Active remote catalog. Swap this to change the image source for every panel. */
export const defaultImageLibrary: ImageLibraryProvider = unsplashProvider
