import { generateMitigations } from "@/app/_mitigations/mitigations";
import MitigationCard from "./mitigation-card";

export async function MitigationsSection({
  scriptText,
}: {
  scriptText: string;
}) {
  const mitigations = await generateMitigations(scriptText);

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
