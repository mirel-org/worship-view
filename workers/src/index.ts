import {
  handleGetSongs,
  handleGetSongById,
  handleCreateSong,
  handleUpdateSong,
  handleDeleteSong,
  handleBatchUpsertSongs,
  handleDeleteAllSongs,
} from './routes/songs';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const startTime = Date.now();
    
    console.log(`[${new Date().toISOString()}] ${request.method} ${url.pathname}`);
    console.log('Env keys:', Object.keys(env));
    console.log('Has HYPERDRIVE:', !!env?.HYPERDRIVE);
    console.log('Has DATABASE_URL:', !!env?.DATABASE_URL);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      console.log('Handling OPTIONS preflight request');
      return new Response(null, { headers: corsHeaders });
    }
    
    try {
      // Route handling
      if (url.pathname === '/api/songs' && request.method === 'GET') {
        console.log('Handling GET /api/songs');
        const response = await handleGetSongs(env);
        console.log(`GET /api/songs completed in ${Date.now() - startTime}ms with status ${response.status}`);
        return new Response(response.body, {
          ...response,
          headers: { ...response.headers, ...corsHeaders },
        });
      }
      
      if (url.pathname.startsWith('/api/songs/') && request.method === 'GET') {
        const idStr = url.pathname.split('/api/songs/')[1];
        const id = parseInt(idStr, 10);
        if (isNaN(id)) {
          return new Response(JSON.stringify({ error: 'Invalid song ID' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        console.log(`Handling GET /api/songs/${id}`);
        const response = await handleGetSongById(id, env);
        console.log(`GET /api/songs/${id} completed in ${Date.now() - startTime}ms with status ${response.status}`);
        return new Response(response.body, {
          ...response,
          headers: { ...response.headers, ...corsHeaders },
        });
      }
      
      if (url.pathname === '/api/songs' && request.method === 'POST') {
        console.log('Handling POST /api/songs');
        const body = await request.json();
        console.log('POST body keys:', Object.keys(body));
        const response = await handleCreateSong(body, env);
        console.log(`POST /api/songs completed in ${Date.now() - startTime}ms with status ${response.status}`);
        return new Response(response.body, {
          ...response,
          headers: { ...response.headers, ...corsHeaders },
        });
      }
      
      if (url.pathname.startsWith('/api/songs/') && request.method === 'PUT') {
        const idStr = url.pathname.split('/api/songs/')[1];
        const id = parseInt(idStr, 10);
        if (isNaN(id)) {
          return new Response(JSON.stringify({ error: 'Invalid song ID' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        console.log(`Handling PUT /api/songs/${id}`);
        let body;
        try {
          body = await request.json();
          console.log('PUT body:', JSON.stringify(body).substring(0, 200));
        } catch (e) {
          console.error('Failed to parse PUT body:', e);
          return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const response = await handleUpdateSong(id, body, env);
        console.log(`PUT /api/songs/${id} completed in ${Date.now() - startTime}ms with status ${response.status}`);
        return new Response(response.body, {
          ...response,
          headers: { ...response.headers, ...corsHeaders },
        });
      }
      
      if (url.pathname.startsWith('/api/songs/') && request.method === 'DELETE') {
        const idStr = url.pathname.split('/api/songs/')[1];
        const id = parseInt(idStr, 10);
        if (isNaN(id)) {
          return new Response(JSON.stringify({ error: 'Invalid song ID' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        console.log(`Handling DELETE /api/songs/${id}`);
        const response = await handleDeleteSong(id, env);
        console.log(`DELETE /api/songs/${id} completed in ${Date.now() - startTime}ms with status ${response.status}`);
        return new Response(response.body, {
          ...response,
          headers: { ...response.headers, ...corsHeaders },
        });
      }
      
      if (url.pathname === '/api/songs/batch' && request.method === 'POST') {
        console.log('Handling POST /api/songs/batch');
        let body;
        try {
          body = await request.json();
        } catch (e) {
          console.error('Failed to parse batch body:', e);
          return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        const response = await handleBatchUpsertSongs(body, env);
        console.log(`POST /api/songs/batch completed in ${Date.now() - startTime}ms with status ${response.status}`);
        return new Response(response.body, {
          ...response,
          headers: { ...response.headers, ...corsHeaders },
        });
      }
      
      if (url.pathname === '/api/songs' && request.method === 'DELETE') {
        console.log('Handling DELETE /api/songs (delete all)');
        const response = await handleDeleteAllSongs(env);
        console.log(`DELETE /api/songs completed in ${Date.now() - startTime}ms with status ${response.status}`);
        return new Response(response.body, {
          ...response,
          headers: { ...response.headers, ...corsHeaders },
        });
      }
      
      console.log(`No route matched for ${request.method} ${url.pathname}`);
      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error: any) {
      console.error('Unhandled error in fetch handler:', error);
      console.error('Error stack:', error.stack);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          details: error.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  },
};

interface Env {
  DATABASE_URL?: string;
  HYPERDRIVE?: Hyperdrive;
}

interface Hyperdrive {
  connectionString: string;
}

