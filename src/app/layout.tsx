import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DemoBanner } from "@/components/demo-banner";
import { Providers, type SessionUser } from "@/components/providers";
import { QuickViewProvider } from "@/components/quick-view";
import { SearchOverlay } from "@/components/search-overlay";
import { getCategories, getCurrentUser, getSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/env";
import { siteConfig } from "@/config/site";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = `${s.siteName} — The Ultimate Pepe Gallery`;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s · ${s.siteName}` },
    description: s.metaDescription,
    openGraph: { type: "website", siteName: s.siteName, title, description: s.metaDescription, url: SITE_URL },
    twitter: { card: "summary_large_image", site: siteConfig.social.xHandle, title, description: s.metaDescription },
    alternates: { canonical: "/" },
  };
}

export const viewport: Viewport = { themeColor: "#0B0D0B", colorScheme: "dark" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories, current] = await Promise.all([getSettings(), getCategories(), getCurrentUser()]);
  const initialUser: SessionUser | null = current
    ? { id: current.id, email: current.email, username: current.profile?.username ?? null, avatar_url: current.profile?.avatar_url ?? null, role: current.profile?.role ?? null }
    : null;
  return (
    <html lang="en">
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-pepe focus:px-4 focus:py-2 focus:text-bg">
          Skip to content
        </a>
        <Providers initialUser={initialUser}>
          <QuickViewProvider>
            <DemoBanner />
            <Header siteName={settings.siteName} logoUrl={settings.logoUrl} />
            <main id="main">{children}</main>
            <Footer siteName={settings.siteName} logoUrl={settings.logoUrl} xUrl={settings.xUrl} />
            <SearchOverlay categories={categories.map(({ slug, name }) => ({ slug, name }))} />
          </QuickViewProvider>
        </Providers>
      </body>
    </html>
  );
}
