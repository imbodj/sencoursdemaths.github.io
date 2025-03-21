/**
 * Represents a GitHub repository.
 */
export interface GithubRepository {
  /**
   * The GitHub username.
   */
  username: string

  /**
   * The GitHub repository name.
   */
  repository: string
}

/**
 * Represents the metadata for the site.
 */
interface SiteMeta {
  /**
   * The title of the site.
   */
  title: string

  /**
   * The description of the site.
   */
  description: string

  /**
   * The URL of the site.
   */
  url: string

  /**
   * The GitHub repository information.
   */
  github: GithubRepository
}

/**
 * The metadata for the site.
 */
export const siteMeta: SiteMeta = {
  title: 'agreg.skyost.eu',
  description: 'Petit site contenant une flopée de ressources pour l\'agrégation de mathématiques : plans, développements, bibliographie, ...',
  url: 'https://agreg.skyost.eu',
  github: {
    username: 'Skyost',
    repository: 'Agregation',
  },
}
