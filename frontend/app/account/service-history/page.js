import { Wrench } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = {
  title: "Service History",
};

/* Placeholder until service records (B5): the menu link must not lead to a 404. */
export default function ServiceHistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Service history</h1>
      <Card>
        <EmptyState
          icon={Wrench}
          title="Coming soon"
          description="Every service and repair done on your cars at Jayma Motors will be listed here, with the work and parts."
        />
      </Card>
    </div>
  );
}
