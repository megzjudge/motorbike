// index.js
export default {
  async fetch(request, env, ctx) {
    // Serve the HTML file from Workers Sites (KV)
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/index.html") {
      // Fetch index.html from KV
      const html = await env.ASSETS.fetch(new Request("https://motorbike.jdge.cc/index.html"));
      return new Response(await html.text(), {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    // Serve images or other static assets from KV
    return env.ASSETS.fetch(request);
  },
};
