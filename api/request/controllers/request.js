'use strict'
const { sanitizeEntity } = require('strapi-utils')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async me(ctx) {
    const user = ctx.state.user

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: 'No authorization header was found' }] },
      ])
    }
    const data = await strapi.services.request.find({ requested_by: user.id })

    if (!data) {
      return ctx.notFound()
    }
    return sanitizeEntity(data, { model: strapi.models.request })
  },
}
