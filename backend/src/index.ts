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
    // Clear Content Manager configuration for Artwork to force regeneration
    // This ensures new fields (price, sold) appear in the edit view
    try {
      await strapi.db.query('strapi::core-store').deleteMany({
        where: {
          key: {
            $contains: 'content_manager_configuration',
          },
        },
      });
      strapi.log.info('Cleared Content Manager configuration - will regenerate with all fields');
    } catch (error) {
      strapi.log.warn('Could not clear Content Manager configuration:', error.message);
    }
  },
};
