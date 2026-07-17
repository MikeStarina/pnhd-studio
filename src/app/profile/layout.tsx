"use client";
import React from "react";
import AuthGuard from "@/components/shared-components/auth/auth-guard";
import AccountShell from "@/components/shared-components/auth/account-shell";

export default function ProfileLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthGuard>
      <AccountShell>{children}</AccountShell>
    </AuthGuard>
  );
}
