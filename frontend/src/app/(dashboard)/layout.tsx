"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        onCreateAssignment={() => router.push("/assignments/create")}
      />
      <main className="flex-1 overflow-y-auto bg-[#f8f8f8]">
        {children}
      </main>
    </div>
  );
}
