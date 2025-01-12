import "./globals.css";
import { Inter } from "next/font/google";
import { PrivyProvider } from "./providers/PrivyProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BrainPower",
  description: "AI-powered chat interface",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full overflow-hidden`}>
        <PrivyProvider>{children}</PrivyProvider>
      </body>
    </html>
  );
}
