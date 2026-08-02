"use client";
import React from "react";
import AuthGuard from "@/components/shared-components/auth/auth-guard";

export default function ProfileAdminSectionLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AuthGuard requireAdmin>{children}</AuthGuard>;
}
