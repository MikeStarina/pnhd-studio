import React from "react";
import AuthGuard from "@/components/shared-components/auth/auth-guard";
import AccountView from "@/components/shared-components/auth/account-view";

export const metadata = { title: "Аккаунт | PINHEAD STUDIO" };

const AccountPage = () => (
  <AuthGuard>
    <AccountView />
  </AuthGuard>
);

export default AccountPage;
