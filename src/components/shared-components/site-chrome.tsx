"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/shared-components/header/header";
import Footer from "@/components/shared-components/footer/footer";

const SiteChrome: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const bare = pathname?.startsWith("/auth") || pathname?.includes("/constructor");

  if (bare) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

export default SiteChrome;
