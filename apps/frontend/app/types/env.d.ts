declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_PRIVY_APP_ID: string;
      NEXT_PUBLIC_LOCAL_BACKEND_URL: string;
      NEXT_PUBLIC_PROD_BACKEND_URL: string;
      NEXT_PUBLIC_SOLANA_DEVNET_RPC_URL: string;
      NEXT_PUBLIC_SOLANA_MAINNET_RPC_URL: string;
    }
  }
}

export {};
