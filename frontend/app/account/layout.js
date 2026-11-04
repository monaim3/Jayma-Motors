import { AccountShell } from "@/components/layout/AccountShell";

export const metadata = {
  title: "My Account",
  robots: { index: false },
};

/* The signed-in user (name, verification state) is loaded here in F1. */
export default function AccountLayout({ children }) {
  return <AccountShell>{children}</AccountShell>;
}
