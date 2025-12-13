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
        let updated = false;

        // Ensure metadatas exist for salePrice and isSold
        if (config.metadatas) {
          if (!config.metadatas.salePrice || !config.metadatas.salePrice.edit) {
            config.metadatas.salePrice = {
              edit: { label: 'SalePrice', description: '', placeholder: '', visible: true, editable: true },
              list: { label: 'SalePrice', searchable: true, sortable: true }
            };
            updated = true;
          }
          if (!config.metadatas.isSold || !config.metadatas.isSold.edit) {
            config.metadatas.isSold = {
              edit: { label: 'IsSold', description: '', placeholder: '', visible: true, editable: true },
              list: { label: 'IsSold', searchable: true, sortable: true }
            };
            updated = true;
          }

          // Also ensure they're in the edit layout
          if (config.layouts && config.layouts.edit) {
            const flatFields = config.layouts.edit.flat().map(f => f.name);
            if (!flatFields.includes('salePrice') || !flatFields.includes('isSold')) {
              // Add them to the last row of the edit layout
              config.layouts.edit.push([
                { name: 'salePrice', size: 6 },
                { name: 'isSold', size: 6 }
              ]);
              updated = true;
            }
          }
        }

        if (updated) {
          await strapi.db.query('strapi::core-store').update({
            where: { key: storeKey },
            data: { value: JSON.stringify(config) },
          });
          strapi.log.info('Updated Content Manager configuration for salePrice and isSold fields');
        }
      }
    } catch (error) {
      strapi.log.warn('Could not update Content Manager configuration:', error.message);
    }
  },
};
