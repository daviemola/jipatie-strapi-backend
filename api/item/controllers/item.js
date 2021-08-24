'use strict'
const { sanitizeEntity } = require('strapi-utils')
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  //

  async findBySlug(ctx) {
    const { slug } = ctx.params
    const user = ctx.state.user

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: 'No authorization header was found' }] },
      ])
    }

    const entity = await strapi.services.item.findOne({ slug })
    return sanitizeEntity(entity, { model: strapi.models.item })
  },

  //

  async countme(ctx) {
    const user = ctx.state.user

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: 'No authorization header was found' }] },
      ])
    }
    const data = await strapi.services.item.find({ user: user.id })

    return sanitizeEntity(data.length, { model: strapi.models.item })
  },

  // Get items associated with a user

  async me(ctx) {
    const user = ctx.state.user
    const params = ctx.query

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: 'No authorization header was found' }] },
      ])
    }
    const data = await strapi.services.item.find({
      user: user.id,
      _limit: params._limit,
      _start: params._start,
    })

    if (!data) {
      return ctx.notFound()
    }
    return sanitizeEntity(data, { model: strapi.models.item })
  },

  // Create an item and associate it with a user

  async create(ctx) {
    let entity

    const [category] = await strapi.services.category.find({
      id: ctx.request.body.category,
    })

    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx)

      data.user = ctx.state.user.id
      entity = await strapi.services.item.create(data, { files })
    } else {
      ctx.request.body.user = ctx.state.user.id
      entity = await strapi.services.item.create(ctx.request.body)
      category.items.push(entity)
    }

    return sanitizeEntity(entity, { model: strapi.models.item })
  },

  // Update an item associated with a user

  async update(ctx) {
    const { id } = ctx.params

    let entity

    const [item] = await strapi.services.item.find({
      id: ctx.params.id,
      'user.id': ctx.state.user.id,
    })

    if (!item) {
      return ctx.unauthorized(`You can't update this entry`)
    }

    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx)
      entity = await strapi.services.item.update({ id }, data, {
        files,
      })
    } else {
      entity = await strapi.services.item.update({ id }, ctx.request.body)
    }

    return sanitizeEntity(entity, { model: strapi.models.item })
  },

  // Delete an item associated with a user

  async delete(ctx) {
    const { id } = ctx.params

    const [item] = await strapi.services.item.find({
      id: ctx.params.id,
      'user.id': ctx.state.user.id,
    })

    if (!item) {
      return ctx.unauthorized(`You can't delete this entry`)
    }

    const entity = await strapi.services.item.delete({ id })
    return sanitizeEntity(entity, { model: strapi.models.item })
  },
}
