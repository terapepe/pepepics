/* PEPE.PICS — wallet connect (EVM via EIP-6963 / window.ethereum, Solana via Phantom / Solflare / Backpack).
 * Only the networks visible in the current mode (js/config.js → mode) are offered.
 * EVM: the wallet is switched to the chosen chain (added automatically if missing).
 * Shows the $PEPES balance once the CA is filled in. */
(function () {
  const C = window.PEPE_CONFIG;
  if (!C.wallet?.enabled) return;
  const KEY = "pepepics:wallet";
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const short = (a) => (a ? `${a.slice(0, 4)}…${a.slice(-4)}` : "");
  const nets = () => (C.mode === "single" ? [C.singleNetwork] : C.multiOrder).map((k) => ({ key: k, ...C.networks[k] }));
  const net = (k) => (C.networks[k] ? { key: k, ...C.networks[k] } : null);
  const caOf = (n) => n.ca || (n.type === "solana" ? C.token.solanaMint : C.token.evmAddress);
  const hex = (n) => "0x" + Number(n).toString(16);

  const evm = new Map(); // rdns -> { info, provider }
  addEventListener("eip6963:announceProvider", (e) => {
    const { info, provider } = e.detail || {};
    if (info && provider) evm.set(info.rdns || info.uuid, { info, provider });
  });
  dispatchEvent(new Event("eip6963:requestProvider"));
  const evmWallets = () => {
    const l = [...evm.values()];
    if (!l.length && window.ethereum) l.push({ info: { name: window.ethereum.isMetaMask ? "MetaMask" : "Browser wallet", rdns: "injected", icon: "" }, provider: window.ethereum });
    return l;
  };
  const SOL = [
    { key: "phantom", name: "Phantom", url: "https://phantom.app", get: () => (window.phantom?.solana?.isPhantom ? window.phantom.solana : window.solana?.isPhantom ? window.solana : null) },
    { key: "solflare", name: "Solflare", url: "https://solflare.com", get: () => (window.solflare?.isSolflare ? window.solflare : null) },
    { key: "backpack", name: "Backpack", url: "https://backpack.app", get: () => window.backpack?.solana || null },
  ];

  const S = { connected: false, type: null, network: null, address: null, provider: null, name: null, id: null, balance: null };

  /* ------------------------------------------------------------ connect */
  async function switchEvm(p, n) {
    try {
      await p.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hex(n.chainId) }] });
    } catch (e) {
      if (e.code === 4902 || /unrecognized|not added|unknown chain/i.test(e.message || "")) {
        await p.request({ method: "wallet_addEthereumChain", params: [{ chainId: hex(n.chainId), chainName: n.name, nativeCurrency: n.nativeCurrency, rpcUrls: n.rpcUrls, blockExplorerUrls: [n.explorer.replace(/\/token\/?$/, "")] }] });
      } else throw e;
    }
  }

  async function connect(netKey, id) {
    const n = net(netKey);
    if (n.type === "solana") {
      const def = SOL.find((w) => w.key === id), p = def?.get();
      if (!p) { window.open(def.url, "_blank", "noopener"); throw new Error(`${def.name} is not installed`); }
      const r = await p.connect();
      const pk = (r && r.publicKey) || p.publicKey;
      set({ connected: true, type: "solana", network: netKey, address: pk.toString(), provider: p, name: def.name, id });
      p.on?.("accountChanged", (k) => (k ? set({ address: k.toString() }) : disconnect()));
    } else {
      const w = evmWallets().find((x) => (x.info.rdns || "injected") === id) || evmWallets()[0];
      if (!w) throw new Error("No EVM wallet found. Install MetaMask, Rabby, Coinbase Wallet…");
      const acc = await w.provider.request({ method: "eth_requestAccounts" });
      await switchEvm(w.provider, n);
      set({ connected: true, type: "evm", network: netKey, address: acc[0], provider: w.provider, name: w.info.name, id: w.info.rdns || "injected" });
      if (!w.provider._pepeBound) {
        w.provider._pepeBound = true;
        w.provider.on?.("accountsChanged", (a) => (a.length ? set({ address: a[0] }) : disconnect()));
        w.provider.on?.("chainChanged", (cid) => {
          const k = Object.keys(C.networks).find((k) => C.networks[k].chainId === parseInt(cid, 16));
          set({ network: k || null });
        });
      }
    }
  }

  async function disconnect() {
    if (S.type === "solana") try { await S.provider?.disconnect?.(); } catch {}
    Object.assign(S, { connected: false, type: null, network: null, address: null, provider: null, name: null, id: null, balance: null });
    try { localStorage.removeItem(KEY); } catch {}
    render();
  }

  function set(patch) {
    Object.assign(S, patch);
    if (S.connected) try { localStorage.setItem(KEY, JSON.stringify({ type: S.type, network: S.network, id: S.id })); } catch {}
    render();
    if ("address" in patch || "network" in patch) balance();
  }

  /* ------------------------------------------------------------ $PEPES balance */
  async function balance() {
    S.balance = null;
    const n = S.network && net(S.network);
    const ca = n && caOf(n);
    if (!S.connected || !ca) return render();
    try {
      if (S.type === "evm") {
        const call = (data) => S.provider.request({ method: "eth_call", params: [{ to: ca, data }, "latest"] });
        const [raw, dec] = await Promise.all([call("0x70a08231" + S.address.slice(2).toLowerCase().padStart(64, "0")), call("0x313ce567")]);
        S.balance = Number(BigInt(raw) / 10n ** BigInt(Math.max(0, parseInt(dec, 16) - 2))) / 100;
      } else {
        const r = await fetch(n.rpcUrls[0], { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getTokenAccountsByOwner", params: [S.address, { mint: ca }, { encoding: "jsonParsed" }] }) });
        const j = await r.json();
        S.balance = (j.result?.value || []).reduce((s, a) => s + (a.account.data.parsed.info.tokenAmount.uiAmount || 0), 0);
      }
    } catch { S.balance = null; }
    render();
  }

  /* ------------------------------------------------------------ restore silently */
  function restore() {
    let saved; try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch {}
    if (!saved || !nets().some((n) => n.key === saved.network)) return;
    setTimeout(async () => {
      try {
        if (saved.type === "solana") {
          const def = SOL.find((w) => w.key === saved.id), p = def?.get();
          if (!p) return;
          const r = await p.connect({ onlyIfTrusted: true });
          const pk = (r && r.publicKey) || p.publicKey;
          if (pk) set({ connected: true, type: "solana", network: saved.network, address: pk.toString(), provider: p, name: def.name, id: def.key });
        } else {
          const w = evmWallets().find((x) => (x.info.rdns || "injected") === saved.id) || evmWallets()[0];
          if (!w) return;
          const acc = await w.provider.request({ method: "eth_accounts" });
          if (!acc.length) return;
          const cid = parseInt(await w.provider.request({ method: "eth_chainId" }), 16);
          const k = Object.keys(C.networks).find((k) => C.networks[k].chainId === cid);
          set({ connected: true, type: "evm", network: k || null, address: acc[0], provider: w.provider, name: w.info.name, id: w.info.rdns || "injected" });
        }
      } catch {}
    }, 400);
  }

  /* ------------------------------------------------------------ UI */
  let tab = nets()[0].key;
  const modal = $("#walletModal"), body = $("#walletBody");
  const open = () => { modal.hidden = false; draw(); };
  const close = () => (modal.hidden = true);

  function render() {
    const b = $("#walletBtn");
    const n = S.network && net(S.network);
    if (!S.connected) { b.innerHTML = "Connect"; b.classList.remove("on"); }
    else b.innerHTML = `${n ? `<img src="${esc(n.icon)}" alt="" />` : "⚠"} ${esc(short(S.address))}`, b.classList.add("on");
    if (!modal.hidden) draw();
  }

  function draw() {
    const list = nets();
    if (S.connected) {
      const n = S.network && net(S.network);
      const evmNets = list.filter((x) => x.type === "evm");
      body.innerHTML = `
        <h3 class="w-title">Wallet connected</h3>
        <div class="w-acct">
          ${n ? `<img src="${esc(n.icon)}" alt="" />` : ""}
          <div><div class="w-net">${esc(n ? n.name : "Unsupported network")} · ${esc(S.name)}</div><div class="w-addr">${esc(S.address)}</div></div>
          <button class="chip" data-w="copy">Copy</button>
        </div>
        <div class="w-bal">$${esc(C.token.symbol)} balance: <b>${n && caOf(n) ? (S.balance == null ? "…" : S.balance.toLocaleString("en-US")) : "available once the CA is live"}</b></div>
        ${S.type === "evm" && evmNets.length > 1 ? `<div class="w-label">Switch network</div><div class="w-grid">${evmNets.map((x) => `<button class="w-opt ${x.key === S.network ? "on" : ""}" data-w="switch" data-net="${x.key}"><img src="${esc(x.icon)}" alt="" />${esc(x.short)}</button>`).join("")}</div>` : ""}
        ${!n ? `<p class="msg err">Your wallet is on a network this site does not use. Switch below or reconnect.</p>` : ""}
        <button class="btn btn-ghost btn-sm" data-w="disconnect">Disconnect</button>`;
      return;
    }
    const n = net(tab);
    const wallets = n.type === "solana"
      ? SOL.map((w) => ({ id: w.key, name: w.name, icon: w.get()?.icon || "", note: w.get() ? "Detected" : "Install" }))
      : evmWallets().map((w) => ({ id: w.info.rdns || "injected", name: w.info.name, icon: w.info.icon || "", note: "Detected" }));
    body.innerHTML = `
      <h3 class="w-title">Connect wallet</h3>
      ${list.length > 1 ? `<div class="w-label">Network</div><div class="w-grid">${list.map((x) => `<button class="w-opt ${x.key === tab ? "on" : ""}" data-w="tab" data-net="${x.key}"><img src="${esc(x.icon)}" alt="" />${esc(x.short)}</button>`).join("")}</div>` : ""}
      <div class="w-label">${esc(n.name)} wallets</div>
      <div class="w-list">
        ${wallets.length ? wallets.map((w) => `<button class="w-row" data-w="connect" data-id="${esc(w.id)}">${w.icon ? `<img src="${esc(w.icon)}" alt="" />` : `<span class="w-ph">${esc(w.name[0])}</span>`}<span>${esc(w.name)}</span><small>${esc(w.note)}</small></button>`).join("")
          : `<p class="muted">No EVM wallet detected in this browser. Install <a href="https://metamask.io" target="_blank" rel="noopener">MetaMask</a>, <a href="https://rabby.io" target="_blank" rel="noopener">Rabby</a> or <a href="https://www.coinbase.com/wallet" target="_blank" rel="noopener">Coinbase Wallet</a>, or open this site in your wallet's browser.</p>`}
      </div>
      <p class="msg" id="wMsg"></p>`;
  }

  modal.addEventListener("click", async (e) => {
    if (e.target === modal || e.target.closest("[data-w-close]")) return close();
    const b = e.target.closest("[data-w]");
    if (!b) return;
    const act = b.dataset.w;
    try {
      if (act === "tab") { tab = b.dataset.net; draw(); }
      if (act === "connect") { b.disabled = true; await connect(tab, b.dataset.id); }
      if (act === "switch") { await switchEvm(S.provider, net(b.dataset.net)); set({ network: b.dataset.net }); }
      if (act === "copy") { await navigator.clipboard.writeText(S.address); b.textContent = "Copied"; }
      if (act === "disconnect") { await disconnect(); }
    } catch (err) {
      const m = $("#wMsg");
      if (m) { m.className = "msg err"; m.textContent = err?.code === 4001 ? "Request rejected in wallet." : err?.message || "Wallet error"; }
      b.disabled = false;
    }
  });
  addEventListener("keydown", (e) => e.key === "Escape" && !modal.hidden && close());
  $("#walletBtn").hidden = false;
  $("#walletBtn").onclick = open;
  render();
  restore();
  window.PepeWallet = { state: S, open };
})();
