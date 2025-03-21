import * as fs from 'fs'
import { addPrerenderRoutes, addServerHandler, createResolver, defineNuxtModule, useLogger } from '@nuxt/kit'
import { marked } from 'marked'
import { storageKey, filename } from './common.ts'
import { siteMeta } from '~/site/meta.ts'

/**
 * The module name.
 */
const name = 'readme-md-to-content'

/**
 * The logger instance.
 */
const logger = useLogger(name)

export default defineNuxtModule({
  meta: {
    name: 'readme-md-to-content',
    version: '0.0.1',
    compatibility: { nuxt: '^3.0.0' },
  },
  setup: async (_, nuxt) => {
    const resolver = createResolver(import.meta.url)

    // Read README.md file.
    const readmeFilePath = resolver.resolve(nuxt.options.srcDir, 'README.md')
    if (!fs.existsSync(readmeFilePath)) {
      logger.fatal(`${readmeFilePath} not found.`)
      return
    }

    // Render into HTML.
    const renderedMarkdown = await marked.parse(fs.readFileSync(readmeFilePath, { encoding: 'utf8' }))
    const destinationDirectoryPath = resolver.resolve(nuxt.options.srcDir, 'node_modules', `.${name}`)
    const destinationFilePath = resolver.resolve(destinationDirectoryPath, filename)
    fs.mkdirSync(destinationDirectoryPath, { recursive: true })
    fs.writeFileSync(destinationFilePath, JSON.stringify({ body: renderedMarkdown.replaceAll(siteMeta.url, '') }))

    // Update Nitro config.
    nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
    nuxt.options.nitro.publicAssets.push({
      baseURL: '/_api/readme/',
      dir: destinationDirectoryPath,
      fallthrough: true,
    })
    nuxt.options.nitro.serverAssets = nuxt.options.nitro.serverAssets || []
    nuxt.options.nitro.serverAssets.push({
      baseName: storageKey,
      dir: destinationDirectoryPath,
    })
    addServerHandler({
      route: `/_api/readme`,
      handler: resolver.resolve(`./handler.ts`),
    })
    addPrerenderRoutes('/')
    logger.success(`Pointing "/_api/readme/" to "${destinationDirectoryPath}".`)
  },
})
