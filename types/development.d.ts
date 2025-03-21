import type { LatexContentObject, LatexContentObjectWithBody } from '~/types/latex.d'

/**
 * Represents a development, extending the LatexContentObject interface.
 */
export interface Development extends LatexContentObject {
  /**
   * The summary of the development.
   */
  'summary': string

  /**
   * The page description of the development.
   */
  'page-description': string
}

/**
 * Represents the content of a development, extending the Development interface.
 */
export interface DevelopmentContent extends Development, LatexContentObjectWithBody {}
