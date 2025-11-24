import { PropsWithChildren } from "react";
import { SignOutButton } from "../mentor/signout-button";
import Navigation from "./navigation";

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact: boolean;
};

export default function Header({
  children,
}: PropsWithChildren<{
}>) {
  return (
    <header className="sticky top-0 z-10 bg-background border-b-2 border-slate-200 dark:border-slate-800">
      <div className="mx-auto px-4 max-w-4xl flex flex-row gap-4 justify-between items-center">
        {children}
      </div>
    </header>
  );
}
