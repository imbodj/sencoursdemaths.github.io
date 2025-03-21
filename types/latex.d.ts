import type { HasCategories } from '~/types/category.d'

/**
 * Represents an object containing LaTeX-related content.
 */
export interface LatexContentObject extends HasCategories {
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
 * Represents an object containing LaTeX-related content with a body.
 */
export interface LatexContentObjectWithBody extends LatexContentObject {
  /**
   * The body content of the lesson.
   */
  body: string
}
