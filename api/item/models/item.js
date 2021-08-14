const uniqueSlug = require('unique-slug')

module.exports = {
  lifecycles: {
    async beforeCreate(data) {
      if (data.name) {
        data.slug = uniqueSlug()
      }
    },
    async beforeUpdate(params, data) {
      if (data.name) {
        data.slug = uniqueSlug()
      }
    },
  },
}
