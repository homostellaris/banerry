import { generateMitigations, Mitigation } from "@/app/actions/mitigations";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import MitigationCard from "./mitigation-card";
import { useEffect, useState } from "react";

export function MitigationsSection({ scriptText }: { scriptText: string }) {
  const [mitigations, setMitigations] = useState<Mitigation[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const mitigations = await generateMitigations(scriptText);
        setMitigations(mitigations);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      }
    };
    fetchData();
  }, [scriptText]);

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-6">
      {mitigations.map((mitigation) => (
        <MitigationCard
          key={mitigation.id}
          mitigation={mitigation}
          originalScript={scriptText}
        />
      ))}
    </div>
  );
}
