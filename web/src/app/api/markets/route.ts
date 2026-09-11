import { readMarkets } from "@/lib/protocol/settlementRead";

export const runtime = "nodejs";

export async function GET() {
  return Response.json(await readMarkets());
}
