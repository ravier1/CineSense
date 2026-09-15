import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CineSense — Your watch life, beautifully kept",
  description: "A social movie and TV diary for what you watched, where you watched it, and who you watched it with.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
