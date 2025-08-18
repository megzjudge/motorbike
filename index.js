// index.js
export default {
  async fetch(request, env, ctx) {
    try {
      return await env.ASSETS.fetch(request);
    } catch (e) {
      // Optional SPA fallback: always serve index.html for unknown routes
      const url = new URL(request.url);
      if (url.pathname.startsWith("/api/")) {
        return new Response("Not Found", { status: 404 });
      }
      return await env.ASSETS.fetch(new Request("http://fake/index.html", request));
    }
  },
};
