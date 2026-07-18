/**
 * Cloudflare Worker for Kisii Student Hostel Portal
 * Handles storing (POST/PUT) and retrieving (GET) the hostels list.
 * 
 * Setup instructions:
 * 1. Deploy this code to a Cloudflare Worker.
 * 2. Set the `API_TOKEN` environment variable in your Worker settings (Settings -> Variables).
 * 3. (Optional) Bind a KV Namespace named `HOSTELS_KV` or an R2 Bucket named `HOSTELS_BUCKET`.
 *    If no storage binding is present, the worker will fall back to memory-caching (which is ephemeral).
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Enable CORS for frontend requests
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 1. Handle GET requests to retrieve the listings
    if (request.method === "GET") {
      let data = null;
      
      try {
        if (env.HOSTELS_KV) {
          data = await env.HOSTELS_KV.get("hostels");
        } else if (env.HOSTELS_BUCKET) {
          const obj = await env.HOSTELS_BUCKET.get("hostels.json");
          if (obj) data = await obj.text();
        } else {
          data = globalThis.cachedHostels || null;
        }
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to read storage", details: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      if (!data) {
        return new Response(JSON.stringify({ error: "No listings data found yet. Trigger a sync from the Admin panel." }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      return new Response(data, {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 2. Handle POST/PUT requests to update/sync listings
    if (request.method === "POST" || request.method === "PUT") {

      let payload;
      try {
        payload = await request.text();
        // Simple verification that payload is valid JSON
        JSON.parse(payload);
      } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      let storageMethod = "memory";
      try {
        if (env.HOSTELS_KV) {
          await env.HOSTELS_KV.put("hostels", payload);
          storageMethod = "KV";
        } else if (env.HOSTELS_BUCKET) {
          await env.HOSTELS_BUCKET.put("hostels.json", payload, {
            httpMetadata: { contentType: "application/json" }
          });
          storageMethod = "R2";
        } else {
          globalThis.cachedHostels = payload;
          storageMethod = "memory";
        }
      } catch (err) {
        console.warn("Primary storage write failed, falling back to memory cache:", err.message);
        globalThis.cachedHostels = payload;
        storageMethod = "memory-fallback";
      }

      return new Response(JSON.stringify({ success: true, message: "Sync successful", storage: storageMethod }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
};
