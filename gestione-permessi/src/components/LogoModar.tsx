interface Props {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function LogoModar({ className = "", size = "md" }: Props) {
  const sizes = { sm: 24, md: 32, lg: 48 };
  const px = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Simbolo: griglia di barre orizzontali evocativa di scaffalature retail */}
      <svg width={px} height={px} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect x="4" y="5"  width="24" height="3.5" rx="1" fill="#A4A4A6" />
        <rect x="4" y="11" width="24" height="3.5" rx="1" fill="#A4A4A6" />
        <rect x="4" y="17" width="24" height="3.5" rx="1" fill="#A4A4A6" />
        <rect x="4" y="23" width="24" height="3.5" rx="1" fill="#A4A4A6" />
      </svg>
      {/* Wordmark */}
      <span
        style={{
          fontFamily: "var(--font-ui)",
          color: "#F08F25",
          fontWeight: 700,
          letterSpacing: "0.12em",
          fontSize: size === "sm" ? "13px" : size === "md" ? "17px" : "24px",
          lineHeight: 1,
        }}
      >
        MODAR
      </span>
    </div>
  );
}
