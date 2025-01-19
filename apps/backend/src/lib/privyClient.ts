import { PrivyClient } from "@privy-io/server-auth";
import { config } from "dotenv";

config();

if (!process.env.PRIVY_APP_ID) {
  throw new Error("Missing PRIVY_APP_ID in environment variables");
}

if (!process.env.PRIVY_APP_SECRET) {
  throw new Error("Missing PRIVY_APP_SECRET in environment variables");
}

export const privyClient = new PrivyClient(
  process.env.PRIVY_APP_ID,
  process.env.PRIVY_APP_SECRET
);
