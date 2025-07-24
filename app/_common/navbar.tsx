import { Home } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "../mentor/signout-button";
import Navigation from "./navigation";

export default function Navbar({ basePath }: { basePath: string }) {
  return (
    <header className="sticky top-0 z-10 bg-background border-b-2 border-slate-200 dark:border-slate-800">
      <div className="mx-auto px-4 max-w-4xl flex flex-row justify-between items-center">
        <Link href="/mentor">
          <Home className="h-6 w-6 text-purple-700" />
        </Link>
        <Navigation basePath={basePath} />
        <SignOutButton />
      </div>
    </header>
  );
}
