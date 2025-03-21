import { execSync } from 'child_process'
import fs from 'fs'
import { addServerHandler, createResolver, defineNuxtModule, useLogger } from '@nuxt/kit'
import { filename, storageKey } from './common'

/**
 * The name of the commit SHA file generator module.
 */
const name = 'commit-sha-file-generator'

/**
 * The logger instance.
 */
const logger = useLogger(name)

/**
 * Nuxt module to generate a file containing the latest commit hash information.
 */
export default defineNuxtModule({
  meta: {
    name,
    version: '0.0.1',
    compatibility: { nuxt: '^3.0.0' },
  },
  defaults: {},
  setup: (options, nuxt) => {
    const resolver = createResolver(import.meta.url)
    const srcDir = nuxt.options.srcDir

    // Retrieve commit hash information.
    const long = execSync('git rev-parse HEAD', { cwd: srcDir }).toString().trim()
    const short = execSync('git rev-parse --short HEAD', { cwd: srcDir }).toString().trim()

    // Write commit information to file.
    const destinationDirectoryPath = resolver.resolve(nuxt.options.srcDir, 'node_modules', `.${name}`)
    const filePath = resolver.resolve(destinationDirectoryPath, filename)
    fs.mkdirSync(destinationDirectoryPath, { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify({ long, short }))
    logger.success(`Wrote latest commit info for ${long}.`)

    // Update Nitro config.
    nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
    nuxt.options.nitro.publicAssets.push({
      baseURL: '/_api/latest-commit/',
      dir: destinationDirectoryPath,
      fallthrough: true,
    })
    nuxt.options.nitro.serverAssets = nuxt.options.nitro.serverAssets || []
    nuxt.options.nitro.serverAssets.push({
      baseName: storageKey,
      dir: destinationDirectoryPath,
    })
    addServerHandler({
      route: `/_api/latest-commit`,
      handler: resolver.resolve(`./handler.ts`),
    })
    logger.success(`Pointing "/_api/latest-commit/" to "${destinationDirectoryPath}".`)
  },
})
