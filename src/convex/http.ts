import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

http.route({
  path: "/api/gtfs-proxy",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const response = await fetch("https://zdmikp.bydgoszcz.pl/rozklady/paczka/gtfs/gtfs.zip");
    const buffer = await response.arrayBuffer();
    
    return new Response(buffer, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/zip",
        "Cache-Control": "public, max-age=3600"
      }
    });
  }),
});

http.route({
  path: "/robots.txt",
  method: "GET",
  handler: httpAction(async () => {
    const siteUrl = process.env.CONVEX_SITE_URL ?? "https://lovebydgoszcz.pl";
    const content = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
    return new Response(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }),
});

http.route({
  path: "/sitemap.xml",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const siteUrl = process.env.CONVEX_SITE_URL ?? "https://lovebydgoszcz.pl";

    // Static pages
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/nekrolog", priority: "0.8", changefreq: "daily" },
      { url: "/autor", priority: "0.7", changefreq: "weekly" },
      { url: "/pogoda", priority: "0.6", changefreq: "hourly" },
      { url: "/rozklad-jazdy", priority: "0.6", changefreq: "weekly" },
      { url: "/aktualizacje", priority: "0.7", changefreq: "daily" },
      { url: "/sport", priority: "0.7", changefreq: "daily" },
      { url: "/polityka", priority: "0.7", changefreq: "daily" },
      { url: "/inwestycje", priority: "0.7", changefreq: "weekly" },
      { url: "/nasze-dzialania", priority: "0.6", changefreq: "weekly" },
      { url: "/kontakt", priority: "0.5", changefreq: "monthly" },
      { url: "/miasto", priority: "0.8", changefreq: "daily" },
      { url: "/rozrywka", priority: "0.8", changefreq: "daily" },
      { url: "/kultura", priority: "0.8", changefreq: "daily" },
      { url: "/biznes", priority: "0.8", changefreq: "daily" },
      { url: "/gastronomia", priority: "0.8", changefreq: "daily" },
      { url: "/bydgoszczanie", priority: "0.8", changefreq: "daily" },
      { url: "/medyczna", priority: "0.8", changefreq: "daily" },
    ];

    // Dynamic articles
    const articles = await ctx.runQuery(api.articles.getForSitemap, {});

    const now = new Date().toISOString();

    const staticEntries = staticPages
      .map(
        (p) => `  <url>
    <loc>${siteUrl}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
    <lastmod>${now.split("T")[0]}</lastmod>
  </url>`
      )
      .join("\n");

    const articleEntries = articles
      .filter((a) => a.slug)
      .map((a) => {
        const lastmod = new Date(a.updatedAt ?? a.publishedAt).toISOString().split("T")[0];
        return `  <url>
    <loc>${siteUrl}/${a.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <lastmod>${lastmod}</lastmod>
  </url>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${articleEntries}
</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

export default http;