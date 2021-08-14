module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  // url: 'https://4de3d9a719a4.ngrok.io',
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', 'c0285d865318722c08a7feecad546858'),
    },
  },
})
