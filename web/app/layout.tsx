import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QA Agent Control",
  description: "Autonomous QA agent observability console"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={spaceGrotesk.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
