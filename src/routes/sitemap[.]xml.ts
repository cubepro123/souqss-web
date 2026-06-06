import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
        const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
        const BASE_URL = `${proto}://${host}`;

        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/browse", changefreq: "daily", priority: "0.9" },
          { path: "/shops", changefreq: "weekly", priority: "0.8" },
        ];

        try {
          const [{ data: listings }, { data: shops }] = await Promise.all([
            supabase.from("listings").select("id,updated_at").eq("status", "active").limit(5000),
            supabase.from("shops").select("id,updated_at").limit(2000),
          ]);
          for (const l of listings ?? []) {
            entries.push({ path: `/listings/${l.id}`, lastmod: l.updated_at ?? undefined, changefreq: "weekly", priority: "0.7" });
          }
          for (const s of shops ?? []) {
            entries.push({ path: `/shops/${s.id}`, lastmod: s.updated_at ?? undefined, changefreq: "weekly", priority: "0.6" });
          }
        } catch {
          // fall back to static entries if DB is unreachable
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${new Date(e.lastmod).toISOString()}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});