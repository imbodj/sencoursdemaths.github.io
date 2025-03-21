import type { LatexContentObject, LatexContentObjectWithBody } from '~/types/latex.d'

/**
 * Represents a sheet, extending the LatexContentObject interface.
 */
export interface Ranking extends LatexContentObject {
  /**
   * The name of the LaTeX content object.
   */
  'name': string

  /**
   * The slug associated with the LaTeX content object.
   */
  'slug': string

  /**
   * The page title of the LaTeX content object.
   */
  'page-title': string

  /**
   * The search-friendly page name of the LaTeX content object.
   */
  'page-name-search': string
}

/**
 * Represents the content of a ranking, extending the Ranking interface.
 */
export interface RankingContent extends Ranking, LatexContentObjectWithBody {}
