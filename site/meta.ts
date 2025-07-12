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
  title: 'SenCoursDeMaths',
  description: 'Petit site contenant une flopée de ressources  de mathématiques pour le lycée : plans, exercices,évaluations, ...',
  url: 'https://sencoursdemaths.github.io/',
  github: {
    username: 'imbodj',
    repository: 'SenCoursDeMaths',
  },
}
