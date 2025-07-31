"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-card px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 no-print">
      <SidebarTrigger className="sm:hidden" />
      <div className="flex items-baseline gap-2">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          eFactura Simplificada
        </h1>
      </div>
    </header>
  );
}
