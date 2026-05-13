import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TES App",
  description: "The application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
