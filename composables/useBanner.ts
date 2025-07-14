import type { Ref } from 'vue'

/**
 * Enum representing different types of banners.
 * @enum {number}
 */
export enum BannerType {
  pdf,
  caveats,
  wip,
}

/**
 * Represents a banner with a type and a message.
 */
export interface Banner {
  /**
   * The type of the banner
   */
  type: BannerType
  /**
   * The message displayed in the banner.
   */
  message: string
}

/**
 * Custom Vue composable for managing banners.
 * @returns A reactive reference to the list of banners.
 */
export const useBanners = (): Ref<Banner[]> => useState<Banner[]>('banners', () => [])

/**
 * Clears all banners from the list.
 */
export const clearBanners = () => {
  const banners = useBanners()
  banners.value = []
}

/**
 * Adds a banner to the list.
 * @param banner - The banner to be added.
 */
export const useBanner = (banner: Banner) => {
  const banners = useBanners()
  banners.value.push(banner)
}

/**
 * Adds a PDF-related banner to the list.
 * @param url - The URL to the PDF.
 */
export const usePdfBanner = (url: string) => useBanner({
  type: BannerType.pdf,
  message: `Le contenu de cette page est disponible en version PDF.
  Vous pouvez le télécharger <a href="${url}">ici</a>.`,
})

/**
 * Adds a caveats-related banner to the list.
 * @param url - The URL for reporting issues or suggesting improvements.
 */
export const useCaveatsBanner = (url: string) => useBanner({
  type: BannerType.caveats,
  message: `Pour signaler une erreur ou suggérer une amélioration, vous pouvez modifier
  le <a href="${url}">code source</a> de la page, ou me <a href="https://skyost.eu/#contact">contacter</a>.`,
})

/**
 * Adds a work-in-progress (WIP) banner to the list.
 * @param url - The URL for contributing to the content.
 */
export const useWipBanner = (url: string) => useBanner({
  type: BannerType.wip,
  message: `Cette page et son contenu ne sont pas terminés :
  il peut manquer des choses, et de nombreux changements vont encore intervenir.
  Toute aide est <a href="${url}">la bienvenue</a> !`,
})
