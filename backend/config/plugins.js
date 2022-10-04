module.exports = {

  placeholder: {
    enabled: true,
    config: {
      size: 10,
    },
  },

};

module.exports = ({ env }) => ({
  // ...
  slugify: {
    enabled: true,
    config: {
      contentTypes: {
        article: {
          field: 'slug',
          references: 'title',
        },
      },
    },
  },
  // ...
});
