import auth from './en/auth.json'
import common from './en/common.json'
import dashboard from './en/dashboard.json'
import errorMessages from './en/error.json'
import items from './en/items.json'
import lists from './en/lists.json'
import occasionTypes from './en/occasion-types.json'
import query from './en/query.json'
import sidebar from './en/sidebar.json'
import users from './en/users.json'

export const enMessages = {
  ...common,
  ...auth,
  ...dashboard,
  ...users,
  ...occasionTypes,
  ...lists,
  ...items,
  ...sidebar,
  ...errorMessages,
  ...query,
} satisfies Record<string, string>

export type MessageId = keyof typeof enMessages
