import type { MessageId } from './en'
import auth from './fr/auth.json'
import common from './fr/common.json'
import dashboard from './fr/dashboard.json'
import errorMessages from './fr/error.json'
import lists from './fr/lists.json'
import occasionTypes from './fr/occasion-types.json'
import products from './fr/products.json'
import query from './fr/query.json'
import sidebar from './fr/sidebar.json'
import users from './fr/users.json'

export const frMessages = {
  ...common,
  ...auth,
  ...dashboard,
  ...users,
  ...occasionTypes,
  ...lists,
  ...products,
  ...sidebar,
  ...errorMessages,
  ...query,
} satisfies Record<MessageId, string>
