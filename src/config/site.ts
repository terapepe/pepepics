/**
 * PEPE.PICS — main site configuration.
 *
 * Everything brand / token / network related is edited here:
 *  - brand name, token name, symbol
 *  - contract addresses (CA)
 *  - display mode: "single" (one network) or "multi" (Solana, Robinhood, Base, BSC)
 *  - X (Twitter) account
 *
 * Admins can also override some text settings (hero, social link, upload limit, metadata)
 * from /admin/settings when Supabase is connected. Values here are the defaults.
 */

export type NetworkKey = "solana" | "robinhood" | "base" | "bsc";

export type Network = {
  key: NetworkKey;
  name: string;
  short: string;
  type: "evm" | "solana";
  chainId?: number;
  color: string; // brand color of the network (used for accents in single mode)
  tagline: string; // one-liner shown in single mode
  icon: string; // path in /public
  explorer: string; // explorer base URL
  explorerToken: string; // path prefix for token pages
  ca: string; // per-network CA override. Empty → token.evmAddress / token.solanaMint
};

export const siteConfig = {
  brand: {
    name: "PEPE PICS",
    wordmark: "PEPE.PICS",
    domain: "pepe.pics",
    tagline: "EVERY PEPE HAS A STORY.",
    secondaryTagline: "The Internet's Home for Pepe Art.",
    description:
      "Explore the world of Pepe art. Discover classic memes, rare artwork, creative variations, curated collections, and community creations.",
  },

  token: {
    name: "PEPES",
    symbol: "PEPES",
    /** One CA shared by all EVM networks (Robinhood, Base, BSC). Add later. */
    evmAddress: "",
    /** Solana mint address. Add later. */
    solanaMint: "",
  },

  /**
   * Display mode
   *  "single" → only `singleNetwork` is shown, and the token section is themed for that network
   *  "multi"  → always all 4 networks, in `multiOrder`
   */
  mode: "multi" as "single" | "multi",
  singleNetwork: "base" as NetworkKey,
  multiOrder: ["solana", "robinhood", "base", "bsc"] as NetworkKey[],

  networks: {
    solana: {
      key: "solana",
      name: "Solana",
      short: "SOL",
      type: "solana",
      color: "#14F195",
      tagline: "Fast, meme-native and built for the timeline.",
      icon: "/networks/solana.svg",
      explorer: "https://solscan.io",
      explorerToken: "/token/",
      ca: "",
    },
    robinhood: {
      key: "robinhood",
      name: "Robinhood Chain",
      short: "Robinhood",
      type: "evm",
      chainId: 4663,
      color: "#CCFF00",
      tagline: "Low-fee L2 for the next wave of collectors.",
      icon: "/networks/robinhood.svg",
      explorer: "https://robinhoodchain.blockscout.com",
      explorerToken: "/token/",
      ca: "",
    },
    base: {
      key: "base",
      name: "Base",
      short: "Base",
      type: "evm",
      chainId: 8453,
      color: "#3C7BFF",
      tagline: "Onchain with the Base community.",
      icon: "/networks/base.svg",
      explorer: "https://basescan.org",
      explorerToken: "/token/",
      ca: "",
    },
    bsc: {
      key: "bsc",
      name: "BNB Smart Chain",
      short: "BSC",
      type: "evm",
      chainId: 56,
      color: "#F0B90B",
      tagline: "Degen energy on BNB Smart Chain.",
      icon: "/networks/bsc.svg",
      explorer: "https://bscscan.com",
      explorerToken: "/token/",
      ca: "",
    },
  } satisfies Record<NetworkKey, Network>,

  social: {
    x: "https://x.com/PepePicture",
    xHandle: "@PepePicture",
    community: [] as { label: string; url: string }[], // e.g. { label: "Telegram", url: "https://t.me/..." }
  },

  uploads: {
    maxMb: 10,
    types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },

  popularSearches: ["smug", "rare", "space", "pixel", "cyberpunk", "samurai", "golden", "neon"],
};

/** Networks visible on the site, according to the mode. */
export function activeNetworks(): Network[] {
  const n = siteConfig.networks as Record<NetworkKey, Network>;
  if (siteConfig.mode === "single") return [n[siteConfig.singleNetwork]];
  return siteConfig.multiOrder.map((k) => n[k]);
}

/** Contract address for a network (per-network override → shared EVM CA / Solana mint). */
export function networkCA(net: Network): string {
  if (net.ca) return net.ca;
  return net.type === "solana" ? siteConfig.token.solanaMint : siteConfig.token.evmAddress;
}

export function explorerUrl(net: Network): string | null {
  const ca = networkCA(net);
  return ca ? `${net.explorer}${net.explorerToken}${ca}` : null;
}
