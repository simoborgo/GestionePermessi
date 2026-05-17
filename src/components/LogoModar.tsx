import Image from "next/image";

interface Props {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function LogoModar({ className = "", size = "md" }: Props) {
  const heights = { sm: 32, md: 48, lg: 72 };
  const h = heights[size];

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="Modar"
        height={h}
        width={h * 4}
        style={{ height: h, width: "auto", objectFit: "contain" }}
        priority
      />
    </div>
  );
}
