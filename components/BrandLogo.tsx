

type LogoVariant = 
  | "mark" 
  | "markTransparent"
  | "horizontal" 
  | "horizontalDark" 
  | "horizontalLight" 
  | "compact" 
  | "white" 
  | "monochrome";

interface BrandLogoProps {
  variant?: LogoVariant;
  className?: string;
  priority?: boolean;
  alt?: string;
}

const variantPaths: Record<LogoVariant, string> = {
  mark: "/logo-mark.svg",
  markTransparent: "/logo-mark-transparent.svg",
  horizontal: "/logo-horizontal.svg",
  horizontalDark: "/logo-horizontal-dark.svg",
  horizontalLight: "/logo-horizontal-light.svg",
  compact: "/logo-horizontal-compact.svg",
  white: "/logo-white.svg",
  monochrome: "/logo-monochrome.svg",
};

export default function BrandLogo({
  variant = "horizontal",
  className = "",
  priority = false,
  alt = "Takt Studio Logo",
}: BrandLogoProps) {
  // Using an img tag instead of next/image for SVGs is often simpler,
  // but next/image with unoptimized=true also works. 
  // Given we want styling flexibility with className and these are scalable SVGs,
  // a standard img tag is very robust for SVGs in Next.js without needing width/height props.
  return (
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={variantPaths[variant]}
      alt={alt}
      className={`object-contain ${className}`}
      {...(priority ? { loading: "eager" } : { loading: "lazy" })}
    />
  );
}
