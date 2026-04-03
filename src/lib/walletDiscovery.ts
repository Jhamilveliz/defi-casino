export type Eip1193 = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  isBraveWallet?: boolean;
  isRabby?: boolean;
  isTrust?: boolean;
  isFrame?: boolean;
};

export type WalletOption = {
  id: string;
  name: string;
  icon: string;
  provider: Eip1193;
};

function detectWalletName(p: Eip1193 & Record<string, unknown>): string {
  if (p.isMetaMask) return 'MetaMask';
  if (p.isCoinbaseWallet) return 'Coinbase Wallet';
  if (p.isBraveWallet) return 'Brave Wallet';
  if (p.isRabby) return 'Rabby';
  if (p.isTrust) return 'Trust Wallet';
  if (p.isFrame) return 'Frame';
  return 'Wallet del navegador';
}

/**
 * EIP-6963: wallets anuncian proveedor + metadata (nombre, icono).
 */
function collectEip6963(): Promise<WalletOption[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve([]);
      return;
    }

    const seen = new Set<string>();
    const out: WalletOption[] = [];

    const onAnnounce = (event: Event) => {
      const ce = event as CustomEvent<{
        info: { uuid: string; name: string; icon: string; rdns: string };
        provider: Eip1193;
      }>;
      const { info, provider } = ce.detail;
      if (!info?.uuid || !provider?.request) return;
      if (seen.has(info.uuid)) return;
      seen.add(info.uuid);
      out.push({
        id: info.uuid,
        name: info.name || 'Wallet',
        icon: info.icon || '',
        provider,
      });
    };

    window.addEventListener('eip6963:announceProvider', onAnnounce);
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    setTimeout(() => {
      window.removeEventListener('eip6963:announceProvider', onAnnounce);
      resolve(out);
    }, 250);
  });
}

/**
 * Fallback: varias extensiones exponen `ethereum.providers[]`.
 */
function collectLegacyMultiInjected(): WalletOption[] {
  if (typeof window === 'undefined') return [];
  const w = window as Window & { ethereum?: Eip1193 & { providers?: Eip1193[] } };
  const eth = w.ethereum;
  if (!eth) return [];

  if (Array.isArray(eth.providers) && eth.providers.length > 0) {
    return eth.providers.map((p, i) => {
      const ext = p as Eip1193 & Record<string, unknown>;
      const name = detectWalletName(ext);
      return {
        id: `legacy-${i}-${name}`,
        name,
        icon: '',
        provider: p,
      };
    });
  }

  return [
    {
      id: 'legacy-default',
      name: detectWalletName(eth as Eip1193 & Record<string, unknown>),
      icon: '',
      provider: eth,
    },
  ];
}

function dedupeByProviderId(wallets: WalletOption[]): WalletOption[] {
  const seen = new Set<string>();
  const out: WalletOption[] = [];
  for (const w of wallets) {
    const key = w.id;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(w);
  }
  return out;
}

/**
 * Lista billeteras disponibles (EIP-6963 + fallback legacy).
 */
export async function discoverWallets(): Promise<WalletOption[]> {
  const [eip6963, legacy] = await Promise.all([collectEip6963(), Promise.resolve(collectLegacyMultiInjected())]);

  const merged = [...eip6963];
  for (const l of legacy) {
    if (!merged.some((m) => m.provider === l.provider)) {
      merged.push(l);
    }
  }

  return dedupeByProviderId(merged);
}
