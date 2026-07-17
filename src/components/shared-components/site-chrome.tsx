"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/shared-components/header/header";
import Footer from "@/components/shared-components/footer/footer";

const SiteChrome: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  if (isAuthPage) {
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
