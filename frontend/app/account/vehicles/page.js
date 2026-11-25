import { Suspense } from "react";
import { VehicleManager } from "@/components/features/account/VehicleManager";
import { Skeleton } from "@/components/ui/Skeleton";
import { serverFetch } from "@/lib/api/server-fetch";

export const metadata = {
  title: "My Vehicles",
};

async function Vehicles() {
  const [{ data: vehicles }, { data: brands }] = await Promise.all([
    serverFetch("/me/vehicles", { cache: "no-store" }),
    serverFetch("/vehicle-brands", { cache: "no-store" }),
  ]);

  return <VehicleManager vehicles={vehicles} brands={brands} />;
}

/** Customer portal: my cars (GET /me/vehicles). */
export default function MyVehiclesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My vehicles</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Save your cars once and choose them when you book. Cars you book with are added here automatically.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2" aria-hidden="true">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        }
      >
        <Vehicles />
      </Suspense>
    </div>
  );
}
