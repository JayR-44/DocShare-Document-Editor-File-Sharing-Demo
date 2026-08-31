import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "DocShare - Collaborative Document Editor & File Sharing Platform", description: "Create, edit, share, and import collaborative documents." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
