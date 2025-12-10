import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "半導体業界サーベイ",
  description: "半導体業界の最新ニュースとトレンドを自動収集・要約",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
