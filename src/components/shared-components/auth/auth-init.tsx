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
  const { data, isError } = useGetMeQuery();

  useEffect(() => {
    if (data?.user) {
      dispatch(authActions.setUser(data.user));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (isError) {
      dispatch(authActions.setUser(null));
    }
  }, [isError, dispatch]);

  return null;
};

export default AuthInit;
