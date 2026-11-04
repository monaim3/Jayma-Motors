import { LayoutDashboard } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = {
  title: "Dashboard",
};

/* Placeholder (F0). The customer dashboard is built from milestone F3 onward. */
export default function AccountDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <Card>
        <EmptyState
          icon={LayoutDashboard}
          title="Your dashboard is on its way"
          description="Appointments, vehicles and service history will appear here."
        />
      </Card>
    </div>
  );
}
