import type { LatexContentObject, LatexContentObjectWithBody } from '~/types/latex.d'

/**
 * Represents a lesson, extending the LatexContentObject interface.
 */
export type Lesson = LatexContentObject

/**
 * Represents the content of a lesson, extending the Lesson interface.
 */
export interface LessonContent extends Lesson, LatexContentObjectWithBody {}
