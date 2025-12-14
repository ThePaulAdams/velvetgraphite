export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    try {
      // Try to use Content Manager's built-in sync functionality
      const contentManagerService = strapi.plugin('content-manager').service('content-types');

      if (contentManagerService && contentManagerService.syncConfigurations) {
        strapi.log.info('Syncing Content Manager configurations...');
        await contentManagerService.syncConfigurations();
        strapi.log.info('Content Manager sync complete');
      }

      // Also try to sync via the configuration service
      const configService = strapi.plugin('content-manager').service('configuration');
      if (configService && configService.syncConfiguration) {
        strapi.log.info('Syncing individual configuration...');
        await configService.syncConfiguration('api::artwork.artwork');
        strapi.log.info('Individual sync complete');
      }

      // Log available Content Manager services for debugging
      const cmServices = strapi.plugin('content-manager').services;
      strapi.log.info('Available Content Manager services: ' + Object.keys(cmServices).join(', '));

    } catch (error) {
      strapi.log.error('Bootstrap sync error:', error.message);
    }
  },
};
