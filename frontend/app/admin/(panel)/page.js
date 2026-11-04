import { LayoutDashboard } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = {
  title: "Dashboard",
};

/* Placeholder (F0). Dashboard widgets are built in milestone F10. */
export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <Card>
        <EmptyState
          icon={LayoutDashboard}
          title="Admin panel foundation is ready"
          description="Appointments, enquiries and service records will appear here as each milestone is built."
        />
      </Card>
    </div>
  );
}
