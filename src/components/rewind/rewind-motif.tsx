interface RewindMotifProps {
  variant?: "ribbon" | "flower";
  className?: string;
}

export function RewindMotif({ variant = "ribbon", className = "" }: RewindMotifProps) {
  if (variant === "flower") {
    return (
      <svg data-replay-motif viewBox="0 0 400 400" fill="none" aria-hidden="true" className={className}>
        {Array.from({ length: 8 }, (_, index) => (
          <ellipse
            key={index}
            cx="200"
            cy="108"
            rx="44"
            ry="106"
            fill="currentColor"
            transform={`rotate(${index * 45} 200 200)`}
          />
        ))}
      </svg>
    );
  }

  return (
    <svg data-replay-motif viewBox="0 0 600 600" fill="none" aria-hidden="true" className={className}>
      {Array.from({ length: 11 }, (_, index) => (
        <path
          key={index}
          d="M470 80 210 300 470 520"
          stroke="currentColor"
          strokeWidth="22"
          transform={`translate(${index * -17} ${index * 2}) scale(${1 - index * 0.046})`}
          opacity={1 - index * 0.065}
        />
      ))}
    </svg>
  );
}
