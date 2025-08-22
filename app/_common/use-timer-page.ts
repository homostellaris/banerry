"use client";

import { usePathname } from "next/navigation";

export function useIsTimerPage(): boolean {
  const pathname = usePathname();
  
  // Check if current path ends with /timer
  return pathname.endsWith("/timer");
}