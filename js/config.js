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
    evmAddress: "0xD32EF052E29774FfE91f348DCC544BC9272Ac6Ea",
    solanaMint: "4JLhvDtYWjyPSHCorMEkqauQd3yxU7eVqJ86bU7146ea",
  },
  mode: "multi",
  singleNetwork: "robinhood",
  multiOrder: ["solana", "robinhood", "base", "bsc"],

  networks: {
    solana: {
      name: "Solana", short: "SOL", type: "solana", color: "#14F195",
      rpcUrls: ["https://api.mainnet-beta.solana.com"],
      tagline: "Fast, meme-native and built for the timeline.",
      icon: "assets/networks/solana.svg", explorer: "https://solscan.io/token/", ca: "",
    },
    robinhood: {
      name: "Robinhood Chain", short: "Robinhood", type: "evm", color: "#CCFF00",
      chainId: 4663, rpcUrls: ["https://rpc.mainnet.chain.robinhood.com"], nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      tagline: "Low-fee L2 for the next wave of collectors.",
      icon: "assets/networks/robinhood.svg", explorer: "https://robinhoodchain.blockscout.com/token/", ca: "",
    },
    base: {
      name: "Base", short: "Base", type: "evm", color: "#3C7BFF",
      chainId: 8453, rpcUrls: ["https://mainnet.base.org"], nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
      tagline: "Onchain with the Base community.",
      icon: "assets/networks/base.svg", explorer: "https://basescan.org/token/", ca: "",
    },
    bsc: {
      name: "BNB Smart Chain", short: "BSC", type: "evm", color: "#F0B90B",
      chainId: 56, rpcUrls: ["https://bsc-dataseed.bnbchain.org"], nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
      tagline: "Degen energy on BNB Smart Chain.",
      icon: "assets/networks/bsc.svg", explorer: "https://bscscan.com/token/", ca: "",
    },
  },

  social: {
    x: "//https://x.com/PepeTheFrog//",
    xHandle: "@PepeTheFrog",
    telegram: "https://t.me/PepeTheFrog",
  },

  /** Supabase: pictures table + Storage bucket for uploads. The anon key is public by design. */
  supabase: {
    url: "https://fcbejcuczofpznihsire.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjYmVqY3Vjem9mcHpuaWhzaXJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0MDA4NjgsImV4cCI6MjEwOTk3Njg2OH0.1FY3UHxAkwFTOqn7NpH2Agt_m4crR3cuYWnHtGXyd8g",
    bucket: "pics",
  },

  /** Sponsor section: wallets that receive sponsorships/donations (empty = "coming soon"). */
  sponsor: {
    evmAddress: "",   // receives on Robinhood, Base, BSC
    solanaAddress: "",
  },

  /** Wallet connect: shows only the networks visible in the current mode. Balances of $PEPES appear once the CA is set. */
  wallet: { enabled: true },

  /** Gallery source: your pictures in pics/ → data/pics.json (run: node scripts/build-pics.mjs) */
  gallery: {
    showSamples: false, // true = also show the 200 generated sample pictures
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
