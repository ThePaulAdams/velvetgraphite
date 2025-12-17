// backend/src/api/artwork/content-types/artwork/lifecycles.ts

export default {
  async bootstrap({ strapi }) {
    // This is a one-time script to fix a misconfigured admin UI view.
    // It programmatically adds the 'salePrice' and 'isSold' fields back to the edit view.
    console.log('Running artwork bootstrap lifecycle to fix admin UI...');

    const storeKey = 'plugin_content-manager_configuration_content-types::api::artwork.artwork';
    
    try {
      // 1. Get the current configuration from the core store
      const config = await strapi.store({
        environment: '',
        type: 'plugin_content_manager',
        name: 'configuration',
      }).get({ key: storeKey });

      if (!config) {
        console.error('Could not find artwork view configuration in store. Aborting.');
        return;
      }

      // 2. Check if the fields are already in the layout to prevent duplicates
      const editLayout = config.layouts.edit;
      const isSalePriceInLayout = editLayout.flat().some(field => field.name === 'salePrice');
      const isIsSoldInLayout = editLayout.flat().some(field => field.name === 'isSold');

      if (isSalePriceInLayout && isIsSoldInLayout) {
        console.log('Admin UI fields seem correct. No update needed. You can probably remove this lifecycle script.');
        return;
      }

      // 3. Add the fields if they are missing
      // We will add them in a new row together.
      const newRow = [];
      if (!isSalePriceInLayout) {
        newRow.push({ name: 'salePrice', size: 6 });
      }
      if (!isIsSoldInLayout) {
        newRow.push({ name: 'isSold', size: 6 });
      }

      if (newRow.length > 0) {
        // Add the new row after the 'title' row, or at the top if title isn't found.
        const titleRowIndex = editLayout.findIndex(row => row.some(field => field.name === 'title'));
        if (titleRowIndex !== -1) {
          editLayout.splice(titleRowIndex + 1, 0, newRow);
        } else {
          editLayout.unshift(newRow);
        }

        // 4. Update the configuration in the store
        await strapi.store({
          environment: '',
          type: 'plugin_content_manager',
          name: 'configuration',
        }).set({ key: storeKey, value: config });

        console.log('Successfully updated artwork edit view to include salePrice and isSold.');
        console.log('This script has done its job. You should consider removing it from lifecycles.ts after you have confirmed the fix in the admin panel.');
      }
    } catch (error) {
      console.error('Error during artwork bootstrap lifecycle:', error);
    }
  },
};
