/**
 * sales-inquiry router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::sales-inquiry.sales-inquiry', {
  config: {
    create: {
      auth: false,
      policies: [],
      middlewares: [],
    },
  },
});
