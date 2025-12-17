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
      const configService = strapi.plugin('content-manager').service('content-types');
      const uid = 'api::artwork.artwork';

      // First sync configurations
      if (configService.syncConfigurations) {
        await configService.syncConfigurations();
        strapi.log.info('Content Manager sync complete');
      }

      // Get current configuration
      const config = await configService.findConfiguration({ uid });

      if (config && config.metadatas) {
        strapi.log.info('=== CHECKING FIELD METADATA ===');

        // Get the working field's metadata structure (featured works)
        const featuredMeta = config.metadatas.featured;
        strapi.log.info('Featured (working): ' + JSON.stringify(featuredMeta));
        strapi.log.info('isSold (broken): ' + JSON.stringify(config.metadatas.isSold));
        strapi.log.info('salePrice (broken): ' + JSON.stringify(config.metadatas.salePrice));

        // Check if we need to fix the metadata
        const isSoldMeta = config.metadatas.isSold;
        const salePriceMeta = config.metadatas.salePrice;

        let needsUpdate = false;

        // Create proper metadata structure for boolean fields (copy from featured)
        if (featuredMeta && featuredMeta.edit) {
          // Fix isSold if its edit metadata is missing or incomplete
          if (!isSoldMeta || !isSoldMeta.edit || JSON.stringify(isSoldMeta.edit) !== JSON.stringify(featuredMeta.edit)) {
            config.metadatas.isSold = {
              edit: { ...featuredMeta.edit },
              list: featuredMeta.list ? { ...featuredMeta.list } : { label: 'IsSold', searchable: true, sortable: true }
            };
            needsUpdate = true;
            strapi.log.info('Fixed isSold metadata');
          }
        }

        // For salePrice, use views metadata as template (both are numbers)
        const viewsMeta = config.metadatas.views;
        if (viewsMeta && viewsMeta.edit) {
          if (!salePriceMeta || !salePriceMeta.edit || JSON.stringify(salePriceMeta.edit) !== JSON.stringify(viewsMeta.edit)) {
            config.metadatas.salePrice = {
              edit: { ...viewsMeta.edit },
              list: viewsMeta.list ? { ...viewsMeta.list } : { label: 'SalePrice', searchable: true, sortable: true }
            };
            needsUpdate = true;
            strapi.log.info('Fixed salePrice metadata');
          }
        }
        
        // --- NEW LOGIC TO FIX THE LAYOUT ---
        const editLayout = config.layouts.edit;
        const isSalePriceInLayout = editLayout.flat().some(field => field.name === 'salePrice');
        const isIsSoldInLayout = editLayout.flat().some(field => field.name === 'isSold');

        if (!isSalePriceInLayout || !isIsSoldInLayout) {
            strapi.log.info('=== FIXING LAYOUTS ===');
            const newRow = [];
            if (!isSalePriceInLayout) {
                newRow.push({ name: 'salePrice', size: 6 });
                strapi.log.info('Adding salePrice to layout.');
            }
            if (!isIsSoldInLayout) {
                newRow.push({ name: 'isSold', size: 6 });
                strapi.log.info('Adding isSold to layout.');
            }
            
            // Add the new row after the 'title' row
            const titleRowIndex = editLayout.findIndex(row => row.some(field => field.name === 'title'));
            if (titleRowIndex !== -1) {
                editLayout.splice(titleRowIndex + 1, 0, newRow);
            } else {
                editLayout.unshift(newRow); // Failsafe
            }
            
            needsUpdate = true; // Mark configuration for update
        }
        // --- END OF NEW LOGIC ---

        // Update configuration if needed
        if (needsUpdate) {
          await configService.updateConfiguration(
            { uid },
            {
              settings: config.settings,
              metadatas: config.metadatas,
              layouts: config.layouts
            }
          );
          strapi.log.info('Configuration updated successfully');

          // Verify the update
          const updatedConfig = await configService.findConfiguration({ uid });
          strapi.log.info('Updated isSold: ' + JSON.stringify(updatedConfig.metadatas?.isSold));
          strapi.log.info('Updated salePrice: ' + JSON.stringify(updatedConfig.metadatas?.salePrice));
        } else {
          strapi.log.info('No metadata or layout updates needed');
        }
      }

    } catch (error) {
      strapi.log.error('Bootstrap error:', error.message, error.stack);
    }
  },
};
