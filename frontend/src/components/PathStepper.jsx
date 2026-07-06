// src/components/PathStepper.jsx
// 4 milestones (Upload, Score, Optimize, Apply) ko jodti hui animated line —
// dono brand visual aur real progress indicator ka kaam karti hai.

import { useEffect, useState } from "react";

const STEPS = ["Upload", "Score", "Optimize", "Apply"];
const TOTAL_LENGTH = 480;

export default function PathStepper({ currentStep = 1 }) {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 150);
    return () => clearTimeout(t);
  }, [currentStep]);

  const nodeX = (i) => 60 + i * 160;
  const targetOffset = TOTAL_LENGTH - (TOTAL_LENGTH * (currentStep - 1)) / 3;

  return (
    <svg viewBox="0 0 600 60" className="w-full max-w-md mx-auto" role="img" aria-label={`Progress: step ${currentStep} of 4`}>
      <line x1={nodeX(0)} y1="20" x2={nodeX(3)} y2="20" stroke="#1E293B" strokeWidth="2" />
      <line
        x1={nodeX(0)} y1="20" x2={nodeX(3)} y2="20"
        stroke="#22D3EE" strokeWidth="2" strokeLinecap="round"
        strokeDasharray={TOTAL_LENGTH}
        strokeDashoffset={drawn ? targetOffset : TOTAL_LENGTH}
        style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1)", filter: "drop-shadow(0 0 4px #22D3EE)" }}
      />
      {STEPS.map((label, i) => {
        const active = i + 1 <= currentStep;
        return (
          <g key={label}>
            <circle
              cx={nodeX(i)} cy="20" r="7"
              fill={active ? "#22D3EE" : "#0E1526"}
              stroke={active ? "#22D3EE" : "#1E293B"}
              strokeWidth="1.5"
              style={{ transition: "fill 0.3s ease" }}
            />
            <text
              x={nodeX(i)} y="44" textAnchor="middle"
              fontSize="12" fontFamily="Inter, sans-serif"
              fill={active ? "#E2E8F0" : "#64748B"}
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
