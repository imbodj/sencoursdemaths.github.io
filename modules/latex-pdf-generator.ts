// noinspection ES6PreferShortImport

import fs from 'fs'
import path from 'path'
import AdmZip from 'adm-zip'
import { Octokit } from '@octokit/core'
import { createResolver, defineNuxtModule, type Resolver, useLogger } from '@nuxt/kit'
import { LatexChecksumsCalculator, LatexIncludeCommand, PdfGenerator } from 'that-latex-lib'
import { getFilename } from '../utils/utils'
import { type GithubRepository, siteMeta } from '../site/meta'
import { latexOptions, type LatexGenerateOptions } from '../site/latex'
import { debug } from '../site/debug'

/**
 * Options for the PDF generator module.
 */
export interface ModuleOptions extends LatexGenerateOptions {
  github: GithubRepository
  moveFiles: boolean
}

/**
 * The name of the module.
 */
const name = 'latex-pdf-generator'

/**
 * The logger instance.
 */
const logger = useLogger(name)

/**
 * Nuxt module to compile Latex files into PDF.
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version: '0.0.1',
    compatibility: { nuxt: '^3.0.0' },
    configKey: 'latexPdfGenerator',
  },
  defaults: {
    github: siteMeta.github,
    ...latexOptions.generate,
    moveFiles: !debug,
  },
  setup: async (options, nuxt) => {
    const resolver = createResolver(import.meta.url)
    const srcDir = nuxt.options.srcDir
    const latexDirectoryPath = resolver.resolve(srcDir, options.sourceDirectory)

    // Download the previous build.
    // This allows to not compile files if they haven't changed.
    let previousBuildDirectoryPath = resolver.resolve(srcDir, options.previousBuildDirectoryPath)
    const downloadResult = await downloadPreviousBuild(resolver, previousBuildDirectoryPath, options)
    previousBuildDirectoryPath = resolver.resolve(previousBuildDirectoryPath, options.destinationDirectory)

    // Generate Latex gatherings.
    const generatedGatherings = generateGatherings(resolver, latexDirectoryPath, options)

    // And generate all PDFs !
    const ignore = options.ignore.map(file => resolver.resolve(srcDir, file))
    const destinationDirectoryPath = resolver.resolve(srcDir, 'node_modules', `.${name}`, options.destinationDirectory)
    generatePdf(
      resolver,
      path.relative(resolver.resolve(srcDir, 'content'), latexDirectoryPath),
      latexDirectoryPath,
      destinationDirectoryPath,
      ignore,
      downloadResult ? previousBuildDirectoryPath : null,
      options,
    )

    // Remove all Latex gathering files.
    for (const generatedGathering of generatedGatherings) {
      fs.unlinkSync(generatedGathering)
      logger.success(`Deleted gathering ${getFilename(generatedGathering)}.`)
    }

    // Register all generated files in Nitro.
    nuxt.options.nitro.publicAssets = nuxt.options.nitro.publicAssets || []
    nuxt.options.nitro.publicAssets.push({
      baseURL: `/${options.destinationDirectory}/`,
      dir: destinationDirectoryPath,
      fallthrough: true,
    })
  },
})

/**
 * Downloads the previous build from Github pages.
 * @param resolver The resolver instance.
 * @param directoryPath The download destination.
 * @param options The module options.
 * @returns Whether the download is a success.
 */
const downloadPreviousBuild = async (resolver: Resolver, directoryPath: string, options: ModuleOptions): Promise<boolean> => {
  try {
    logger.info(`Downloading and unzipping the previous build at ${options.github.username}/${options.github.repository}@gh-pages...`)
    if (fs.existsSync(directoryPath)) {
      logger.success('Already downloaded.')
      return true
    }
    // We create the Octokit instance.
    const octokit = new Octokit()
    const response = await octokit.request('GET /repos/{owner}/{repo}/zipball/{ref}', {
      owner: options.github.username,
      repo: options.github.repository,
      ref: 'gh-pages',
    })

    // We read the response using AdmZip.
    const zip = new AdmZip(Buffer.from(response.data as Buffer))
    const zipRootDir = zip.getEntries()[0].entryName

    // We extract it to the parent folder.
    const parentPath = path.dirname(directoryPath)
    if (!fs.existsSync(parentPath)) {
      fs.mkdirSync(parentPath, { recursive: true })
    }
    for (const previousBuildCacheDirectory of options.previousBuildCacheDirectories) {
      zip.extractEntryTo(`${zipRootDir}${previousBuildCacheDirectory}/`, parentPath)
    }

    // Then we can rename the main entry into the destination folder name.
    fs.renameSync(resolver.resolve(parentPath, zipRootDir), resolver.resolve(parentPath, path.basename(directoryPath)))
    logger.success('Done.')
    return true
  }
  catch (exception) {
    logger.warn(exception)
  }
  return false
}

/**
 * Generate gatherings of Latex files.
 * @param resolver The resolver instance.
 * @param latexDirectoryPath An absolute path to the Latex content.
 * @param options The module options.
 * @returns The generated files.
 */
const generateGatherings = (resolver: Resolver, latexDirectoryPath: string, options: ModuleOptions): string[] => {
  const generatedGatherings = []

  for (const gathering of options.gatherings) {
    let fileName = ''
    // Generate a unique file name based on gathering data directories.
    for (const data of gathering.data) {
      fileName += (data.directory + '-')
    }
    fileName = fileName.substring(0, fileName.length - 1)

    logger.info(`Generating gathering "${fileName}"...`)
    const gatheringFile = resolver.resolve(latexDirectoryPath, `${fileName}.tex`)
    generatedGatherings.push(gatheringFile)

    // Read the gathering template.
    const template = fs.readFileSync(resolver.resolve(latexDirectoryPath, options.gatheringTemplate), { encoding: 'utf8' })
    let content = ''

    // Iterate over each data directory in the gathering.
    for (const data of gathering.data) {
      const directory = resolver.resolve(latexDirectoryPath, data.directory)

      // Filter and get only .tex files in the directory.
      const files = fs
        .readdirSync(directory)
        .filter(file => file.endsWith('.tex') && fs.lstatSync(resolver.resolve(directory, file)).isFile())

      // If there are multiple data directories, add a gathering command.
      if (gathering.data.length > 1) {
        content += `\\gathering{${data.title}}\n`
      }

      // Add input commands for each .tex file in the directory.
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        content += '\\inputcontent' + (i === 0 ? '*' : '') + `{${data.directory}/${file}}\n`
      }
    }

    // Write the generated gathering file.
    fs.writeFileSync(
      gatheringFile,
      template
        .replace('%s', gathering.data.map(data => data.title).join(' \\& '))
        .replace('%s', gathering.header ?? '')
        .replace('%s', content),
    )

    logger.success('Done.')
  }

  return generatedGatherings
}

/**
 * Recursively generates PDF files from Latex files in a directory.
 *
 * @param resolver The resolver instance.
 * @param texDirectoryRelativePath Relative path to the Latex content directory.
 * @param directoryPath Absolute path to the directory containing Latex files.
 * @param destinationDirectoryPath Absolute path to the destination directory for generated PDFs.
 * @param ignore List of files to ignore during the generation process.
 * @param previousBuildDirectory Absolute path to the directory containing previous build files.
 * @param options Module options.
 */
const generatePdf = (
  resolver: Resolver,
  texDirectoryRelativePath: string,
  directoryPath: string,
  destinationDirectoryPath: string,
  ignore: string[],
  previousBuildDirectory: string | null,
  options: ModuleOptions,
) => {
  // Get a list of files in the current directory.
  const files = fs.readdirSync(directoryPath)

  // Iterate over each file in the directory.
  for (const file of files) {
    const filePath = resolver.resolve(directoryPath, file)

    // Ignore specified files and directories.
    if (ignore.includes(filePath) || !fs.existsSync(filePath)) {
      logger.info(`Ignored ${filePath}.`)
      continue
    }

    // If the file is a directory, recursively generate PDFs for its contents.
    if (fs.lstatSync(filePath).isDirectory()) {
      generatePdf(
        resolver,
        texDirectoryRelativePath + '/' + file,
        filePath,
        resolver.resolve(destinationDirectoryPath, file),
        ignore,
        previousBuildDirectory == null ? null : resolver.resolve(previousBuildDirectory, file),
        options,
      )
      continue
    }

    // If the file has a .tex extension, process it to generate a PDF.
    const extension = path.extname(file)
    if (extension === '.tex') {
      logger.info(`Processing "${filePath}"...`)

      // Generate PDF and checksums files.
      const pdfGenerator = new PdfGenerator({
        generateIfExists: !debug,
        checksumsCalculator: new LatexChecksumsCalculator({
          latexIncludeCommands: [
            LatexIncludeCommand.includeGraphics(options.getIncludeGraphicsDirectories(texDirectoryRelativePath)),
            ...LatexIncludeCommand.defaultLatexIncludeCommands,
            // inputcontent command for other LaTeX files.
            new LatexIncludeCommand('inputcontent'),
            new LatexIncludeCommand('inputcontent\\*'),
            new LatexIncludeCommand(
              'setbibliographypath',
              {
                extensions: ['.bib'],
                hasIncludes: false,
                targetIsDirectory: true,
              },
            ),
            new LatexIncludeCommand(
              'inputalgorithm',
              {
                extensions: ['.py'],
                hasIncludes: false,
              },
            ),
          ],
        }),
      })
      const result = pdfGenerator.generate(
        filePath,
        previousBuildDirectory,
      )

      // If PDF generation is successful, copy files to the destination directory.
      if (result.builtFilePath) {
        fs.mkdirSync(destinationDirectoryPath, { recursive: true })
        fs.copyFileSync(result.builtFilePath, resolver.resolve(destinationDirectoryPath, path.parse(result.builtFilePath).base))

        // Optionally move files instead of copying.
        if (options.moveFiles) {
          fs.unlinkSync(result.builtFilePath)
        }

        // Copy checksums file if available.
        if (result.checksumsFilePath) {
          fs.copyFileSync(result.checksumsFilePath, resolver.resolve(destinationDirectoryPath, path.parse(result.checksumsFilePath).base))

          // Optionally move checksums file instead of copying.
          if (options.moveFiles) {
            fs.unlinkSync(result.checksumsFilePath)
          }
        }

        if (result.wasCached) {
          logger.success(`Fully cached PDF found in ${previousBuildDirectory}.`)
        }
        else {
          logger.success(previousBuildDirectory ? `File was not cached in ${previousBuildDirectory} but has been generated with success.` : 'Done.')
        }
      }
      else {
        logger.warn('Error.')
      }
    }
  }
}
