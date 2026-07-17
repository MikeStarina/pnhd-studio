"use client";
import { useEffect } from "react";
import { useGetMeQuery } from "@/api/api";
import { useAppDispatch } from "@/redux/redux-hooks";
import { actions as authActions } from "@/redux/auth-slice/auth.slice";

/**
 * Hydrates the auth slice with the current user (if the auth cookie is valid).
 * Rendered once in the root layout. Renders nothing.
 */
const AuthInit: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, isError, isFetching } = useGetMeQuery();

  useEffect(() => {
    if (data?.user) {
      dispatch(authActions.setUser(data.user));
      return;
    }
    // Only clear when /me failed and we have no cached user (initial 401).
    // Do not wipe a user kept in RTK cache after a failed refetch.
    if (isError && !isFetching && !data) {
      dispatch(authActions.setUser(null));
    }
  }, [data, isError, isFetching, dispatch]);

  return null;
};

export default AuthInit;
