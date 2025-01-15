import "./globals.css";
import { Inter } from "next/font/google";
import { NotificationContainer } from "./components/NotificationContainer";
import { PrivyProvider } from "./providers/PrivyProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Brainpower",
  description: "AI-powered learning platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PrivyProvider>{children}</PrivyProvider>
        <NotificationContainer />
      </body>
    </html>
  );
}
