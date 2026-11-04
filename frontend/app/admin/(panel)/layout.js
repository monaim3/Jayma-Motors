import { AdminShell } from "@/components/layout/AdminShell";

export const metadata = {
  title: { default: "Admin", template: "%s | Jayma Motors Admin" },
  robots: { index: false },
};

/* The signed-in staff member and their permissions are loaded here in F1. */
export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
