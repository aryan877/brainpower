declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_PRIVY_APP_ID: string;
      NEXT_PUBLIC_BACKEND_URL: string;
      NEXT_PUBLIC_SOLANA_RPC_URL?: string;
    }
  }
}

export {};
