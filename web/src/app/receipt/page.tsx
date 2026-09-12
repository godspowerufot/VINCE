import { AppShell } from "@/components/AppShell";
import { ReceiptClient } from "./ReceiptClient";

export default async function ReceiptPage({
  searchParams,
}: {
  searchParams: Promise<{ tx?: string; ctc?: string }>;
}) {
  const params = await searchParams;
  return (
    <AppShell active="receipt">
      <ReceiptClient initialTx={params.tx} settlementTx={params.ctc} />
    </AppShell>
  );
}
