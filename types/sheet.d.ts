import type { LatexContentObject, LatexContentObjectWithBody } from '~/types/latex.d'

/**
 * Represents a sheet, extending the LatexContentObject interface.
 */
export type Sheet = LatexContentObject

/**
 * Represents the content of a sheet, extending the Sheet interface.
 */
export interface SheetContent extends Sheet, LatexContentObjectWithBody {}
