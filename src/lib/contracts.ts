// Sepolia addresses provided by the user
export const tokencasinoAddress = '0xBa3552953A9Df4220acc5437c58f03bBED26e419';
export const casinointegradorAddress = '0x32E24a632c4066399c70C88F640A4Eb02D77d7B8';

// Minimal ERC20 ABI (enough for balances + approve flow)
export const tokencasinoAbi = [
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// Minimal casino integrator ABI (enough for buy/sell/bet + previews)
export const casinointegradorAbi = [
  // actions
  { inputs: [], name: 'comprarTokens', outputs: [], stateMutability: 'payable', type: 'function' },
  {
    inputs: [{ internalType: 'uint256', name: '_cantidad', type: 'uint256' }],
    name: 'venderTokens',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_numero', type: 'uint256' },
      { internalType: 'uint256', name: '_cantidad', type: 'uint256' },
    ],
    name: 'apostar',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // previews
  {
    inputs: [{ internalType: 'uint256', name: '_tokenAmount', type: 'uint256' }],
    name: 'cotizarVenta',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },

  // events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'ethAmount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'tokensRecibidos', type: 'uint256' },
    ],
    name: 'TokensComprados',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'tokenAmount', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'ethRecibido', type: 'uint256' },
    ],
    name: 'TokensVendidos',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'numero', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'cantidad', type: 'uint256' },
      { indexed: false, internalType: 'bool', name: 'gano', type: 'bool' },
      { indexed: false, internalType: 'uint256', name: 'premio', type: 'uint256' },
    ],
    name: 'ApuestaRealizada',
    type: 'event',
  },
] as const;

