declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_PRIVY_APP_ID: string;
      NEXT_PUBLIC_BACKEND_URL: string;
    }
  }
}

export {};
