import { observeSourceTx } from "@/lib/protocol/observe";
import type { ObserveEvent } from "@/lib/protocol/types";

export const maxDuration = 300;
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { tx?: string } | null;
  const tx = body?.tx?.trim() ?? "";
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: ObserveEvent) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      try {
        await observeSourceTx(tx, send);
      } catch (err) {
        send({
          type: "error",
          error:
            err instanceof Error
              ? err.message
              : "Verification unavailable. Fail closed.",
          stage: "verify",
        });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
