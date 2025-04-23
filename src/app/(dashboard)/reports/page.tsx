import { DashboardHeader } from "@/components/custom/dashboard/dashboard-header";
import { ReportsDashboard } from "@/components/custom/reports/reports-dashboard";

export default function ProfilePage() {
  return (
    <div className="h-screen flex flex-col ">
      <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard", active: false },
          { label: "Reports", href: "/reports", active: true },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 w-full overflow-y-auto h-full pb-4">
        <ReportsDashboard />
      </div>
    </div>
  );
}
