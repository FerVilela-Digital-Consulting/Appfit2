import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BiofeedbackValues = {
  sleep_quality: number;
  daily_energy: number;
  training_energy: number;
  perceived_stress: number;
  hunger_level: number;
  digestion: number;
  libido: number;
};

type DailyBiofeedbackLike = {
  sleep_quality: number;
  daily_energy: number;
  training_energy: number;
  perceived_stress: number;
  hunger_level: number;
  digestion: number;
  libido: number;
  notes?: string | null;
} | null;

type MoodKey = "bad" | "okay" | "good" | "excellent";

type MoodPreset = {
  key: MoodKey;
  emoji: string;
  label: string;
  values: BiofeedbackValues;
};

type CustomPreset = {
  id: string;
  name: string;
  values: BiofeedbackValues;
};

type Props = {
  storageScopeKey: string;
  todayLabel: string;
  initialEntry: DailyBiofeedbackLike;
  onAutosave: (values: BiofeedbackValues) => Promise<void>;
};

const DEFAULT_VALUES: BiofeedbackValues = {
  sleep_quality: 5,
  daily_energy: 5,
  training_energy: 5,
  perceived_stress: 5,
  hunger_level: 5,
  digestion: 5,
  libido: 5,
};

const MOOD_PRESETS: MoodPreset[] = [
  {
    key: "bad",
    emoji: "😴",
    label: "Mal",
    values: {
      sleep_quality: 3,
      daily_energy: 3,
      training_energy: 2,
      perceived_stress: 8,
      hunger_level: 6,
      digestion: 4,
      libido: 4,
    },
  },
  {
    key: "okay",
    emoji: "😐",
    label: "OK",
    values: {
      sleep_quality: 5,
      daily_energy: 5,
      training_energy: 5,
      perceived_stress: 5,
      hunger_level: 5,
      digestion: 5,
      libido: 5,
    },
  },
  {
    key: "good",
    emoji: "⚡",
    label: "Bien",
    values: {
      sleep_quality: 7,
      daily_energy: 7,
      training_energy: 7,
      perceived_stress: 4,
      hunger_level: 4,
      digestion: 7,
      libido: 6,
    },
  },
  {
    key: "excellent",
    emoji: "🚀",
    label: "Excelente",
    values: {
      sleep_quality: 9,
      daily_energy: 9,
      training_energy: 9,
      perceived_stress: 2,
      hunger_level: 4,
      digestion: 8,
      libido: 8,
    },
  },
];

const PRESET_STORAGE_PREFIX = "appfit_biofeedback_quick_presets_";
const MAX_CUSTOM_PRESETS = 3;

const clampScale = (value: number) => Math.max(1, Math.min(10, Math.round(value)));

const normalizeValues = (values: Partial<BiofeedbackValues> | null | undefined): BiofeedbackValues => ({
  sleep_quality: clampScale(values?.sleep_quality ?? DEFAULT_VALUES.sleep_quality),
  daily_energy: clampScale(values?.daily_energy ?? DEFAULT_VALUES.daily_energy),
  training_energy: clampScale(values?.training_energy ?? DEFAULT_VALUES.training_energy),
  perceived_stress: clampScale(values?.perceived_stress ?? DEFAULT_VALUES.perceived_stress),
  hunger_level: clampScale(values?.hunger_level ?? DEFAULT_VALUES.hunger_level),
  digestion: clampScale(values?.digestion ?? DEFAULT_VALUES.digestion),
  libido: clampScale(values?.libido ?? DEFAULT_VALUES.libido),
});

const areValuesEqual = (left: BiofeedbackValues, right: BiofeedbackValues) =>
  left.sleep_quality === right.sleep_quality &&
  left.daily_energy === right.daily_energy &&
  left.training_energy === right.training_energy &&
  left.perceived_stress === right.perceived_stress &&
  left.hunger_level === right.hunger_level &&
  left.digestion === right.digestion &&
  left.libido === right.libido;

const calculateRecoveryScore = (values: BiofeedbackValues) => {
  const sleep = values.sleep_quality / 10;
  const energy = values.daily_energy / 10;
  const stressInverse = (10 - values.perceived_stress) / 10;
  const hunger = values.hunger_level / 10;
  const digestion = values.digestion / 10;
  const trainingEnergy = values.training_energy / 10;

  const score = Math.round(
    (sleep * 0.25 + energy * 0.25 + stressInverse * 0.2 + hunger * 0.1 + digestion * 0.1 + trainingEnergy * 0.1) * 100,
  );

  const recommendation =
    score > 80 ? "Entrenamiento intenso" : score > 60 ? "Entrenamiento moderado" : "Recuperación / descanso";

  return { score, recommendation };
};

const sliderRows: Array<{ key: keyof BiofeedbackValues; label: string; emoji: string }> = [
  { key: "sleep_quality", label: "Calidad de sueño", emoji: "😴" },
  { key: "daily_energy", label: "Energía diaria", emoji: "⚡" },
  { key: "training_energy", label: "Energía para entrenar", emoji: "🏋️" },
  { key: "perceived_stress", label: "Estrés", emoji: "🧠" },
  { key: "hunger_level", label: "Hambre", emoji: "🍽️" },
  { key: "digestion", label: "Digestión", emoji: "🧬" },
  { key: "libido", label: "Libido", emoji: "❤️" },
];

const getStorageKey = (scope: string) => `${PRESET_STORAGE_PREFIX}${scope || "anon"}`;

const loadCustomPresets = (scope: string): CustomPreset[] => {
  try {
    const raw = localStorage.getItem(getStorageKey(scope));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomPreset[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        id: item.id,
        name: String(item.name || "").trim(),
        values: normalizeValues(item.values),
      }))
      .filter((item) => item.id && item.name)
      .slice(0, MAX_CUSTOM_PRESETS);
  } catch {
    return [];
  }
};

const saveCustomPresets = (scope: string, presets: CustomPreset[]) => {
  localStorage.setItem(getStorageKey(scope), JSON.stringify(presets.slice(0, MAX_CUSTOM_PRESETS)));
};

const BiofeedbackQuickCheckin = ({ storageScopeKey, todayLabel, initialEntry, onAutosave }: Props) => {
  const [values, setValues] = useState<BiofeedbackValues>(() => normalizeValues(initialEntry));
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>(() => loadCustomPresets(storageScopeKey));
  const [presetName, setPresetName] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "typing" | "saving" | "saved" | "error">("idle");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const skipAutosaveRef = useRef(true);
  const timerRef = useRef<number | null>(null);
  const lastSavedRef = useRef<BiofeedbackValues>(normalizeValues(initialEntry));

  useEffect(() => {
    const nextValues = normalizeValues(initialEntry);
    setValues(nextValues);
    setSelectedMood(null);
    skipAutosaveRef.current = true;
    lastSavedRef.current = nextValues;
    setSaveState("idle");
    setSavedAt(null);
  }, [initialEntry]);

  useEffect(() => {
    setCustomPresets(loadCustomPresets(storageScopeKey));
  }, [storageScopeKey]);

  useEffect(() => {
    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false;
      return;
    }
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (areValuesEqual(values, lastSavedRef.current)) {
      setSaveState("saved");
      return;
    }
    setSaveState("typing");
    timerRef.current = window.setTimeout(async () => {
      try {
        setSaveState("saving");
        await onAutosave(values);
        lastSavedRef.current = values;
        setSaveState("saved");
        setSavedAt(new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }));
        console.log("Check-in guardado", values);
      } catch {
        setSaveState("error");
      }
    }, 700);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [onAutosave, values]);

  const recovery = useMemo(() => calculateRecoveryScore(values), [values]);

  const handleMoodSelect = (preset: MoodPreset) => {
    setSelectedMood(preset.key);
    setValues(preset.values);
  };

  const handleSliderChange = (key: keyof BiofeedbackValues, value: number) => {
    setSelectedMood(null);
    setValues((prev) => ({ ...prev, [key]: clampScale(value) }));
  };

  const handleSavePreset = () => {
    const name = presetName.trim();
    if (!name) return;
    const existingIndex = customPresets.findIndex((item) => item.name.toLowerCase() === name.toLowerCase());
    const next = [...customPresets];
    if (existingIndex >= 0) {
      next[existingIndex] = { ...next[existingIndex], values };
    } else {
      if (next.length >= MAX_CUSTOM_PRESETS) return;
      next.push({ id: crypto.randomUUID(), name, values });
    }
    setCustomPresets(next);
    saveCustomPresets(storageScopeKey, next);
    setPresetName("");
  };

  const handleDeletePreset = (id: string) => {
    const next = customPresets.filter((preset) => preset.id !== id);
    setCustomPresets(next);
    saveCustomPresets(storageScopeKey, next);
  };

  const saveIndicator =
    saveState === "saving"
      ? "Guardando automáticamente..."
      : saveState === "typing"
        ? "Escribiendo..."
        : saveState === "saved"
          ? `Guardado automático${savedAt ? ` · ${savedAt}` : ""}`
          : saveState === "error"
            ? "Error al guardar"
            : "Autoguardado activado";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">🧬 Check-in diario</p>
        <p className="mt-1 text-sm text-muted-foreground">{todayLabel}</p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
        <p className="text-sm font-semibold text-foreground">¿Cómo te sientes hoy?</p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {MOOD_PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => handleMoodSelect(preset)}
              className={cn(
                "rounded-xl border px-2 py-2 text-center transition-colors",
                selectedMood === preset.key
                  ? "border-primary bg-primary/10"
                  : "border-border/60 bg-background/50 hover:border-primary/40",
              )}
            >
              <p className="text-xl">{preset.emoji}</p>
              <p className="mt-1 text-xs font-medium">{preset.label}</p>
            </button>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Perfiles personalizados</p>
          {customPresets.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {customPresets.map((preset) => (
                <div key={preset.id} className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2 py-1">
                  <button
                    type="button"
                    className="text-xs font-medium text-foreground"
                    onClick={() => {
                      setSelectedMood(null);
                      setValues(preset.values);
                    }}
                  >
                    {preset.name}
                  </button>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeletePreset(preset.id)}
                    aria-label={`Eliminar perfil ${preset.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">Aún no tienes perfiles guardados.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          className="flex w-full items-center justify-between text-left"
        >
          <p className="text-sm font-semibold text-foreground">Ajustes (opcional)</p>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showDetails && "rotate-180")} />
        </button>

        {showDetails ? (
          <div className="mt-4 space-y-4">
            <p className="rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-xs text-muted-foreground">
              Escala rápida: <span className="font-semibold text-foreground">1 = sensación más baja</span> y{" "}
              <span className="font-semibold text-foreground">10 = sensación más alta</span>.
            </p>
            {sliderRows.map((row) => (
              <div key={row.key} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <p className="text-muted-foreground">
                    {row.emoji} {row.label}
                  </p>
                  <p className="font-semibold text-foreground">{values[row.key]}/10</p>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={values[row.key]}
                  onChange={(event) => handleSliderChange(row.key, Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-muted"
                />
              </div>
            ))}

            <div className="rounded-xl border border-border/60 bg-background/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Guardar perfil personalizado ({customPresets.length}/{MAX_CUSTOM_PRESETS})
              </p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  value={presetName}
                  onChange={(event) => setPresetName(event.target.value)}
                  placeholder="Ejemplo: Estresado"
                  className="h-9 w-full rounded-lg border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary/60"
                />
                <Button type="button" size="sm" className="h-9 rounded-lg px-3" onClick={handleSavePreset} disabled={!presetName.trim() || customPresets.length >= MAX_CUSTOM_PRESETS}>
                  Guardar
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Puedes guardar hasta {MAX_CUSTOM_PRESETS} perfiles personalizados.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">🧬 Recovery estimado</p>
        <div className="mt-2 flex items-end justify-between">
          <p className="text-4xl font-black leading-none text-foreground">{recovery.score}%</p>
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{recovery.recommendation}</p>
      </div>

      <p className="text-xs text-muted-foreground">{saveIndicator}</p>
    </div>
  );
};

export type { BiofeedbackValues };
export default BiofeedbackQuickCheckin;
