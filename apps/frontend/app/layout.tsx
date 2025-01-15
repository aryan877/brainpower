import "./globals.css";
import { Inter } from "next/font/google";
import { NotificationContainer } from "./components/NotificationContainer";
import { PrivyProvider } from "./providers/PrivyProvider";
import { ReactQueryProvider } from "./providers/ReactQueryProvider";
import { ModalProvider } from "./providers/ModalProvider";

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
        <ReactQueryProvider>
          <PrivyProvider>
            <ModalProvider>{children}</ModalProvider>
          </PrivyProvider>
        </ReactQueryProvider>
        <NotificationContainer />
      </body>
    </html>
  );
}
