import { AppShell } from "@/components/AppShell";
import { seedMarkets } from "@/lib/protocol/markets";
import { GateClient } from "./GateClient";

export default async function GatePage({
  searchParams,
}: {
  searchParams: Promise<{ tx?: string }>;
}) {
  const params = await searchParams;
  return (
    <AppShell active="gate">
      <GateClient
        key={params.tx ?? "empty"}
        initialTx={params.tx}
        markets={seedMarkets()}
      />
    </AppShell>
  );
}
