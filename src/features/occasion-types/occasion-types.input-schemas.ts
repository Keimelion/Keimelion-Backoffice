import { z } from 'zod'
import { DEFAULT_LOCALE, LOCALES } from '@/lib/i18n/locale'

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SLUG_MIN_LENGTH = 2
const SLUG_MAX_LENGTH = 60
const EMOJI_MAX_LENGTH = 10
const SORT_ORDER_MIN = 0
const SORT_ORDER_MAX = 32767

const SLUG_INVALID_MESSAGE =
  'Slug must be lowercase letters and digits separated by hyphens (e.g. my-occasion).'
const DEFAULT_LOCALE_REQUIRED_MESSAGE = 'The English label is required.'

const defaultLocaleSchema = z.string().min(1, { message: DEFAULT_LOCALE_REQUIRED_MESSAGE })
const optionalLocaleSchema = z.string().nullable().optional()

const translationsEntries = LOCALES.map((locale) =>
  locale === DEFAULT_LOCALE
    ? ([locale, defaultLocaleSchema] as const)
    : ([locale, optionalLocaleSchema] as const),
)

const translationsShape = Object.fromEntries(translationsEntries) as {
  en: typeof defaultLocaleSchema
  fr: typeof optionalLocaleSchema
}

export const createOccasionTypeInputSchema = z.object({
  slug: z
    .string()
    .min(SLUG_MIN_LENGTH, { message: SLUG_INVALID_MESSAGE })
    .max(SLUG_MAX_LENGTH, { message: SLUG_INVALID_MESSAGE })
    .regex(SLUG_REGEX, { message: SLUG_INVALID_MESSAGE }),
  emoji: z.string().trim().max(EMOJI_MAX_LENGTH).nullable().optional(),
  sortOrder: z.number().int().min(SORT_ORDER_MIN).max(SORT_ORDER_MAX),
  isActive: z.boolean(),
  translations: z.object(translationsShape),
})

export type CreateOccasionTypeInput = z.infer<typeof createOccasionTypeInputSchema>

export type UpdateOccasionTypeInput = Partial<Omit<CreateOccasionTypeInput, 'slug'>>
