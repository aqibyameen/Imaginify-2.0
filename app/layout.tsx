import type { Metadata } from "next";
// import localFont from "next/font/local";
import "./globals.css";
import {IBM_Plex_Sans} from "next/font/google"
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster"

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });
const IBMPlex=IBM_Plex_Sans({
 subsets:["latin"],
 weight:["400", "500","600","700"],
 variable:'--font-ibm-plex'
})
export const metadata: Metadata = {
  title: "AY Studio",
  description: "AI powered image generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      variables:{
        colorPrimary:"#624cf5"
        
      }
    }}>
    <html lang="en">
      <body
        className={cn("font-IBMPlex antialiased",IBMPlex.variable)}
      >
        <main>
        {children}
        </main>
        <Toaster />

      </body>
    </html>
    </ClerkProvider>
  );
}
