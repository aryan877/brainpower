import "./globals.css";
import { Inter } from "next/font/google";
import { WalletContextProvider } from "./components/WalletContextProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BrainPower",
  description: "AI-powered chat interface with Solana wallet integration",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletContextProvider>{children}</WalletContextProvider>
      </body>
    </html>
  );
}
