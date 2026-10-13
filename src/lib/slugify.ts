const COMBINING_MARKS_REGEX = /[̀-ͯ]/g
const NON_SLUG_CHARS_REGEX = /[^a-z0-9]+/g
const DASH_RUNS_REGEX = /-{2,}/g
const LEADING_OR_TRAILING_DASHES_REGEX = /^-+|-+$/g
const SLUG_MAX_LENGTH = 60

export function slugify(input: string): string {
  const stripped = input.normalize('NFD').replace(COMBINING_MARKS_REGEX, '')
  const normalized = stripped
    .toLowerCase()
    .replace(NON_SLUG_CHARS_REGEX, '-')
    .replace(DASH_RUNS_REGEX, '-')
    .replace(LEADING_OR_TRAILING_DASHES_REGEX, '')
  if (normalized.length <= SLUG_MAX_LENGTH) return normalized
  return normalized.slice(0, SLUG_MAX_LENGTH).replace(LEADING_OR_TRAILING_DASHES_REGEX, '')
}
