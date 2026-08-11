"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetMeQuery } from "@/api/api";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { actions as authActions } from "@/redux/auth-slice/auth.slice";

type AuthGuardProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
};

const isUnauthorizedError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "status" in error &&
  (error as { status?: unknown }).status === 401;

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
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((store) => store.auth.user);
  const { data, isLoading, isFetching, isError, error } = useGetMeQuery();
  const user = reduxUser ?? data?.user ?? null;
  // Stale RTK/Redux user after cookie expiry must not keep the shell open.
  const sessionExpired = !isFetching && isError && isUnauthorizedError(error);

  useEffect(() => {
    // Wait for the initial session check unless we already have a user
    // (e.g. just logged in while /me was still in an error state).
    if (isLoading && !user && !sessionExpired) return;
    if (!user || sessionExpired) {
      if (sessionExpired) dispatch(authActions.setUser(null));
      router.replace("/auth/login");
      return;
    }
    if (requireAdmin && user.role !== "admin") {
      router.replace("/profile");
    }
  }, [isLoading, user, sessionExpired, requireAdmin, router, dispatch]);

  if ((isLoading && !user && !sessionExpired) || !user || sessionExpired) {
    return null;
  }
  if (requireAdmin && user.role !== "admin") return null;

  return <>{children}</>;
};

export default AuthGuard;
