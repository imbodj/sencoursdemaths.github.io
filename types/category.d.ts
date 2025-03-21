/**
 * Represents a category assigned to a object.
 */
export type Category = 'algebra' | 'analysis'

/**
 * Interface for objects that have categories.
 */
export interface HasCategories {
  /**
   * An array of categories assigned to the object.
   */
  categories: Category[]
}
