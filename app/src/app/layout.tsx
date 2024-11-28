import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import { ClientOnly } from "@/components/client-only";
import { ThemeProvider } from "@/providers/theme-provider";
import {Noto_Sans} from 'next/font/google'

const notoSans = Noto_Sans({
  weight: ['100', '200', '300', '400', '700', '900'], 
  subsets: ['latin'],                          
  display: 'swap',                             
});

export const metadata: Metadata = {
  title: "ShopsIns",
  description: "Multi Vendor Ecommerce Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientOnly>
      <ClerkProvider dynamic>
        <html lang="en">
          <body
            className={notoSans.className}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="flex flex-col w-full">
                {children}
              </div>
            </ThemeProvider>
          </body>
        </html>
      </ClerkProvider>
    </ClientOnly>
  );
}
