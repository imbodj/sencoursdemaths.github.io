// noinspection ES6PreferShortImport

import fs from 'fs'
import { ofetch } from 'ofetch'
import { createResolver, defineNuxtModule, type Resolver, useLogger } from '@nuxt/kit'
import { parse, type HTMLElement } from 'node-html-parser'
import sharp from 'sharp'
import { getNested, parseBib } from '../utils/utils'
import type { Book } from '../types'
import { siteMeta } from '../site/meta'

/**
 * Options for the books cover fetcher module.
 */
export interface ModuleOptions {
  /**
   * The site URL.
   */
  siteUrl: string
  /**
   * The directory where the book BibTeX files are located.
   */
  booksDirectory: string
  /**
   * The URL path where book cover images will be served.
   */
  booksImagesUrl: string
}

/**
 * The name of the books cover fetcher module.
 */
const name = 'books-cover-fetcher'

/**
 * The logger instance.
 */
const logger = useLogger(name)

/**
 * Nuxt module to fetch book covers and store them in a cache directory.
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version: '0.0.1',
    configKey: 'booksCover',
    compatibility: { nuxt: '^3.0.0' },
  },
  defaults: {
    siteUrl: siteMeta.url,
    booksDirectory: 'content/latex/bibliographie/',
    booksImagesUrl: '/images/livres/',
  },
  setup: async (options, nuxt) => {
    logger.info('Fetching books covers...')

    const resolver = createResolver(import.meta.url)
    const destinationDirectory = resolver.resolve(nuxt.options.srcDir, 'node_modules/.cache/books-covers/')

    // Create directory if it doesn't exist.
    if (!fs.existsSync(destinationDirectory)) {
      fs.mkdirSync(destinationDirectory, { recursive: true })
    }

    const booksDirectory = resolver.resolve(nuxt.options.srcDir, options.booksDirectory)

    // Add public asset configuration.
    nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
    nuxt.options.nitro.publicAssets.push({
      baseURL: options.booksImagesUrl,
      dir: destinationDirectory,
      fallthrough: true,
    })

    const books = fs.readdirSync(booksDirectory)
    const failed = []
    const downloadSources: DownloadSource[] = [
      new AltCoverDownloadSource(),
      new GoogleServersDownloadSource(),
      new DeBoeckSuperieurImageDownloadSource(),
      new OpenGraphImageDownloadSource(),
      new PreviousBuildDownloadSource(options.siteUrl, options.booksImagesUrl),
    ]
    for (const bookFile of books) {
      const filePath = resolver.resolve(booksDirectory, bookFile)
      const book = parseBib(fs.readFileSync(filePath, { encoding: 'utf-8' }))
      if (!(await fetchBookCover(resolver, book, destinationDirectory, downloadSources))) {
        failed.push(book.short)
      }
    }

    if (failed.length === 0) {
      logger.success('Fetched books covers.')
    }
    else {
      logger.warn(`Fetched books covers. An error occurred with the following books : ${failed.join(', ')}.`)
    }
  },
})

/**
 * Fetches a book cover from various sources and saves it to a cache directory.
 *
 * @param resolver The resolver for resolving paths.
 * @param book The book for which to fetch the cover.
 * @param destinationDirectory The directory to store the fetched covers.
 * @param downloadSources The download sources.
 * @returns A promise resolving to `true` if the cover was fetched successfully, `false` otherwise.
 */
async function fetchBookCover(resolver: Resolver, book: Book, destinationDirectory: string, downloadSources: DownloadSource[]): Promise<boolean> {
  const destinationFile = resolver.resolve(destinationDirectory, `${book.isbn10}.jpg`)
  if (fs.existsSync(destinationFile)) {
    return true
  }
  for (const downloadSource of downloadSources) {
    if (await downloadSource.download(book, destinationFile)) {
      return true
    }
  }
  return false
}

/**
 * Represents a download source.
 */
abstract class DownloadSource {
  /**
   * Creates a new download source instance.
   *
   * @param name The download source name.
   * @param logNoBookCover Whether to log if `getBookCoverUrl` returns null.
   */
  protected constructor(private readonly name: string, private readonly logNoBookCover: boolean = false) {
    this.name = name
    this.logNoBookCover = logNoBookCover
  }

  /**
   * Downloads the book to the given directory.
   *
   * @param book The book.
   * @param destinationFile The destination file.
   * @returns Whether the operation is a success.
   */
  async download(book: Book, destinationFile: string): Promise<boolean> {
    const logDownloadStart = () => logger.info(`Trying to download the book cover of [${book.short}] from source "${this.name}"...`)
    const coverUrl = await this.getBookCoverUrl(book)
    if (!coverUrl) {
      if (this.logNoBookCover) {
        logDownloadStart()
        logger.warn(`Failed to resolve the cover URL of [${book.short}] from source "${this.name}".`)
      }
      return false
    }
    logDownloadStart()
    const result = await this.downloadImage(book, coverUrl, destinationFile)
    if (!result) {
      logger.warn(`The downloading of the book [${book.short}] cover url "${coverUrl}" from "${this.name}" source failed.`)
      return true
    }
    logger.success(`Successfully downloaded the book cover of [${book.short}] from source "${this.name}" !`)
    return true
  }

  /**
   * Downloads an image from a URL and saves it to a file.
   *
   * @param book The book.
   * @param url The URL of the image to download.
   * @param destinationFile The path to save the downloaded image.
   * @returns A promise indicating the completion of the download process.
   */
  async downloadImage(book: Book, url: string, destinationFile: string): Promise<boolean> {
    try {
      const blob = await ofetch(url, { responseType: 'blob' })
      if (blob.type.startsWith('image/') && blob.size > 0) {
        let description = book.title
        if (book.subtitle) {
          description += ` ${book.subtitle}`
        }
        if (book.edition) {
          description += `, Éd. ${book.edition}`
        }
        const buffer = Buffer.from(await blob.arrayBuffer())
        await sharp(buffer)
          .resize(null, 250)
          .jpeg()
          .withExifMerge({
            IFD0: {
              ImageId: book.isbn13,
              Copyright: `Copyright (c) ${book.date.split('-')[0]}, ${book.publisher}. Tous droits réservés.`,
              ImageDescription: description,
              UserComment: `Image de "[${book.short}]" téléchargée à partir de "${url}".`,
            },
          })
          .toFile(destinationFile)
        return true
      }
    }
    catch (ex) {
      logger.warn(ex)
    }
    return false
  }

  /**
   * Should return the book cover URL.
   * @param book The book.
   * @returns The book cover URL.
   */
  abstract getBookCoverUrl(book: Book): Promise<string | null>
}

/**
 * Download source representing the specified URL in the BIB file.
 */
class AltCoverDownloadSource extends DownloadSource {
  /**
   * Creates a new alt cover download source instance.
   */
  constructor() {
    super('Book alt cover', false)
  }

  override getBookCoverUrl(book: Book): Promise<string | null> {
    return Promise.resolve('altcover' in book && book.altcover ? book.altcover!.toString() : null)
  }
}

/**
 * Download from Google servers.
 */
class GoogleServersDownloadSource extends DownloadSource {
  /**
   * Creates a new Google Servers download source instance.
   */
  constructor() {
    super('Google Servers')
  }

  override async getBookCoverUrl(book: Book): Promise<string | null> {
    try {
      const response = await ofetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn13.replace('-', '')}`)
      if (response.items && response.items.length > 0) {
        let thumbnailUrl = getNested(response.items[0], 'volumeInfo', 'imageLinks', 'smallThumbnail')
        if (thumbnailUrl) {
          return thumbnailUrl
        }
        thumbnailUrl = getNested(response.items[0], 'volumeInfo', 'imageLinks', 'thumbnail')
        if (thumbnailUrl) {
          return thumbnailUrl
        }
        logger.warn(`[${book.short}] has been found on Google servers, but there is no cover in it.`)
      }
    }
    catch (ex) {
      logger.warn(ex)
    }
    return null
  }
}

/**
 * Downloads a book cover from De Boeck Supérieur servers.
 */
class DeBoeckSuperieurImageDownloadSource extends DownloadSource {
  /**
   * Creates a new De Boeck Supérieur download source instance.
   */
  constructor() {
    super('De Boeck Supérieur')
  }

  override async getBookCoverUrl(book: Book): Promise<string | null> {
    const prefix = 'https://www.deboecksuperieur.com/ouvrage/'
    if (!book.website.startsWith(prefix)) {
      return null
    }
    let id = book.website.substring(prefix.length)
    id = id.substring(0, id.indexOf('-'))
    return Promise.resolve(`https://www.deboecksuperieur.com/sites/default/files/styles/couverture_grande/public/couvertures/${id}-g.jpg`)
  }
}

/**
 * Downloads a book cover thanks to the website's Open Graph image.
 */
class OpenGraphImageDownloadSource extends DownloadSource {
  /**
   * Creates a new OpenGraph download source instance.
   */
  constructor() {
    super('OpenGraph')
  }

  override async getBookCoverUrl(book: Book): Promise<string | null> {
    try {
      const root: HTMLElement = await ofetch(book.website, { parseResponse: parse, timeout: 10000 })
      const image = root.querySelector('meta[property="og:image"]')?.getAttribute('content')
      return image ?? null
    }
    catch (ex) {
      logger.warn(ex)
    }
    return null
  }
}

/**
 * Download from the previous build.
 */
class PreviousBuildDownloadSource extends DownloadSource {
  /**
   * Creates a new previous build download source instance.
   */
  constructor(private siteUrl: string, private booksImagesUrl: string) {
    super('agreg.skyost.eu')
  }

  override getBookCoverUrl(book: Book): Promise<string | null> {
    return Promise.resolve(`${this.siteUrl}${this.booksImagesUrl}${book.isbn10}.jpg`)
  }

  override async downloadImage(book: Book, url: string, destinationFile: string): Promise<boolean> {
    try {
      const blob = await ofetch(url, { responseType: 'blob' })
      if (blob.type === 'image/jpeg' && blob.size > 0) {
        const buffer = Buffer.from(await blob.arrayBuffer())
        fs.writeFileSync(destinationFile, buffer)
        return true
      }
      return false
    }
    catch (ex) {
      logger.warn(ex)
    }
    return false
  }
}
