import Link from "next/link";
import { useEffect, useState } from "react";

export default function RecentLearners() {
  const [passphrase, setPassphrase] = useState<string | null>(null);

  useEffect(() => {
    const storedPassphrase = localStorage.getItem("passphrase");
    setPassphrase(storedPassphrase);
  }, []);

  return (
    <>
      {passphrase && (
        <Link
          href={`/learner/${passphrase}`}
          className="flex items-center gap-2 underline text-blue-600 hover:text-blue-800 visited:text-purple-600"
        >
          {passphrase}
        </Link>
      )}
    </>
  );
}
