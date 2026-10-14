import * as fs from 'node:fs';
import * as path from 'node:path';
import process from 'node:process';
import { fetchKfcMobileRestaurants, fetchNandosMobileRestaurants } from './index';
import { MobileRestaurantListSchema } from '@halal-restaurants/types';

export async function updateOfflineData(): Promise<void> {
  console.log('====================================================');
  console.log(' Syncing Fresh UK Store Data for Bundled Datasets');
  console.log('====================================================\n');

  // 1. KFC UK
  console.log('[KFC UK] Fetching fresh store data from live endpoint...');
  const kfcItems = await fetchKfcMobileRestaurants();
  const validatedKfc = MobileRestaurantListSchema.parse(kfcItems);
  const kfcHalal = validatedKfc.filter((s) => s.isHalal).length;

  const kfcPath = path.resolve(__dirname, '../../../apps/mobile-kfc/assets/kfc-offline-data.json');
  fs.writeFileSync(kfcPath, JSON.stringify(validatedKfc, null, 2), 'utf-8');
  console.log(`[KFC UK] Successfully saved ${validatedKfc.length} stores (${kfcHalal} Halal) to:`);
  console.log(`         ${kfcPath}\n`);

  // 2. Nando's UK
  console.log("[Nando's UK] Fetching fresh store data from live stream...");
  const nandosItems = await fetchNandosMobileRestaurants();
  const validatedNandos = MobileRestaurantListSchema.parse(nandosItems);
  const nandosHalal = validatedNandos.filter((s) => s.isHalal).length;

  const nandosPath = path.resolve(__dirname, '../../../apps/mobile-nandos/assets/nandos-offline-data.json');
  fs.writeFileSync(nandosPath, JSON.stringify(validatedNandos, null, 2), 'utf-8');
  console.log(`[Nando's UK] Successfully saved ${validatedNandos.length} stores (${nandosHalal} Halal) to:`);
  console.log(`             ${nandosPath}\n`);

  console.log('====================================================');
  console.log(' Offline Datasets 100% Up-To-Date & Validated!');
  console.log('====================================================');
}

// Auto-run if executed directly as script
if (process.argv[1] && (process.argv[1].endsWith('sync.ts') || process.argv[1].endsWith('sync.js'))) {
  updateOfflineData().catch((err) => {
    console.error('[Error Updating Offline Data]:', err);
    process.exit(1);
  });
}

