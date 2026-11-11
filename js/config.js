/**
 * PEPE.PICS — all settings live here.
 * Edit this file (e.g. directly on GitHub) to change brand, token, CA, networks, mode, X account or Supabase.
 */
window.PEPE_CONFIG = {
  brand: {
    name: "PEPE PICS",
    wordmark: "PEPE.PICS",
    tagline: "EVERY PEPE HAS A STORY.",
    subtitle: "The Internet's Home for Pepe Art.",
  },

  token: {
    name: "PEPES",
    symbol: "PEPES",
    /** One CA shared by all EVM networks (Robinhood, Base, BSC). Add later. */
    evmAddress: "",
    /** Solana mint. Add later. */
    solanaMint: "",
  },

  /**
   * "multi"  → always shows Solana, Robinhood, Base, BSC (in multiOrder)
   * "single" → shows only singleNetwork; token section uses that network's color & tagline
   */
  mode: "multi",
  singleNetwork: "base",
  multiOrder: ["solana", "robinhood", "base", "bsc"],

  networks: {
    solana: {
      name: "Solana", short: "SOL", type: "solana", color: "#14F195",
      tagline: "Fast, meme-native and built for the timeline.",
      icon: "assets/networks/solana.svg", explorer: "https://solscan.io/token/", ca: "",
    },
    robinhood: {
      name: "Robinhood Chain", short: "Robinhood", type: "evm", color: "#CCFF00",
      tagline: "Low-fee L2 for the next wave of collectors.",
      icon: "assets/networks/robinhood.svg", explorer: "https://robinhoodchain.blockscout.com/token/", ca: "",
    },
    base: {
      name: "Base", short: "Base", type: "evm", color: "#3C7BFF",
      tagline: "Onchain with the Base community.",
      icon: "assets/networks/base.svg", explorer: "https://basescan.org/token/", ca: "",
    },
    bsc: {
      name: "BNB Smart Chain", short: "BSC", type: "evm", color: "#F0B90B",
      tagline: "Degen energy on BNB Smart Chain.",
      icon: "assets/networks/bsc.svg", explorer: "https://bscscan.com/token/", ca: "",
    },
  },

  social: {
    x: "https://x.com/PepePicture",
    xHandle: "@PepePicture",
  },

  /** Supabase: pictures table + Storage bucket for uploads. The anon key is public by design. */
  supabase: {
    url: "https://fcbejcuczofpznihsire.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjYmVqY3Vjem9mcHpuaWhzaXJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0MDA4NjgsImV4cCI6MjEwOTk3Njg2OH0.1FY3UHxAkwFTOqn7NpH2Agt_m4crR3cuYWnHtGXyd8g",
    bucket: "pics",
  },

  /** Gallery source: your pictures in pics/ → data/pics.json (run: node scripts/build-pics.mjs) */
  gallery: {
    showSamples: true, // set false once you have added your own pictures
  },

  /** Visitor uploads to Supabase — off for now. */
  upload: {
    enabled: false,
    maxMb: 10,
    types: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },

  categories: [
    { slug: "classic", name: "Classic" },
    { slug: "rare", name: "Rare" },
    { slug: "anime", name: "Anime" },
    { slug: "cyber", name: "Cyber" },
    { slug: "space", name: "Space" },
    { slug: "pixel", name: "Pixel" },
    { slug: "art", name: "Art" },
    { slug: "crypto", name: "Crypto" },
  ],

  pageSize: 40,
};
