import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SocketProvider } from "./context/SocketContext"
import { DeviceProvider } from "./context/DeviceContext"
import { ThemeProvider } from "next-themes";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Didren Analyzer",
  description: "An application to test and analyze the Didren Test on VR headsets: all in one place. ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en" suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-geist-sans)]">
        <SocketProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <DeviceProvider>
              {children}
            </DeviceProvider>
          </ThemeProvider>
        </SocketProvider>
      </body>
    </html>
  );
}
