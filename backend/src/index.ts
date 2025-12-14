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

        strapi.log.info('Found config, metadatas keys: ' + Object.keys(config.metadatas || {}).join(', '));

        if (!config.metadatas) {
          config.metadatas = {};
        }

        // Create complete metadata for salePrice (matching format of working fields like 'featured')
        config.metadatas.salePrice = {
          edit: {
            label: 'Sale Price',
            description: '',
            placeholder: '',
            visible: true,
            editable: true
          },
          list: {
            label: 'Sale Price',
            searchable: true,
            sortable: true
          }
        };

        // Create complete metadata for isSold (matching format of working fields like 'featured')
        config.metadatas.isSold = {
          edit: {
            label: 'Is Sold',
            description: '',
            placeholder: '',
            visible: true,
            editable: true
          },
          list: {
            label: 'Is Sold',
            searchable: true,
            sortable: true
          }
        };

        // Save the updated config
        await strapi.db.query('strapi::core-store').update({
          where: { key: storeKey },
          data: { value: JSON.stringify(config) },
        });

        strapi.log.info('Created metadata for salePrice: ' + JSON.stringify(config.metadatas.salePrice));
        strapi.log.info('Created metadata for isSold: ' + JSON.stringify(config.metadatas.isSold));
        strapi.log.info('Update complete');
      } else {
        strapi.log.warn('No Content Manager config found for artwork');
      }
    } catch (error) {
      strapi.log.error('Bootstrap error:', error.message);
    }
  },
};
