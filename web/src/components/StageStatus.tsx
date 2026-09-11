import { STAGES } from "@/lib/protocol/types";

export function StageStatus({
  stageIndex,
  elapsedMs,
}: {
  stageIndex: number;
  elapsedMs: number;
}) {
  const seconds = Math.floor(elapsedMs / 1000);
  const clock = `${Math.floor(seconds / 60)}:${(seconds % 60)
    .toString()
    .padStart(2, "0")}`;

  return (
    <div className="space-y-3" aria-live="polite">
      {STAGES.map((stage, index) => {
        const current = index === stageIndex;
        const done = index < stageIndex;
        return (
          <p
            key={stage}
            className={
              current
                ? "text-[15px] text-ink"
                : done
                  ? "text-[15px] text-mute"
                  : "text-[15px] text-mute/45"
            }
          >
            {stage}
            {current ? (
              <span className="ml-3 tabular-nums text-mute">{clock}</span>
            ) : null}
          </p>
        );
      })}
    </div>
  );
}
