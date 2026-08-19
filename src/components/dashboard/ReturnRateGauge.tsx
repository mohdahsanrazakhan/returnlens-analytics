"use client";

import { useLanguage } from "@/components/LanguageProvider";

interface GaugeProps {
  value: number; // 0-100
  label: string;
  zones?: { max: number; color: string }[]; // ascending thresholds
  invert?: boolean; // when true, high value is good (green)
}

const DEFAULT_ZONES = [
  { max: 15, color: "#10b981" },
  { max: 25, color: "#f59e0b" },
  { max: 100, color: "#f43f5e" },
];

export function Gauge({ value, label, zones = DEFAULT_ZONES, invert = false }: GaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const effectiveZones = invert ? [...zones].reverse().map((z, i, arr) => ({ ...z, max: 100 - (arr[arr.length - 1 - i]?.max ?? 0) })) : zones;
  const color = pickColor(clamped, invert ? zones : effectiveZones, invert);

  const radius = 42;
  const circumference = Math.PI * radius; // half circle
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 100 55" className="w-full max-w-[160px]">
        <path d="M 8 50 A 42 42 0 0 1 92 50" fill="none" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
        <path
          d="M 8 50 A 42 42 0 0 1 92 50"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text x="50" y="45" textAnchor="middle" className="fill-primary text-[18px] font-bold tabular-nums">
          {clamped.toFixed(0)}%
        </text>
      </svg>
      <span className="text-xs font-medium text-text-secondary">{label}</span>
    </div>
  );
}

function pickColor(value: number, zones: { max: number; color: string }[], invert: boolean) {
  if (invert) {
    // high = good: green above 90, amber 80-90, red below
    if (value >= 90) return "#10b981";
    if (value >= 80) return "#f59e0b";
    return "#f43f5e";
  }
  for (const z of zones) {
    if (value <= z.max) return z.color;
  }
  return zones[zones.length - 1].color;
}

export function ReturnRateGauge({ value }: { value: number }) {
  const { t } = useLanguage();
  return <Gauge value={value} label={t("gauge.returnRate")} />;
}
