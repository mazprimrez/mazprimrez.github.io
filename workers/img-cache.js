// ============================================================
//  Cloudflare Worker · image cache at img.mazprimrez.com
// ============================================================
// Serves the site's Firebase Storage images (website/…) from Cloudflare's edge, so visitors
// don't wait on the US bucket. Deployed by hand: Cloudflare dashboard → Workers & Pages →
// img-cache → Edit code, with img.mazprimrez.com attached as its custom domain.
//
// Relies on the Storage rules allowing public reads under website/ (they're deployed from the
// other app's repo). Uploaded file names are never reused, so caching for a year is safe.

const BUCKET = "mazprimrez-b9171.firebasestorage.app";
const YEAR = 60 * 60 * 24 * 365;

export default {
  async fetch(request) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }

    // img.mazprimrez.com/website/<file> → Storage object website/<file>. The query string is
    // ignored so it can't be used to bypass the cache.
    let path;
    try { path = decodeURIComponent(new URL(request.url).pathname.slice(1)); }
    catch (e) { return new Response("Not found", { status: 404 }); }
    if (!/^website\/[^/]+$/.test(path)) return new Response("Not found", { status: 404 });

    const upstream = await fetch(
      `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(path)}?alt=media`,
      { cf: { cacheEverything: true, cacheTtlByStatus: { "200-299": YEAR, "404": 60, "500-599": 0 } } },
    );
    if (!upstream.ok) return new Response("Not found", { status: upstream.status === 404 ? 404 : 502 });

    const headers = new Headers({
      "Content-Type": upstream.headers.get("Content-Type") || "application/octet-stream",
      "Cache-Control": `public, max-age=${YEAR}, immutable`,
      "X-Content-Type-Options": "nosniff",
    });
    return new Response(request.method === "HEAD" ? null : upstream.body, { headers });
  },
};
