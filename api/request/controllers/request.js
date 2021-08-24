'use strict'
const { sanitizeEntity } = require('strapi-utils')

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  //requests for a specific item

  async itemrequests(ctx) {
    const user = ctx.state.user

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: 'No authorization header was found' }] },
      ])
    }

    const item = await strapi.services.item.findOne({ slug: ctx.params.itemid })
    const data = await strapi.services.request.find({ item: item.id })

    // console.log(data)

    return sanitizeEntity(data, { model: strapi.models.request })
  },

  //count me requests

  async countme(ctx) {
    const user = ctx.state.user

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: 'No authorization header was found' }] },
      ])
    }
    const data = await strapi.services.request.find({ requested_by: user.id })

    return sanitizeEntity(data.length, { model: strapi.models.request })
  },

  //get my requests

  async me(ctx) {
    const user = ctx.state.user
    const params = ctx.query

    console.log(params._limit)
    console.log(params._start)

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: 'No authorization header was found' }] },
      ])
    }
    const data = await strapi.services.request.find({
      requested_by: user.id,
      _limit: params._limit,
      _start: params._start,
    })

    if (!data) {
      return ctx.notFound()
    }
    return sanitizeEntity(data, { model: strapi.models.request })
  },

  // Create an item and associate it with a user
  // Prevent user from creating own request

  async create(ctx) {
    let entity
    const user = ctx.state.user

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: 'No authorization header was found' }] },
      ])
    }

    const [item] = await strapi.services.item.find({
      id: ctx.request.body.item,
    })

    item.requests.map((req) => {
      if (req.requested_by === ctx.state.user.id) {
        return ctx.badRequest(null, [
          { messages: [{ id: 'You can only send one request.' }] },
        ])
      }
    })

    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx)

      data.user = ctx.state.user.id
      entity = await strapi.services.item.create(data, { files })
    } else {
      //resitrict request to other items owned by others
      if (item.user.id == ctx.state.user.id) {
        return ctx.badRequest(null, [
          { messages: [{ id: `You can't send requests for your item.` }] },
        ])
      }
      ctx.request.body.requested_by = ctx.state.user.id

      entity = await strapi.services.request.create(ctx.request.body)
    }

    return sanitizeEntity(entity, { model: strapi.models.request })
  },

  //Update an entry
  async update(ctx) {
    const { id } = ctx.params
    const user = ctx.state.user

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: 'No authorization header was found' }] },
      ])
    }

    let entity

    const [request] = await strapi.services.request.find({
      id: ctx.params.id,
    })

    const [requestsbyowner] = await strapi.services.request.find({
      id: ctx.params.id,
      'requested_by.id': ctx.state.user.id,
    })

    let loggedinuser = ctx.state.user.id
    let itemowner = request.item.user

    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx)
      entity = await strapi.services.request.update({ id }, data, {
        files,
      })
    } else {
      if (requestsbyowner) {
        entity = await strapi.services.request.update({ id }, ctx.request.body)
      } else if (itemowner === loggedinuser) {
        entity = await strapi.services.request.update({ id }, ctx.request.body)
      } else {
        return ctx.unauthorized(`You can't update this entry`)
      }
    }

    return sanitizeEntity(entity, { model: strapi.models.request })
  },

  // Delete an item associated with a user

  async delete(ctx) {
    const { id } = ctx.params

    const [request] = await strapi.services.request.find({
      id: ctx.params.id,
      'requested_by.id': ctx.state.user.id,
    })

    if (!request) {
      return ctx.unauthorized(`You can't delete this entry`)
    }

    const entity = await strapi.services.request.delete({ id })
    return sanitizeEntity(entity, { model: strapi.models.request })
  },
}
