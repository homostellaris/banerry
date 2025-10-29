"use client";

import { cn } from "@/lib/utils";
import { BookOpen, Calendar, Clock, Palette } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation({ basePath }: { basePath: string }) {
  const pathname = usePathname();

  const items = [
    {
      name: "Scripts",
      href: basePath,
      icon: BookOpen,
      exact: true,
    },
    {
      name: "Board",
      href: `${basePath}/board`,
      icon: Calendar,
      exact: false,
    },
    {
      name: "Timer",
      href: `${basePath}/timer`,
      icon: Clock,
      exact: false,
    },
    {
      name: "Canvas",
      href: `${basePath}/canvas`,
      icon: Palette,
      exact: false,
    },
  ];

  return (
    <nav>
      <div className="flex overflow-x-auto scrollbar-hide">
        {items.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors hover:text-purple-700",
                isActive
                  ? "border-purple-700 text-purple-700"
                  : "border-transparent text-gray-600 hover:border-purple-300"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
