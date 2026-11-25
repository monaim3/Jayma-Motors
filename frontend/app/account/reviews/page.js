import { Star } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = {
  title: "My Reviews",
};

/* Placeholder until reviews (B7): the menu link must not lead to a 404. */
export default function MyReviewsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My reviews</h1>
      <Card>
        <EmptyState
          icon={Star}
          title="Coming soon"
          description="You'll be able to review your visits here and see when your review is published."
        />
      </Card>
    </div>
  );
}
