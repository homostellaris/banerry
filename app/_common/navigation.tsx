"use client";

import { cn } from "@/lib/utils";
import { BookOpen, Clock, Columns3, Palette } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact: boolean;
};

export default function Navigation({
  basePath,
  additionalItems = [],
}: {
  basePath: string;
  additionalItems?: NavigationItem[];
}) {
  const pathname = usePathname();

  const items = [
    {
      name: "Scripts",
      href: `${basePath}/scripts`,
      icon: BookOpen,
      exact: true,
    },
    {
      name: "Boards",
      href: `${basePath}/boards`,
      icon: Columns3,
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
    ...additionalItems,
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
