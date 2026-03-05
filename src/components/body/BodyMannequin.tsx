import { cn } from "@/lib/utils";

export type PointKey = "neck" | "arm" | "waist" | "hip" | "thigh";

export type MeasurementPoint = {
  key: PointKey;
  label: string;
  valueText?: string;
  deltaText?: string;
  tone?: "neutral" | "positive" | "negative";
  x: number;
  y: number;
};

const toneClass: Record<NonNullable<MeasurementPoint["tone"]>, string> = {
  neutral: "border-white/20 bg-white/10",
  positive: "border-emerald-400/50 bg-emerald-500/20",
  negative: "border-rose-400/50 bg-rose-500/20",
};

export function BodyMannequin({
  points,
  onPointClick,
}: {
  points: MeasurementPoint[];
  onPointClick?: (key: PointKey) => void;
}) {
  return (
    <div className="relative w-full max-w-[320px] aspect-[3/5]">
      <svg
        viewBox="0 0 300 500"
        className="absolute inset-0 h-full w-full text-foreground"
        role="img"
        aria-label="Body measurement mannequin"
      >
        <g fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="10">
          <circle cx="150" cy="65" r="35" />
          <path d="M135 105 C140 130, 160 130, 165 105" />
          <path d="M90 150 C120 120, 180 120, 210 150" />
          <path d="M90 150 C95 230, 110 285, 135 320" />
          <path d="M210 150 C205 230, 190 285, 165 320" />
          <path d="M135 320 C125 350, 125 380, 140 400" />
          <path d="M165 320 C175 350, 175 380, 160 400" />
          <path d="M140 400 C125 430, 120 460, 120 490" />
          <path d="M160 400 C175 430, 180 460, 180 490" />
          <path d="M90 155 C70 210, 70 260, 85 320" />
          <path d="M210 155 C230 210, 230 260, 215 320" />
        </g>
      </svg>

      {points.map((p) => (
        <button
          key={p.key}
          type="button"
          className={cn(
            "absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border backdrop-blur px-2 py-1 text-left shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/50",
            toneClass[p.tone || "neutral"],
          )}
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          onClick={() => onPointClick?.(p.key)}
          aria-label={`${p.label}: ${p.valueText ?? "sin dato"} ${p.deltaText ? `(${p.deltaText})` : ""}`}
          title={`${p.label}\n${p.valueText ?? "Sin dato"}${p.deltaText ? ` • ${p.deltaText}` : ""}`}
        >
          <div className="text-[10px] leading-tight text-foreground/80">{p.label}</div>
          <div className="text-[11px] font-semibold leading-tight text-foreground">
            {p.valueText ?? "—"}
            {p.deltaText ? <span className="ml-1 text-foreground/70">{p.deltaText}</span> : null}
          </div>
        </button>
      ))}
    </div>
  );
}

