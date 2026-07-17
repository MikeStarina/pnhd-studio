"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetMeQuery } from "@/api/api";
import { useAppSelector } from "@/redux/redux-hooks";

type AuthGuardProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

/**
 * Blocks protected client pages until the session is resolved.
 * Redirects unauthenticated users to the login page.
 * With requireAdmin, non-admins are sent to the account page.
 */
const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAdmin = false,
}) => {
  const router = useRouter();
  const reduxUser = useAppSelector((store) => store.auth.user);
  const { data, isLoading } = useGetMeQuery();
  const user = reduxUser ?? data?.user ?? null;

  useEffect(() => {
    // Wait for the initial session check unless we already have a user
    // (e.g. just logged in while /me was still in an error state).
    if (isLoading && !user) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (requireAdmin && user.role !== "admin") {
      router.replace("/auth/account");
    }
  }, [isLoading, user, requireAdmin, router]);

  if ((isLoading && !user) || !user) return null;
  if (requireAdmin && user.role !== "admin") return null;

  return <>{children}</>;
};

export default AuthGuard;
