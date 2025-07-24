// noinspection ES6PreferShortImport

import fs from 'fs'
import path from 'path'
import {
  addServerHandler,
  createResolver,
  defineNuxtModule,
  type Resolver,
  useLogger,
} from '@nuxt/kit'
import type { HTMLElement } from 'node-html-parser'
import { KatexRenderer, LatexImageExtractor, PandocCommand, PandocTransformer, SvgGenerator } from 'that-latex-lib'
import { latexStorageKey } from './common'
import { latexOptions, type LatexTransformOptions } from '~/site/latex'
import type { LatexContentObjectWithBody } from '~/types'
import { debug } from '~/site/debug'
import { getFilename, parseBib, normalizeString } from '~/utils/utils.ts'

/**
 * The name of this module.
 */
const name = 'latex-to-content'

/**
 * The logger instance.
 */
const logger = useLogger(name)

/**
 * Nuxt module for transforming .tex files in Nuxt content.
 */
export default defineNuxtModule<LatexTransformOptions>({
  meta: {
    name,
    version: '0.0.1',
    configKey: 'latexToContent',
    compatibility: { nuxt: '^3.0.0' },
  },
  defaults: latexOptions.transform,
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const sourceDirectoryPath = nuxt.options.srcDir

    // Set up Nitro externals for .tex content transformation.
    nuxt.options.nitro.externals = nuxt.options.nitro.externals || {}
    nuxt.options.nitro.externals.inline = nuxt.options.nitro.externals.inline || []
    nuxt.options.nitro.externals.inline.push(resolver.resolve('.'))

    // Process additional assets such as images.
    const contentDirectory = resolver.resolve(sourceDirectoryPath, 'content')
    const assetsDestinationPath = resolver.resolve(sourceDirectoryPath, options.assetsDestinationDirectory)
    processAssets(resolver, contentDirectory, assetsDestinationPath, options)

    // Register them in Nitro.
    nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
    nuxt.options.nitro.publicAssets.push({
      baseURL: '/',
      dir: assetsDestinationPath,
      fallthrough: true,
    })
    logger.success(`Pointing "/" to "${assetsDestinationPath}".`)

    // Transforms .tex files into content for Nuxt.
    const latexDirectoryPath = resolver.resolve(contentDirectory, options.latexContentDirectory)
    const latexDestinationPath = resolver.resolve(sourceDirectoryPath, options.latexDestinationDirectory)
    processLatexFiles(resolver, sourceDirectoryPath, latexDirectoryPath, latexDestinationPath, options)
    nuxt.options.nitro.publicAssets.push({
      baseURL: `/_api/latex/`,
      dir: latexDestinationPath,
      fallthrough: true,
    })
    nuxt.options.nitro.serverAssets = nuxt.options.nitro.serverAssets || []
    nuxt.options.nitro.serverAssets.push({
      baseName: latexStorageKey,
      dir: latexDestinationPath,
    })
    addServerHandler({
      route: `/_api/latex/:type`,
      handler: resolver.resolve(`./handler.ts`),
    })
    addServerHandler({
      route: `/_api/latex/:type/:slug`,
      handler: resolver.resolve(`./handler.ts`),
    })
    logger.success(`Pointing "/_api/latex/" to "${latexDestinationPath}".`)
  },
})

/**
* Process assets in a directory and copy them to a destination.
*
* @param resolver The Nuxt resolver.
* @param directoryPath The path to the source directory containing assets.
* @param assetsDestinationPath The path to the destination directory for assets.
* @param options Options for transforming LaTeX files.
* @param [contentDirectoryPath=directoryPath] The path to the content directory.
*/
const processAssets = (
  resolver: Resolver,
  directoryPath: string,
  assetsDestinationPath: string,
  options: LatexTransformOptions,
  contentDirectoryPath: string = directoryPath,
) => {
  // Get the list of files in the directory.
  const files = fs.readdirSync(directoryPath)

  // Iterate through each file in the directory.
  for (const file of files) {
    const filePath = resolver.resolve(directoryPath, file)

    // If the file is a directory, recursively process its assets.
    if (fs.lstatSync(filePath).isDirectory()) {
      processAssets(resolver, filePath, assetsDestinationPath, options, contentDirectoryPath)
      continue
    }

    // Check if the file extension is included in the allowed extensions.
    const extension = path.extname(file)
    if (options.assetsExtension.includes(extension)) {
      // Calculate relative and destination paths.
      const relativePath = path.relative(contentDirectoryPath, filePath)
      const destinationPath = resolver.resolve(assetsDestinationPath, options.getAssetDestination(relativePath))

      // Ensure destination directory exists.
      fs.mkdirSync(path.dirname(destinationPath), { recursive: true })

      // Copy the asset file.
      fs.copyFileSync(filePath, destinationPath)

      // Log the successful copying of an asset file.
      logger.success(`${filePath} -> ${destinationPath}`)
    }
  }
}

/**
 * Process all Latex files of a given directory.
 *
 * @param resolver The Nuxt resolver.
 * @param sourceDirectoryPath The Nuxt source directory path.
 * @param directoryPath The directory where the Latex files are stored.
 * @param targetDirectoryPath Where to put the processed files.
 * @param options The module option.
 */
const processLatexFiles = (
  resolver: Resolver,
  sourceDirectoryPath: string,
  directoryPath: string,
  targetDirectoryPath: string,
  options: LatexTransformOptions,
) => {
  // Get the list of files in the directory.
  const files = fs.readdirSync(directoryPath)

  // Iterate through each file in the directory.
  const index = []
  const ignore = options.ignore.map(file => resolver.resolve(sourceDirectoryPath, file))
  for (const file of files) {
    const filePath = resolver.resolve(directoryPath, file)

    // Ignore specified files and directories.
    if (ignore.includes(filePath) || !fs.existsSync(filePath)) {
      logger.info(`Ignored ${filePath}.`)
      continue
    }

    // If the file is a directory, recursively process its assets.
    if (fs.lstatSync(filePath).isDirectory()) {
      processLatexFiles(resolver, sourceDirectoryPath, filePath, resolver.resolve(targetDirectoryPath, file), options)
      continue
    }

    if (file.endsWith('.tex')) {
      const result = processLatexFile(resolver, sourceDirectoryPath, filePath, targetDirectoryPath, options)
      if (result) {
        fs.writeFileSync(
          resolver.resolve(targetDirectoryPath, `${result.slug}.json`),
          JSON.stringify(result),
        )
        const { body, ...indexObject } = result
        index.push(indexObject)
      }
    }
  }
  if (index.length > 0) {
    fs.writeFileSync(
      resolver.resolve(targetDirectoryPath, `index.json`),
      JSON.stringify(index),
    )
    // for (const page of index) {
    //   addPrerenderRoutes(`/${page.level}/${page.slug}/`)
    // }
    // addPrerenderRoutes(`/${index[0].level}/`)
  }
}

/**
 * Progress a given Latex file to transform it into HTML.
 *
 * @param resolver The Nuxt resolver.
 * @param sourceDirectoryPath The Nuxt source directory path.
 * @param filePath The path to the file.
 * @param targetDirectoryPath Where to put the processed files.
 * @param options The module option.
 */
const processLatexFile = (
  resolver: Resolver,
  sourceDirectoryPath: string,
  filePath: string,
  targetDirectoryPath: string,
  options: LatexTransformOptions,
): LatexContentObjectWithBody | undefined => {
  // Absolute path to the .tex file.
  logger.info(`Processing ${filePath}...`)
  fs.mkdirSync(targetDirectoryPath, { recursive: true })

  // Extract images from the .tex file content and return the modified content.
  const contentDirectoryPath = resolver.resolve(sourceDirectoryPath, 'content')
  const assetsRootDirectoryPath = resolver.resolve(sourceDirectoryPath, options.assetsDestinationDirectory)

  // Load the Pandoc redefinitions header content.
  const pandocHeader = fs.readFileSync(resolver.resolve(sourceDirectoryPath, options.pandocRedefinitions), { encoding: 'utf8' })

  // Parse the Pandoc HTML output.
  const pandocTransformer = new PandocTransformer({
    imageSrcResolver: PandocTransformer.resolveFromAssetsRoot(
      assetsRootDirectoryPath,
      {
        getImageCacheDirectoryPath: resolvedImageTexFilePath => resolver.resolve(sourceDirectoryPath, options.cacheDirectory, path.relative(assetsRootDirectoryPath, path.dirname(resolvedImageTexFilePath))),
        imagePathToSrc: resolvedImageFilePath => '/' + path.relative(assetsRootDirectoryPath, resolvedImageFilePath).replace(/\\/g, '/'),
      },
    ),
    imageExtractors: [
      new TikzPictureImageExtractor(
        options,
        sourceDirectoryPath,
        contentDirectoryPath,
      ),
    ],
    mathRenderer: new KatexRendererWithMacros(),
    pandoc: new PandocCommand({
      header: pandocHeader,
    }),
  })
  // Transforms the raw content into HTML.
  const { htmlResult: root } = pandocTransformer.transform(filePath, fs.readFileSync(filePath, { encoding: 'utf8' }))

  if (root) {
    // Remove empty titles from the HTML content.
    removeEmptyTitles(root)

    // Replace vspace elements in the HTML content.
    replaceVspaceElements(root)

    // Handle proofs in the HTML content.
    handleProofs(root)

    // Return the parsed content object.
    logger.success(`Successfully processed ${filePath} !`)
    return {
      body: root.outerHTML,
      ...getHeader(path.parse(filePath).name, root),
    } as LatexContentObjectWithBody
  }
  else {
    logger.error(`Failed to process ${filePath}.`)
  }
}

/**
 * Remove empty titles (h2, h3, h4) from the HTML root element.
 *
 * @param root The root HTML element.
 */
const removeEmptyTitles = (root: HTMLElement) => {
  const bubbleTitles = root.querySelectorAll('h2, h3, h4')
  for (const bubbleTitle of bubbleTitles) {
    // Check if the text content of the title is empty and remove it.
    if (bubbleTitle.text.trim().length === 0) {
      bubbleTitle.remove()
    }
  }
}

/**
 * Replace vertical space elements with corresponding styles.
 *
 * @param root The root HTML element.
 */
const replaceVspaceElements = (root: HTMLElement) => {
  const vspaces = root.querySelectorAll('.vertical-space')
  for (const vspace of vspaces) {
    // Get the trimmed text content.
    const text = vspace.text.trim()

    // Check if the text starts with '-' and remove the element.
    if (text.startsWith('-')) {
      vspace.remove()
      continue
    }

    // Set the 'style' attribute to control the height.
    vspace.setAttribute('style', `height: ${text};`)
    vspace.innerHTML = ''
  }
}

/**
 * Handle the 'proof' elements in the HTML by replacing 'Proof.' with 'Démonstration.'.
 *
 * @param root The root HTML element.
 */
const handleProofs = (root: HTMLElement) => {
  const proofs = root.querySelectorAll('.proof')
  for (const proof of proofs) {
    const firstEmphasis = proof.querySelector('em')
    // Replace 'Proof.' with 'Démonstration.' if found in the first emphasis element.
    if (firstEmphasis) {
      firstEmphasis.replaceWith(firstEmphasis.outerHTML.replace('Proof.', 'Solution.'))
    }
  }
}

/**
 * Finds the ref name of an element.
 *
 * @param element The element.
 */
const findRefName = (element: HTMLElement | null): string | null => {
  if (element == null) {
    return null
  }
  if (element.tagName === 'DIV') {
    for (const tag of ['strong', 'em']) {
      const text = element.querySelector(`> p > ${tag}:first-child`)?.text
      if (text) {
        return text
      }
    }
    return null
  }
  if (element.tagName === 'LI') {
    const listItems = []
    for (const child of element.parentNode.childNodes) {
      if (child.rawTagName.toUpperCase() === 'LI') {
        listItems.push(child)
      }
    }
    const index = listItems.indexOf(element)
    return `Point ${(index + 1)}`
  }
  if (element.tagName === 'SPAN' || element.tagName === 'P') {
    return findRefName(element.parentNode)
  }
  if (element.tagName === 'H1' || element.tagName === 'H2' || element.tagName === 'H3' || element.tagName === 'H4') {
    return `Section ${element.text}`
  }
  return null
}

/**
 * Extract header information from the HTML structure of a LaTeX document.
 *
 * @param slug The slug of the document.
 * @param root The root HTML element of the document.
 * @returns Header information.
 */
const getHeader = (slug: string, root: HTMLElement): { [key: string]: any } => {
  // Initialize the header object with the slug.
  const header: { [key: string]: any } = { slug }

  // Get the document name and title elements.
  const name = root.querySelector('.docname h1')
  let title = root.querySelector('.doctitle')

  // Populate header with name and title if available.
  if (name) {
    header.name = name.innerHTML.trim()
    if (!title) {
      title = name
    }
    header['page-name-search'] = normalizeString(name.text.trim())
  }
  if (title) {
    header['page-title'] = title.text.trim()
  }

  // Get and parse categories.
  const categories = root.querySelector('.doccategories')
  if (categories) {
    header.categories = categories.text.trim().split(', ')
  }

  // Get and set document summary.
  const summary = root.querySelector('.docsummary p')
  if (summary) {
    header.summary = summary.innerHTML.trim()
    header['page-description'] = summary.text.trim()
  }

  return header
}

/**
 * Extracts Tikz pictures from a file.
 */
class TikzPictureImageExtractor extends LatexImageExtractor {
  /**
   * The Latex transform options.
   */
  options: LatexTransformOptions
  /**
   * The source directory path.
   */
  sourceDirectoryPath: string
  /**
   * The content directory path.
   */
  contentDirectoryPath: string

  /**
   * Creates a new `TikzPictureImageExtractor` instance.
   *
   * @param options The Latex transform options.
   * @param sourceDirectoryPath The source directory path.
   * @param contentDirectoryPath The content directory path.
   */
  constructor(options: LatexTransformOptions, sourceDirectoryPath: string, contentDirectoryPath: string) {
    super(
      'tikzpicture',
      {
        svgGenerator: new SvgGenerator({
          generateIfExists: !debug,
        }),
      },
    )
    this.options = options
    this.sourceDirectoryPath = sourceDirectoryPath
    this.contentDirectoryPath = contentDirectoryPath
  }

  override getExtractedImageDirectoryPath(extractedFrom: string, extractedFileName: string): string {
    return path.resolve(
      this.sourceDirectoryPath,
      this.options.assetsDestinationDirectory,
      path.dirname(
        this.options.getAssetDestination(
          path.relative(
            this.contentDirectoryPath,
            path.resolve(path.dirname(extractedFrom), extractedFileName),
          ),
        ),
      ).replace(/\\/g, '/') + '/' + getFilename(extractedFrom),
    )
  }

  override renderContent(extractedImageTexFilePath: string, latexContent: string): string {
    const content = fs.readFileSync(path.resolve(this.sourceDirectoryPath, this.options.tikzPictureTemplate), { encoding: 'utf8' })
    return content
      .replace('{graphicsPath}', '')
      // .replace('{grahicsPath}', '\\graphicspath{' + includeGraphicsDirectories
      //   .map(directory => `{${directory.replaceAll('\\', '\\\\')}}`)
      //   .join('\n') + '}')
      .replace('{extractedContent}', latexContent)
  }
}

/**
 * A math renderer with some custom macros.
 */
class KatexRendererWithMacros extends KatexRenderer {
  override getMacros(): any {
    return {
      '\\parallelslant': '\\mathbin{\\!/\\mkern-5mu/\\!}',
      '\\ensuremath': '#1',
    }
  }

  override filterUnknownSymbols(math: string): string {
    return super.filterUnknownSymbols(math)
      .replace(/(\\left *|\\right *)*\\VERT/g, '$1 | $1 | $1 |')
      .replace(/\\overset{(.*)}&{(.*)}/g, '&\\overset{$1}{$2}')
  }
}
