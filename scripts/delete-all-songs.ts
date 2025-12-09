import * as api from '../src/renderer/lib/api';

/**
 * Script to delete all songs from the database via Workers API
 * This script runs in Node.js (not Electron)
 */
async function deleteAllSongs() {
  try {
    console.log('Starting deletion of all songs...');
    console.log('⚠️  WARNING: This will delete ALL songs from the database!');
    
    // Confirm deletion (in a real scenario, you might want to add a prompt)
    // For now, we'll proceed directly
    
    const result = await api.deleteAllSongs();
    
    console.log('\nDeletion complete!');
    console.log(`Successfully deleted ${result.deletedCount} songs`);
  } catch (error: any) {
    console.error('Deletion failed:', error.message || error);
    throw error;
  }
}

// Export for use in main process
export default deleteAllSongs;

// If run directly (for testing)
if (require.main === module) {
  deleteAllSongs()
    .then(() => {
      console.log('Delete all songs script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Delete all songs script failed:', error);
      process.exit(1);
    });
}

