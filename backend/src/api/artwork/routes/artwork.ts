/**
 * artwork router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::artwork.artwork', {
  config: {
    find: {
      auth: false,
      policies: [],
      middlewares: [],
    },
    findOne: {
      auth: false,
      policies: [],
      middlewares: [],
    },
  },
});
