import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HAQ.NEWS — News with evidence",
  description: "A global news experience built around source transparency, evidence, and clear uncertainty.",
  applicationName: "HAQ.NEWS",
};
export const viewport: Viewport = { themeColor: "#0b1220", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
