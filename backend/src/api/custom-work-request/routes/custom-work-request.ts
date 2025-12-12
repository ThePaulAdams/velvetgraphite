/**
 * custom-work-request router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::custom-work-request.custom-work-request', {
  config: {
    create: {
      auth: false,
      policies: [],
      middlewares: [],
    },
  },
});
