import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "AI Text Processor",
  description: "Built by Esther B",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        {children}
      </body>
    </html>
  );
}
