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
    const uid = 'api::artwork.artwork';
    strapi.log.info(`[Bootstrap] Starting configuration check for ${uid}...`);

    try {
      const configService = strapi.plugin('content-manager').service('content-types');
      let config = await configService.findConfiguration({ uid });

      if (!config) {
        strapi.log.error(`[Bootstrap] Could not find configuration for ${uid}.`);
        return;
      }

      let needsUpdate = false;

      // --- 1. Fix Metadata ---
      // Ensures the fields are configured to be editable in the Content Manager.
      const fieldsToFix = ['isSold', 'salePrice'];
      fieldsToFix.forEach(field => {
        if (!config.metadatas[field] || !config.metadatas[field].edit || !config.metadatas[field].edit.editable) {
          strapi.log.info(`[Bootstrap] Metadata for "${field}" is missing or incomplete. Rebuilding it.`);
          config.metadatas[field] = {
            "edit": {
              "label": field.charAt(0).toUpperCase() + field.slice(1), // e.g., "IsSold"
              "description": "",
              "placeholder": "",
              "visible": true,
              "editable": true
            },
            "list": {
              "label": field.charAt(0).toUpperCase() + field.slice(1),
              "searchable": true,
              "sortable": true
            }
          };
          needsUpdate = true;
        }
      });

      // --- 2. Fix Layout ---
      // Ensures the fields are placed in the Edit View layout.
      const editLayout = config.layouts.edit;
      const fieldsInLayout = editLayout.flat().map(f => f.name);
      
      const fieldsToAddToLayout = [];
      if (!fieldsInLayout.includes('isSold')) {
        fieldsToAddToLayout.push({ name: 'isSold', size: 6 });
      }
      if (!fieldsInLayout.includes('salePrice')) {
        fieldsToAddToLayout.push({ name: 'salePrice', size: 6 });
      }

      if (fieldsToAddToLayout.length > 0) {
        strapi.log.info(`[Bootstrap] Adding missing fields to edit layout: ${fieldsToAddToLayout.map(f => f.name).join(', ')}`);
        
        // Find the 'title' field to insert the new row after it.
        const titleRowIndex = editLayout.findIndex(row => row.some(field => field.name === 'title'));
        if (titleRowIndex !== -1) {
          // Insert new row after the title row.
          editLayout.splice(titleRowIndex + 1, 0, fieldsToAddToLayout);
        } else {
          // Failsafe: add to the top if title isn't found.
          editLayout.unshift(fieldsToAddToLayout);
        }
        needsUpdate = true;
      }

      // --- 3. Save if needed ---
      if (needsUpdate) {
        strapi.log.info(`[Bootstrap] Saving updated configuration for ${uid}.`);
        await configService.updateConfiguration({ uid }, config);
        strapi.log.info(`[Bootstrap] Successfully saved configuration for ${uid}.`);
      } else {
        strapi.log.info(`[Bootstrap] Configuration for ${uid} is already correct. No changes made.`);
      }

      strapi.log.info(`[Bootstrap] Configuration check for ${uid} finished.`);

    } catch (error) {
      strapi.log.error('[Bootstrap] An error occurred during the configuration fix:', error);
    }
  },
};