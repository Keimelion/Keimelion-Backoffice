import auth from './en/auth.json'
import categories from './en/categories.json'
import common from './en/common.json'
import dashboard from './en/dashboard.json'
import errorMessages from './en/error.json'
import feedback from './en/feedback.json'
import items from './en/items.json'
import lists from './en/lists.json'
import occasionTypes from './en/occasion-types.json'
import profile from './en/profile.json'
import query from './en/query.json'
import reservations from './en/reservations.json'
import shops from './en/shops.json'
import sidebar from './en/sidebar.json'
import tags from './en/tags.json'
import users from './en/users.json'

export const enMessages = {
  ...common,
  ...auth,
  ...dashboard,
  ...users,
  ...items,
  ...occasionTypes,
  ...lists,
  ...shops,
  ...categories,
  ...tags,
  ...profile,
  ...sidebar,
  ...feedback,
  ...reservations,
  ...errorMessages,
  ...query,
} satisfies Record<string, string>

export type MessageId = keyof typeof enMessages
