import { execSync } from 'child_process'
import fs from 'fs'
import { addServerHandler, createResolver, defineNuxtModule, useLogger } from '@nuxt/kit'
import { filename, storageKey } from './common'

const name = 'commit-sha-file-generator'
const logger = useLogger(name)

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

    let long = 'unknown'
    let short = 'unknown'

    try {
      long = execSync('git rev-parse HEAD', { cwd: srcDir }).toString().trim()
      short = execSync('git rev-parse --short HEAD', { cwd: srcDir }).toString().trim()
      logger.success(`Wrote latest commit info for ${long}.`)
    } catch (err) {
      logger.warn('⚠️ Impossible de récupérer les infos du commit (hors repo Git ?)')
    }

    const destinationDirectoryPath = resolver.resolve(nuxt.options.srcDir, 'node_modules', `.${name}`)
    const filePath = resolver.resolve(destinationDirectoryPath, filename)
    fs.mkdirSync(destinationDirectoryPath, { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify({ long, short }))

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
