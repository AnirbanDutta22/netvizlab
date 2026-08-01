import type { PropsWithChildren } from "react";
import { Sidebar } from "./sidebar";
import { ActivityLogRail } from "../shared/ui/activity-log-rail";

export const AppShell = ({ children }: PropsWithChildren) => (
  <div className="grid h-screen grid-cols-[220px_1fr_300px] grid-rows-[1fr]">
    <Sidebar />
    <main className="overflow-y-auto">{children}</main>
    <ActivityLogRail />
  </div>
);
