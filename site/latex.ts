import path from 'path'

/**
 * Cache directory for LaTeX.
 */
const cacheDirectory = 'node_modules/.cache/latex'

/**
 * Ignored files.
 */
const ignore = [
  'content/latex/common.tex',
  'content/latex/gathering.tex',
  'content/latex/pandoc.tex',
  'content/latex/templates/gathering.tex',
  'content/latex/templates/tikzpicture.tex',
]

/**
 * Helper function to get include graphics directories based on the relative path of the LaTeX file.
 */
const getIncludeGraphicsDirectories = (texFileRelativePath: string) => [path.dirname(texFileRelativePath)]

/**
 * Represents the configuration options for transforming LaTeX files into HTML using Pandoc.
 */
export interface LatexTransformOptions {
  /**
   * Contains files to ignore.
   */
  ignore: string[]
  /**
   * List of allowed asset extensions.
   */
  assetsExtension: string[]
  /**
   * Directory for caching LaTeX files.
   */
  cacheDirectory: string
  /**
   * Get the destination for assets based on the file's relative path and extension.
   */
  getAssetDestination: (relativePath: string) => string
  /**
   * Get the destination for extracted images based on the LaTeX file's relative path.
   */
  getExtractedImagesDestination: (texFileRelativePath: string) => string
  /**
   * Function to get include graphics directories based on the LaTeX file's relative path.
   */
  getIncludeGraphicsDirectories: (texFileRelativePath: string) => string[]
  /**
   * The Latex directory in the content directory.
   */
  latexContentDirectory: string
  /**
   * Directory for storing transformed assets.
   */
  assetsDestinationDirectory: string
  /**
   * Directory for storing transformed Latex files.
   */
  latexDestinationDirectory: string
  /**
   * Directory for storing transformed Latex bib files.
   */
  bibDestinationDirectory: string
  /**
   * Path to the Pandoc redefinitions file.
   */
  pandocRedefinitions: string
  /**
   * Template file for pictures.
   */
  tikzPictureTemplate: string
}

/**
 * Transform options for LaTeX.
 */
const latexTransformOptions: LatexTransformOptions = {
  ignore,
  assetsExtension: ['.pdf', '.svg', '.png', '.jpeg', '.jpg', '.gif'],
  cacheDirectory,
  getAssetDestination: (relativePath: string): string => {
    const extension = path.extname(relativePath)
    switch (extension) {
      case '.pdf':
        return `pdf/${relativePath}`
      case '.tex':
      case '.svg':
      case '.png':
      case '.jpeg':
      case '.jpg':
      case '.gif':
        return `images/${relativePath}`
      default:
        return `others/${relativePath}`
    }
  },
  getExtractedImagesDestination: (texFileRelativePath: string) => {
    const extension = path.extname(texFileRelativePath)
    return texFileRelativePath.substring(0, texFileRelativePath.length - extension.length)
  },
  getIncludeGraphicsDirectories,
  latexContentDirectory: 'latex',
  assetsDestinationDirectory: 'node_modules/.latex-to-content/assets/',
  latexDestinationDirectory: 'node_modules/.latex-to-content/latex/',
  tikzPictureTemplate: 'content/latex/templates/tikzpicture.tex',
  pandocRedefinitions: 'content/latex/pandoc.tex',
}

/**
 * Represents the data for a gathering, specifying the directory and title.
 */
interface GatheringData {
  /**
   * The directory containing gathering data.
   */
  directory: string
  /**
   * The title of the gathering.
   */
  title: string
}

/**
 * Represents a gathering, consisting of data entries and an optional header.
 */
interface Gathering {
  /**
   * The data entries for the gathering.
   */
  data: GatheringData[]
  /**
   * Optional header for the gathering.
   */
  header?: string
}

/**
 * Represents the configuration options for generating PDF files from LaTeX files.
 */
export interface LatexGenerateOptions {
  /**
   * Path to the directory containing the previous build.
   */
  previousBuildDirectoryPath: string
  /**
   * Directories in the previous build to cache.
   */
  previousBuildCacheDirectories: string[]
  /**
   * Source directory containing LaTeX files.
   */
  sourceDirectory: string
  /**
   * Destination directory for generated PDF files.
   */
  destinationDirectory: string
  /**
   * List of files to ignore during the generation process.
   */
  ignore: string[]
  /**
   * List of gatherings to include in the generation process.
   */
  gatherings: Gathering[]
  /**
   * Template for generating gatherings.
   */
  gatheringTemplate: string
  /**
   * Function to get include graphics directories based on the LaTeX file's relative path.
   */
  getIncludeGraphicsDirectories: (texFileRelativePath: string) => string[]
}

/**
 * Generate options for LaTeX.
 */
export const latexGenerateOptions: LatexGenerateOptions = {
  previousBuildDirectoryPath: cacheDirectory,
  previousBuildCacheDirectories: ['pdf', 'images'],
  sourceDirectory: 'content/latex/',
  destinationDirectory: 'pdf/',
  ignore,
  gatherings: [
    {
      data: [
        {
          directory: 'fiches',
          title: 'Fiches',
        },
      ],
    },
    {
      data: [
        {
          directory: 'lecons',
          title: 'Plans de leçons',
        },
      ],
    },
    {
      data: [
        {
          directory: 'developpements',
          title: 'Développements',
        },
      ],
    },
    {
      data: [
        
      ],
    },
    {
      data: [
        {
          directory: 'lecons',
          title: 'Plans de leçons',
        },
        {
          directory: 'developpements',
          title: 'Développements',
        },
      ],
      header: `\\renewcommand{\\dev}[1]{%
\t\\reversemarginpar%
\t\\todo[noline]{
\t\t\\protect\\vspace{20pt}%
\t\t\\protect\\par%
\t\t\\scriptsize\\bfseries\\color{devcolor}\\hyperref[#1]{[DEV]}{}%
}%
\t\\normalmarginpar%
}`,
    },
  ],
  gatheringTemplate: 'templates/gathering.tex',
  getIncludeGraphicsDirectories,
}

/**
 * Contains all Latex options.
 */
export interface LatexOptions {
  /**
   * The transform options.
   */
  transform: LatexTransformOptions
  /**
   * The generate options.
   */
  generate: LatexGenerateOptions
}

/**
 * The instance that contains all Latex options.
 */
export const latexOptions: LatexOptions = {
  transform: latexTransformOptions,
  generate: latexGenerateOptions,
}
