"use client";

import { Car, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormField } from "@/components/ui/FormField";
import { Input, Select } from "@/components/ui/Input";
import { api, ensureCsrfCookie } from "@/lib/api/browser-client";

const FUEL_TYPES = [
  ["petrol", "Petrol"],
  ["octane", "Octane"],
  ["diesel", "Diesel"],
  ["cng", "CNG"],
  ["hybrid", "Hybrid"],
  ["electric", "Electric"],
  ["other", "Other"],
];

/** Add or edit one car (POST /me/vehicles, PATCH /me/vehicles/{id}). */
function VehicleForm({ brands, vehicle, onDone, onCancel }) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const otherId = brands.find((brand) => brand.name === "Other")?.id;
  const [brandId, setBrandId] = useState(vehicle ? String(vehicle.vehicle_brand_id ?? otherId ?? "") : "");

  const onSubmit = async (event) => {
    event.preventDefault();
    const form = Object.fromEntries(new FormData(event.currentTarget));
    const isOther = !brandId || Number(brandId) === otherId;
    const body = {
      ...form,
      vehicle_brand_id: isOther ? null : Number(brandId),
      brand_name: isOther ? form.brand_name : undefined,
      year: form.year ? Number(form.year) : null,
      fuel_type: form.fuel_type || null,
    };
    setBusy(true);
    setErrors({});
    try {
      await ensureCsrfCookie();
      if (vehicle) await api.patch(`/me/vehicles/${vehicle.id}`, body);
      else await api.post("/me/vehicles", body);
      toast.success(vehicle ? "Car updated" : "Car added");
      onDone();
    } catch (error) {
      if (error.isValidation) setErrors(error.fieldErrors);
      else toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };

  const showOther = brandId !== "" && Number(brandId) === otherId;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
      <FormField
        id="v-brand"
        label="Brand"
        required
        error={errors.vehicle_brand_id ?? (!showOther && errors.brand_name)}
      >
        <Select value={brandId} onChange={(event) => setBrandId(event.target.value)}>
          <option value="">Select brand</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </Select>
      </FormField>
      {showOther && (
        <FormField id="v-brand-name" label="Brand name" required error={errors.brand_name}>
          <Input name="brand_name" defaultValue={vehicle?.vehicle_brand_id ? "" : vehicle?.brand_name} maxLength={60} />
        </FormField>
      )}
      <FormField id="v-model" label="Model" required error={errors.model}>
        <Input name="model" defaultValue={vehicle?.model} maxLength={80} placeholder="e.g. Axio" />
      </FormField>
      <FormField id="v-reg" label="Car number" required error={errors.registration_number}>
        <Input
          name="registration_number"
          defaultValue={vehicle?.registration_number}
          maxLength={40}
          placeholder="Dhaka Metro Ga 12-3456"
        />
      </FormField>
      <FormField id="v-year" label="Year" error={errors.year}>
        <Input name="year" type="number" inputMode="numeric" defaultValue={vehicle?.year ?? ""} min={1950} />
      </FormField>
      <FormField id="v-fuel" label="Fuel" error={errors.fuel_type}>
        <Select name="fuel_type" defaultValue={vehicle?.fuel_type ?? ""}>
          <option value="">—</option>
          {FUEL_TYPES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField id="v-color" label="Colour" error={errors.color}>
        <Input name="color" defaultValue={vehicle?.color ?? ""} maxLength={30} />
      </FormField>
      <FormField id="v-chassis" label="Chassis number" error={errors.chassis_number}>
        <Input name="chassis_number" defaultValue={vehicle?.chassis_number ?? ""} maxLength={40} />
      </FormField>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" size="sm" loading={busy}>
          {vehicle ? "Save changes" : "Add car"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/** Customer portal: my cars — list, add, edit, remove. */
export function VehicleManager({ vehicles, brands }) {
  const router = useRouter();
  const [editing, setEditing] = useState(null); // "new" | vehicle id

  const done = () => {
    setEditing(null);
    router.refresh();
  };

  const remove = async (vehicle) => {
    if (!window.confirm(`Remove ${vehicle.brand_name} ${vehicle.model} (${vehicle.registration_number})?`)) return;
    try {
      await ensureCsrfCookie();
      await api.delete(`/me/vehicles/${vehicle.id}`);
      toast.success("Car removed", { description: "Its service history is kept at the workshop." });
      router.refresh();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-4">
      {vehicles.length === 0 && editing !== "new" && (
        <Card>
          <EmptyState
            icon={Car}
            title="No cars yet"
            description="Add your car once and pick it next time you book."
            action={
              <Button size="sm" onClick={() => setEditing("new")}>
                <Plus aria-hidden="true" />
                Add a car
              </Button>
            }
          />
        </Card>
      )}

      <ul className="grid gap-4 md:grid-cols-2">
        {vehicles.map((vehicle) => (
          <li key={vehicle.id}>
            <Card className="h-full p-5">
              {editing === vehicle.id ? (
                <VehicleForm brands={brands} vehicle={vehicle} onDone={done} onCancel={() => setEditing(null)} />
              ) : (
                <div className="flex items-start gap-4">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                    <Car className="size-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink-950">
                      {vehicle.brand_name} {vehicle.model}
                      {vehicle.year && <span className="font-normal text-zinc-500"> · {vehicle.year}</span>}
                    </p>
                    <p className="mt-0.5 text-sm text-zinc-600">{vehicle.registration_number}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {[vehicle.color, FUEL_TYPES.find(([value]) => value === vehicle.fuel_type)?.[1]]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setEditing(vehicle.id)}
                      aria-label={`Edit ${vehicle.registration_number}`}
                      className="rounded-control p-2 text-zinc-500 hover:bg-zinc-100 hover:text-ink-950"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(vehicle)}
                      aria-label={`Remove ${vehicle.registration_number}`}
                      className="rounded-control p-2 text-zinc-500 hover:bg-danger-50 hover:text-danger-700"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}
            </Card>
          </li>
        ))}
      </ul>

      {editing === "new" ? (
        <Card className="p-5">
          <h2 className="mb-4 font-semibold text-ink-950">Add a car</h2>
          <VehicleForm brands={brands} onDone={done} onCancel={() => setEditing(null)} />
        </Card>
      ) : (
        vehicles.length > 0 && (
          <Button size="sm" variant="outline" onClick={() => setEditing("new")}>
            <Plus aria-hidden="true" />
            Add another car
          </Button>
        )
      )}
    </div>
  );
}
