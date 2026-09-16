import type { Metadata } from "next";
import "./globals.css";
import { ThemeToggle } from "./components/theme-toggle";

export const metadata: Metadata = {
  title: "CineSense — A home for your film diary",
  description: "A social movie and TV diary for what you watched, where you watched it, and who you watched it with.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><ThemeToggle />{children}</body>
    </html>
  );
}
