import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/brainpower-agent"],

  images: {
    loader: "custom",
    loaderFile: "./app/utils/bunny-image-loader.ts",
    domains: ["brainpower.b-cdn.net"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.helius-rpc.com",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "arweave.net",
      },
      {
        protocol: "https",
        hostname: "www.arweave.net",
      },
      {
        protocol: "https",
        hostname: "metadata.degods.com",
      },
      {
        protocol: "https",
        hostname: "metadata.y00ts.com",
      },
      {
        protocol: "https",
        hostname: "nftstorage.link",
      },
      {
        protocol: "https",
        hostname: "shdw-drive.genesysgo.net",
      },
      {
        protocol: "https",
        hostname: "assets.solana.fm",
      },
      {
        protocol: "https",
        hostname:
          "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi.ipfs.dweb.link",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://telegram.org;",
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' data: blob: https:;",
              "font-src 'self';",
              "child-src 'self' https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org;",
              "frame-src 'self' https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com https://oauth.telegram.org;",
              "connect-src 'self' https://auth.privy.io wss://relay.walletconnect.com wss://relay.walletconnect.org wss://www.walletlink.org https://*.rpc.privy.systems https://api.mainnet-beta.solana.com https://api.devnet.solana.com https://api.testnet.solana.com;",
              "media-src 'self';",
              "object-src 'none';",
              "form-action 'self';",
              "base-uri 'self';",
              "frame-ancestors 'none';",
            ].join(" "),
          },
        ],
      },
    ];
  },

  async rewrites() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: `${process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL}/api/:path*`,
        },
      ];
    }

    // Production rewrites
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_PROD_BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
