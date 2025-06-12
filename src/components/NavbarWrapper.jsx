'use client';

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarWrapper({ children }) {
  const pathname = usePathname();
  const hideNavbarPaths = ['/login', '/register'];

  return (
    <>
      {!hideNavbarPaths.includes(pathname) && <Navbar />}
      {children}
    </>
  );
} 