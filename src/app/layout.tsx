import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "睿煬旅行社 - 線上報名系統",
  description: "睿煬旅行社有限公司 線上報名與收訂金系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
