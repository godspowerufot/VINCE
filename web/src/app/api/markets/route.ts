import { readMarkets } from "@/lib/protocol/sepoliaRead";

export const runtime = "nodejs";

export async function GET() {
  return Response.json(await readMarkets());
}
