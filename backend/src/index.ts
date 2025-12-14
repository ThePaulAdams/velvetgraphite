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
    // Fix Content Manager configuration for salePrice and isSold fields
    const contentTypeUID = 'api::artwork.artwork';
    const storeKey = `plugin_content_manager_configuration_content_types::${contentTypeUID}`;

    try {
      const store = await strapi.db.query('strapi::core-store').findOne({
        where: { key: storeKey },
      });

      if (store && store.value) {
        const config = typeof store.value === 'string' ? JSON.parse(store.value) : store.value;

        // Log current state for debugging
        strapi.log.info('Current salePrice metadata:', JSON.stringify(config.metadatas?.salePrice));
        strapi.log.info('Current isSold metadata:', JSON.stringify(config.metadatas?.isSold));

        // ALWAYS force editable: true for these fields
        if (config.metadatas) {
          // Force salePrice to be editable
          if (!config.metadatas.salePrice) {
            config.metadatas.salePrice = { edit: {}, list: {} };
          }
          if (!config.metadatas.salePrice.edit) {
            config.metadatas.salePrice.edit = {};
          }
          config.metadatas.salePrice.edit.visible = true;
          config.metadatas.salePrice.edit.editable = true;

          // Force isSold to be editable
          if (!config.metadatas.isSold) {
            config.metadatas.isSold = { edit: {}, list: {} };
          }
          if (!config.metadatas.isSold.edit) {
            config.metadatas.isSold.edit = {};
          }
          config.metadatas.isSold.edit.visible = true;
          config.metadatas.isSold.edit.editable = true;

          await strapi.db.query('strapi::core-store').update({
            where: { key: storeKey },
            data: { value: JSON.stringify(config) },
          });

          strapi.log.info('Forced salePrice and isSold to editable: true');
          strapi.log.info('New salePrice metadata:', JSON.stringify(config.metadatas.salePrice));
          strapi.log.info('New isSold metadata:', JSON.stringify(config.metadatas.isSold));
        }
      }
    } catch (error) {
      strapi.log.warn('Could not update Content Manager configuration:', error.message);
    }
  },
};
