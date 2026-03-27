import { ActivityScreen } from "@/components/ActivityScreen";
import { Suspense } from "react";
import { supabaseServer } from "@/lib/supabase-server";

// Using a type import to be safe
import type { Activity } from "@/components/ActivityScreen";

async function getInitialActivities(): Promise<Activity[]> {
  const { data } = await supabaseServer
    .from('activities_view')
    .select('*')
    .order('iso_timestamp', { ascending: false })
    .limit(50);
  return (data || []) as Activity[];
}

export default async function ActivityPage() {
  const initialActivities = await getInitialActivities();

  return (
    <Suspense fallback={<div className="p-8 text-gray-400">Loading activity...</div>}>
      <ActivityScreen initialActivities={initialActivities} />
    </Suspense>
  );
}
