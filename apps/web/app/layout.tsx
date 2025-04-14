import { TooltipProvider } from "@/components/ui/tooltip";
import { Montserrat, Plus_Jakarta_Sans } from "next/font/google";
import { NotificationContainer } from "./components/NotificationContainer";
import "./globals.css";
import { PrivyProvider } from "./providers/PrivyProvider";
import { ReactQueryProvider } from "./providers/ReactQueryProvider";
import { ThemeProvider } from "./providers/ThemeProvider";
import { WalletProvider } from "./providers/WalletProvider";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

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
    <html lang="en" suppressHydrationWarning className="dark h-full">
      <head>
        <script
          defer
          data-domain="brainpower.sh"
          src="https://plausible.io/js/script.js"
        ></script>
      </head>
      <body
        className={`${montserrat.variable} ${jakarta.variable} font-sans h-full overflow-hidden`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>
            <ReactQueryProvider>
              <PrivyProvider>
                <WalletProvider>{children}</WalletProvider>
              </PrivyProvider>
            </ReactQueryProvider>
          </TooltipProvider>
          <NotificationContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
