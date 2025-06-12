import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import NavbarWrapper from "@/components/NavbarWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "News Pay",
  description: "News Pay Application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <Providers>
          <NavbarWrapper>
            {children}
          </NavbarWrapper>
        </Providers>
      </body>
    </html>
  );
}
