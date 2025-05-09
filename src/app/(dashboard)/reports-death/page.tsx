//app/(dashboard)/dashboard/reports-death/page.tsx
import { DashboardHeader } from "@/components/custom/dashboard/dashboard-header";
import DeathReport from "./death-report-components/all-component";

const DeathPageReport = () => {
  return (
    <div className="h-screen flex flex-col ">
      <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard", active: false },
          { label: "Reports", href: "/reports", active: true },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 w-full overflow-y-auto h-full pb-4">
        <DeathReport />
      </div>
    </div>
  );
};

export default DeathPageReport;
