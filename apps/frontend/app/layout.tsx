import "./globals.css";
import { Inter } from "next/font/google";
import { NotificationContainer } from "./components/NotificationContainer";
import { PrivyProvider } from "./providers/PrivyProvider";
import { ReactQueryProvider } from "./providers/ReactQueryProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BrainPower",
  description:
    "An AI-powered blockchain agent that can interact with the Solana blockchain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <ReactQueryProvider>
              <PrivyProvider>{children}</PrivyProvider>
            </ReactQueryProvider>
          </TooltipProvider>
          <NotificationContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
