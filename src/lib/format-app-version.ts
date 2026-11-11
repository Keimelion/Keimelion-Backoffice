const VERSION_PREFIX = 'v'
const BUILD_METADATA_SEPARATOR = '+'

export function formatAppVersion(version: string, commitSha: string | null): string {
  if (commitSha === null || commitSha === '') return `${VERSION_PREFIX}${version}`
  return `${VERSION_PREFIX}${version}${BUILD_METADATA_SEPARATOR}${commitSha}`
}
