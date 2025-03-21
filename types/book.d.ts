import type { HasCategories } from '../types'

/**
 * Represents a book with detailed information.
 */
export interface Book extends HasCategories {
  /**
   * The title of the book.
   */
  title: string

  /**
   * An optional subtitle of the book.
   */
  subtitle?: string

  /**
   * The edition number of the book.
   */
  edition?: number

  /**
   * A short identifier or code for the book.
   */
  short: string

  /**
   * An array of authors contributing to the book.
   */
  authors: string[]

  /**
   * The publication date of the book.
   */
  date: string

  /**
   * The publisher of the book.
   */
  publisher: string

  /**
   * The ISBN-10 number of the book.
   */
  isbn10: string

  /**
   * The ISBN-13 number of the book.
   */
  isbn13: string

  /**
   * A link or reference to where the book can be purchased.
   */
  buy: string

  /**
   * The website associated with the book.
   */
  website: string

  /**
   * Additional comments or notes about the book.
   */
  comment: string

  /**
   * The book alternate cover.
   */
  altcover?: string
}
