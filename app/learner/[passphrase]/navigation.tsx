"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, Calendar, Clock, Volume2 } from "lucide-react";

interface NavigationProps {
  passphrase: string;
}

export default function Navigation({ passphrase }: NavigationProps) {
  const pathname = usePathname();
  
  const navigationItems = [
    {
      name: "Scripts",
      href: `/learner/${passphrase}`,
      icon: BookOpen,
      exact: true,
    },
    {
      name: "Board",
      href: `/learner/${passphrase}/board`,
      icon: Calendar,
      exact: false,
    },
    {
      name: "Timer",
      href: `/learner/${passphrase}/timer`,
      icon: Clock,
      exact: false,
    },
    {
      name: "Sounds",
      href: `/learner/${passphrase}/soundboard`,
      icon: Volume2,
      exact: false,
    },
  ];

  return (
    <nav className="sticky top-[73px] bg-background border-b border-slate-200 dark:border-slate-800 mb-6">
      <div className="container mx-auto px-4">
        <div className="flex overflow-x-auto scrollbar-hide">
          {navigationItems.map((item) => {
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
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}