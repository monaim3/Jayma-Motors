import { Suspense } from "react";
import { PasswordForm, ProfileForm } from "@/components/features/account/ProfileForms";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { serverFetch } from "@/lib/api/server-fetch";

export const metadata = {
  title: "Profile",
};

async function Profile() {
  const { data: profile } = await serverFetch("/me/profile", { cache: "no-store" });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader title="Your details" />
        <CardBody className="py-5">
          <ProfileForm profile={profile} />
        </CardBody>
      </Card>
      <Card>
        <CardHeader title="Password" />
        <CardBody className="py-5">
          <PasswordForm />
        </CardBody>
      </Card>
    </div>
  );
}

/** Customer portal: profile and password (GET/PATCH /me/profile, PUT /me/password). */
export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <Suspense
        fallback={
          <div className="grid gap-6 lg:grid-cols-2" aria-hidden="true">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        }
      >
        <Profile />
      </Suspense>
    </div>
  );
}
