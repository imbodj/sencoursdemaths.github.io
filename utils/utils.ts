import path from 'path'
import crypto from 'crypto'

/**
 * Removes a trailing slash from a string if it exists.
 *
 * @param string Input string.
 * @returns String without the trailing slash.
 */
export const removeTrailingSlashIfPossible = (string: string): string => string.endsWith('/') ? string.substring(0, string.length - 1) : string

/**
 * Extracts the filename from a given file path.
 *
 * @param file File path.
 * @returns Filename.
 */
export const getFilename = (file: string): string => path.parse(file).name

/**
 * Normalizes a string by removing diacritics and converting to lowercase.
 *
 * @param string Input string.
 * @returns Normalized string.
 */
export const normalizeString = (string: string): string => string
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .toLowerCase()

/**
 * Retrieves a nested property from an object using a variable number of keys.
 *
 * @param obj Input object.
 * @param args Keys to access the nested property.
 * @returns The nested property value or undefined if not found.
 */
export const getNested = (obj: object, ...args: any[]): any => args.reduce((obj, level) => obj && obj[level], obj)

/**
 * Generates an MD5 checksum for a given string.
 *
 * @param string Input string.
 * @returns MD5 checksum.
 */
export const generateChecksum = (string: string): string => crypto
  .createHash('md5')
  .update(string, 'utf8')
  .digest('hex')
