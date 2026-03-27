import { ActivityScreen } from "@/components/ActivityScreen";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function ActivityPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center bg-gray-50 h-full">
        <Loader2 className="w-8 h-8 text-[#FF6633] animate-spin" />
      </div>
    }>
      <ActivityScreen />
    </Suspense>
  );
}

