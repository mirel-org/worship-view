import { getDb, closeDb } from '../db';
import { songs, serviceListSongs } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

export async function handleGetSongs(env?: {
  DATABASE_URL?: string;
  HYPERDRIVE?: { connectionString: string };
}): Promise<Response> {
  const db = getDb(env);
  try {
    const allSongs = await db.select().from(songs);
    return Response.json(allSongs);
  } catch (error) {
    console.error('Error fetching songs:', error);
    return Response.json({ error: 'Failed to fetch songs' }, { status: 500 });
  } finally {
    await closeDb(db);
  }
}

export async function handleGetSongById(
  id: number,
  env?: { DATABASE_URL?: string; HYPERDRIVE?: { connectionString: string } },
): Promise<Response> {
  const db = getDb(env);
  try {
    console.log(`[handleGetSongById] Fetching song with ID: ${id}`);

    console.log('[handleGetSongById] Executing query...');
    const queryStart = Date.now();

    const result = await db
      .select()
      .from(songs)
      .where(eq(songs.id, id))
      .limit(1);

    console.log(
      `[handleGetSongById] Query completed in ${Date.now() - queryStart}ms`,
    );
    console.log(`[handleGetSongById] Result length: ${result.length}`);

    const song = result[0];

    if (!song) {
      console.log(`[handleGetSongById] Song not found with ID: ${id}`);
      return Response.json({ error: 'Song not found' }, { status: 404 });
    }

    console.log(`[handleGetSongById] Found song: ${song.name}`);
    return Response.json(song);
  } catch (error: any) {
    console.error('[handleGetSongById] Error fetching song:', error);
    console.error('[handleGetSongById] Error message:', error.message);
    console.error('[handleGetSongById] Error name:', error.name);
    console.error('[handleGetSongById] Error stack:', error.stack);

    return Response.json(
      { error: 'Failed to fetch song', details: error.message },
      { status: 500 },
    );
  } finally {
    await closeDb(db);
  }
}

export async function handleCreateSong(
  body: { name: string; fullText: string },
  env?: { DATABASE_URL?: string; HYPERDRIVE?: { connectionString: string } },
): Promise<Response> {
  const db = getDb(env);
  try {
    // SQL builder API for mutations (inserts/updates/deletes)
    const [newSong] = await db
      .insert(songs)
      .values({
        name: body.name,
        fullText: body.fullText,
      })
      .returning();

    return Response.json(newSong, { status: 201 });
  } catch (error: any) {
    console.error('Error creating song:', error);
    if (error.code === '23505') {
      // Unique violation
      return Response.json(
        { error: 'Song with this name already exists' },
        { status: 409 },
      );
    }
    return Response.json({ error: 'Failed to create song' }, { status: 500 });
  } finally {
    await closeDb(db);
  }
}

export async function handleUpdateSong(
  id: number,
  body: { name?: string; fullText?: string },
  env?: { DATABASE_URL?: string; HYPERDRIVE?: { connectionString: string } },
): Promise<Response> {
  console.log(`[handleUpdateSong] Starting update for song ID: ${id}`);
  console.log(
    '[handleUpdateSong] Body received:',
    JSON.stringify(body).substring(0, 200),
  );

  const db = getDb(env);
  try {
    console.log('[handleUpdateSong] Database connection obtained');

    const updateData: { name?: string; fullText?: string } = {};

    if (body.name !== undefined) {
      updateData.name = body.name;
      console.log('[handleUpdateSong] Will update name');
    }
    if (body.fullText !== undefined) {
      updateData.fullText = body.fullText;
      console.log(
        '[handleUpdateSong] Will update fullText, length:',
        body.fullText.length,
      );
    }

    // Validate that at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      console.log('[handleUpdateSong] No fields to update');
      return Response.json({ error: 'No fields to update' }, { status: 400 });
    }

    console.log(
      `[handleUpdateSong] Updating song ID: ${id} with data keys:`,
      Object.keys(updateData),
    );

    console.log('[handleUpdateSong] Executing database update query...');
    const queryStart = Date.now();
    const [updatedSong] = await db
      .update(songs)
      .set(updateData)
      .where(eq(songs.id, id))
      .returning();
    console.log(
      `[handleUpdateSong] Database query completed in ${
        Date.now() - queryStart
      }ms`,
    );
    console.log(
      '[handleUpdateSong] Query result:',
      updatedSong ? 'Found song' : 'No song found',
    );

    if (!updatedSong) {
      console.log(`[handleUpdateSong] Song not found with ID: ${id}`);
      return Response.json({ error: 'Song not found' }, { status: 404 });
    }

    console.log('[handleUpdateSong] Update successful, returning result');
    return Response.json(updatedSong);
  } catch (error: any) {
    console.error('[handleUpdateSong] ERROR updating song:', error);

    if (error.code === '23505') {
      // Unique violation
      console.log('[handleUpdateSong] Unique violation error');
      return Response.json(
        { error: 'Song with this name already exists' },
        { status: 409 },
      );
    }

    console.error('[handleUpdateSong] Returning 500 error response');
    return Response.json(
      {
        error: 'Failed to update song',
        details: error.message || 'Unknown error',
        code: error.code || 'UNKNOWN',
      },
      { status: 500 },
    );
  } finally {
    await closeDb(db);
  }
}

export async function handleDeleteSong(
  id: number,
  env?: { DATABASE_URL?: string; HYPERDRIVE?: { connectionString: string } },
): Promise<Response> {
  const db = getDb(env);
  try {
    console.log(`[handleDeleteSong] Deleting song with ID: ${id}`);
    const [deletedSong] = await db
      .delete(songs)
      .where(eq(songs.id, id))
      .returning();

    if (!deletedSong) {
      console.log(`[handleDeleteSong] Song not found with ID: ${id}`);
      return Response.json({ error: 'Song not found' }, { status: 404 });
    }

    console.log(
      `[handleDeleteSong] Successfully deleted song: ${deletedSong.name}`,
    );
    return Response.json({ success: true });
  } catch (error) {
    console.error('[handleDeleteSong] Error deleting song:', error);
    return Response.json({ error: 'Failed to delete song' }, { status: 500 });
  } finally {
    await closeDb(db);
  }
}

export async function handleBatchUpsertSongs(
  body: { songs: Array<{ name: string; fullText: string }> },
  env?: { DATABASE_URL?: string; HYPERDRIVE?: { connectionString: string } },
): Promise<Response> {
  const db = getDb(env);
  try {
    console.log(`[handleBatchUpsertSongs] Processing ${body.songs.length} songs`);
    
    if (!body.songs || !Array.isArray(body.songs) || body.songs.length === 0) {
      return Response.json({ error: 'Songs array is required and must not be empty' }, { status: 400 });
    }

    const results: Array<{ id: number; name: string; fullText: string }> = [];
    const errorList: Array<{ name: string; error: string }> = [];

    for (const song of body.songs) {
      try {
        if (!song.name || !song.fullText) {
          errorList.push({ name: song.name || 'unknown', error: 'Name and fullText are required' });
          continue;
        }

        // Use INSERT ... ON CONFLICT (name) DO UPDATE
        // This will insert new songs or update existing ones based on name
        const [upsertedSong] = await db
          .insert(songs)
          .values({
            name: song.name,
            fullText: song.fullText,
          })
          .onConflictDoUpdate({
            target: songs.name,
            set: {
              fullText: song.fullText,
            },
          })
          .returning();

        if (upsertedSong) {
          results.push(upsertedSong);
        }
      } catch (error: any) {
        console.error(`[handleBatchUpsertSongs] Error processing song ${song.name}:`, error);
        errorList.push({ name: song.name, error: error.message || 'Unknown error' });
      }
    }

    console.log(`[handleBatchUpsertSongs] Completed: ${results.length} successful, ${errorList.length} errors`);
    
    return Response.json({
      success: true,
      created: results.length,
      errorCount: errorList.length,
      results,
      errors: errorList.length > 0 ? errorList : undefined,
    }, { status: 200 });
  } catch (error: any) {
    console.error('[handleBatchUpsertSongs] Error:', error);
    return Response.json(
      { error: 'Failed to batch upsert songs', details: error.message },
      { status: 500 },
    );
  } finally {
    await closeDb(db);
  }
}

export async function handleDeleteAllSongs(
  env?: { DATABASE_URL?: string; HYPERDRIVE?: { connectionString: string } },
): Promise<Response> {
  const db = getDb(env);
  try {
    console.log('[handleDeleteAllSongs] Deleting all songs');
    
    // Get count before deletion
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(songs);
    const count = Number(countResult[0]?.count || 0);
    
    // Delete all songs
    await db.delete(songs);
    
    console.log(`[handleDeleteAllSongs] Successfully deleted ${count} songs`);
    return Response.json({ success: true, deletedCount: count });
  } catch (error: any) {
    console.error('[handleDeleteAllSongs] Error:', error);
    return Response.json(
      { error: 'Failed to delete all songs', details: error.message },
      { status: 500 },
    );
  } finally {
    await closeDb(db);
  }
}

// Service List Handlers
export async function handleGetServiceList(
  env?: { DATABASE_URL?: string; HYPERDRIVE?: { connectionString: string } },
): Promise<Response> {
  const db = getDb(env);
  try {
    const serviceList = await db
      .select({
        id: serviceListSongs.id,
        songId: serviceListSongs.songId,
        position: serviceListSongs.position,
        song: songs,
      })
      .from(serviceListSongs)
      .innerJoin(songs, eq(serviceListSongs.songId, songs.id))
      .orderBy(serviceListSongs.position);

    return Response.json(serviceList);
  } catch (error: any) {
    console.error('[handleGetServiceList] Error:', error);
    return Response.json(
      { error: 'Failed to fetch service list', details: error.message },
      { status: 500 },
    );
  } finally {
    await closeDb(db);
  }
}

export async function handleAddToServiceList(
  body: { songId: number },
  env?: { DATABASE_URL?: string; HYPERDRIVE?: { connectionString: string } },
): Promise<Response> {
  const db = getDb(env);
  try {
    // Check if song exists
    const [song] = await db
      .select()
      .from(songs)
      .where(eq(songs.id, body.songId))
      .limit(1);

    if (!song) {
      return Response.json({ error: 'Song not found' }, { status: 404 });
    }

    // Check if song is already in service list
    const [existing] = await db
      .select()
      .from(serviceListSongs)
      .where(eq(serviceListSongs.songId, body.songId))
      .limit(1);

    if (existing) {
      return Response.json(
        { error: 'Song is already in the service list' },
        { status: 409 },
      );
    }

    // Get the maximum position
    const maxPositionResult = await db
      .select({ max: sql<number>`max(${serviceListSongs.position})` })
      .from(serviceListSongs);
    const maxPosition = Number(maxPositionResult[0]?.max || 0);

    // Add song to service list
    const [newEntry] = await db
      .insert(serviceListSongs)
      .values({
        songId: body.songId,
        position: maxPosition + 1,
      })
      .returning();

    // Fetch the full entry with song data
    const [result] = await db
      .select({
        id: serviceListSongs.id,
        songId: serviceListSongs.songId,
        position: serviceListSongs.position,
        song: songs,
      })
      .from(serviceListSongs)
      .innerJoin(songs, eq(serviceListSongs.songId, songs.id))
      .where(eq(serviceListSongs.id, newEntry.id))
      .limit(1);

    return Response.json(result, { status: 201 });
  } catch (error: any) {
    console.error('[handleAddToServiceList] Error:', error);
    if (error.code === '23505') {
      return Response.json(
        { error: 'Song is already in the service list' },
        { status: 409 },
      );
    }
    return Response.json(
      { error: 'Failed to add song to service list', details: error.message },
      { status: 500 },
    );
  } finally {
    await closeDb(db);
  }
}

export async function handleRemoveFromServiceList(
  songId: number,
  env?: { DATABASE_URL?: string; HYPERDRIVE?: { connectionString: string } },
): Promise<Response> {
  const db = getDb(env);
  try {
    const [deleted] = await db
      .delete(serviceListSongs)
      .where(eq(serviceListSongs.songId, songId))
      .returning();

    if (!deleted) {
      return Response.json(
        { error: 'Song not found in service list' },
        { status: 404 },
      );
    }

    // Reorder remaining songs
    const remaining = await db
      .select()
      .from(serviceListSongs)
      .orderBy(serviceListSongs.position);

    for (let i = 0; i < remaining.length; i++) {
      await db
        .update(serviceListSongs)
        .set({ position: i + 1 })
        .where(eq(serviceListSongs.id, remaining[i].id));
    }

    return Response.json({ success: true });
  } catch (error: any) {
    console.error('[handleRemoveFromServiceList] Error:', error);
    return Response.json(
      { error: 'Failed to remove song from service list', details: error.message },
      { status: 500 },
    );
  } finally {
    await closeDb(db);
  }
}

export async function handleReorderServiceList(
  body: { songIds: number[] },
  env?: { DATABASE_URL?: string; HYPERDRIVE?: { connectionString: string } },
): Promise<Response> {
  const db = getDb(env);
  try {
    if (!body.songIds || !Array.isArray(body.songIds)) {
      return Response.json(
        { error: 'songIds array is required' },
        { status: 400 },
      );
    }

    // Update positions for each song
    for (let i = 0; i < body.songIds.length; i++) {
      await db
        .update(serviceListSongs)
        .set({ position: i + 1 })
        .where(eq(serviceListSongs.songId, body.songIds[i]));
    }

    // Fetch updated service list
    const serviceList = await db
      .select({
        id: serviceListSongs.id,
        songId: serviceListSongs.songId,
        position: serviceListSongs.position,
        song: songs,
      })
      .from(serviceListSongs)
      .innerJoin(songs, eq(serviceListSongs.songId, songs.id))
      .orderBy(serviceListSongs.position);

    return Response.json(serviceList);
  } catch (error: any) {
    console.error('[handleReorderServiceList] Error:', error);
    return Response.json(
      { error: 'Failed to reorder service list', details: error.message },
      { status: 500 },
    );
  } finally {
    await closeDb(db);
  }
}

export async function handleClearServiceList(
  env?: { DATABASE_URL?: string; HYPERDRIVE?: { connectionString: string } },
): Promise<Response> {
  const db = getDb(env);
  try {
    await db.delete(serviceListSongs);
    return Response.json({ success: true });
  } catch (error: any) {
    console.error('[handleClearServiceList] Error:', error);
    return Response.json(
      { error: 'Failed to clear service list', details: error.message },
      { status: 500 },
    );
  } finally {
    await closeDb(db);
  }
}
