module.exports = ({ env }) => ({
  // ...
  upload: {
    provider: 'cloudinary',
    providerOptions: {
      cloud_name: env('CLOUDINARY_NAME'),
      api_key: env('CLOUDINARY_KEY'),
      api_secret: env('CLOUDINARY_SECRET'),
    },
    actionOptions: {
      upload: {},
      delete: {},
    },
  },
  email: {
    provider: 'sendinblue',
    providerOptions: {
      sendinblue_api_key: env('SENDINBLUE_API_KEY'),
      sendinblue_default_replyto: env('FROM_EMAIL'),
      sendinblue_default_from: env('FROM_EMAIL'),
      sendinblue_default_from_name: env('FROM_NAME'),
    },
  },
  // ...
})
