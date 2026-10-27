import type { MetadataRoute } from "next";
import { indexierungErlaubt, siteUrl } from "@/lib/deploy-ziel";

export const dynamic = "force-static";

/** Demo: nichts sperren (sonst könnten Suchmaschinen das noindex der Seiten nicht lesen) und keine Sitemap nennen. */
export default function robots(): MetadataRoute.Robots {
  return indexierungErlaubt
    ? { rules: { userAgent: "*", allow: "/" }, sitemap: `${siteUrl}/sitemap.xml` }
    : { rules: { userAgent: "*", allow: "/" } };
}
