import { Michroma, Space_Mono, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

// High-tech Branding Font
const michroma = Michroma({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-michroma",
});

// Forensic/Data Font
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
});

// Clean UI Font
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${michroma.variable} ${spaceMono.variable} ${outfit.variable}`}>
      <body className="bg-[#050505] text-white antialiased font-outfit">
        <Navbar />
        {children}
      </body>
    </html>
  );
}