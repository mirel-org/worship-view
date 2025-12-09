import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import * as api from '../src/renderer/lib/api';

/**
 * Migration script to import existing song files into the database via Workers API
 * This script runs in Node.js (not Electron), so we calculate paths manually
 * Uses batch operations for better performance
 */
async function migrateSongsToDb() {
  try {
    console.log('Starting song migration...');
    
    // Calculate songs directory path (same as Electron app.getPath('documents'))
    // On macOS: ~/Documents/worship-view/songs/
    // On Windows: C:\Users\<user>\Documents\worship-view\songs\
    // On Linux: ~/Documents/worship-view/songs/
    const documentsPath = join(homedir(), 'Documents', 'worship-view', 'songs');
    
    console.log(`Looking for songs in: ${documentsPath}`);
    
    // Read all song files
    const files = (
      await readdir(documentsPath, { withFileTypes: true })
    ).filter((dirent) => dirent.isFile());

    console.log(`Found ${files.length} song files to migrate`);

    // Batch size for processing songs
    const BATCH_SIZE = 50;
    const batches: Array<{ name: string; fullText: string }>[] = [];
    
    // Read all files and prepare batches
    console.log('Reading song files...');
    for (const file of files) {
      try {
        const filePath = join(documentsPath, file.name);
        const content = await readFile(filePath, 'utf8');
        const songName = file.name;
        
        // Add to current batch or create new batch
        if (batches.length === 0 || batches[batches.length - 1].length >= BATCH_SIZE) {
          batches.push([]);
        }
        batches[batches.length - 1].push({ name: songName, fullText: content });
      } catch (error: any) {
        console.error(`✗ Failed to read ${file.name}:`, error.message || error);
      }
    }

    console.log(`Prepared ${batches.length} batch(es) of up to ${BATCH_SIZE} songs each`);
    
    let totalSuccess = 0;
    let totalErrors = 0;

    // Process batches
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`\nProcessing batch ${i + 1}/${batches.length} (${batch.length} songs)...`);
      
      try {
        const result = await api.batchUpsertSongs(batch);
        
        totalSuccess += result.created;
        totalErrors += result.errorCount;
        
        console.log(`✓ Batch ${i + 1} completed: ${result.created} songs processed`);
        
        if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
          console.log(`  Errors in batch ${i + 1}:`);
          result.errors.forEach((err) => {
            console.log(`    - ${err.name}: ${err.error}`);
          });
        }
      } catch (error: any) {
        console.error(`✗ Batch ${i + 1} failed:`, error.message || error);
        totalErrors += batch.length;
      }
    }

    console.log('\nMigration complete!');
    console.log(`Successfully migrated: ${totalSuccess}`);
    console.log(`Errors/Skipped: ${totalErrors}`);
    console.log(`Total files: ${files.length}`);
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Export for use in main process
export default migrateSongsToDb;

// If run directly (for testing)
if (require.main === module) {
  migrateSongsToDb()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

