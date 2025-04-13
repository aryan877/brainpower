interface SectionHeaderProps {
  title: string | string[]; // Now accepts array of strings for multi-line titles
  description: string;
  titleSize?: "sm" | "md" | "lg";
  className?: string;
}

export function SectionHeader({
  title,
  description,
  titleSize = "md",
  className = "",
}: SectionHeaderProps) {
  const titleSizes = {
    sm: "text-4xl md:text-5xl",
    md: "text-5xl md:text-6xl",
    lg: "text-6xl md:text-7xl",
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <h2
        className={`${titleSizes[titleSize]} text-transparent bg-gradient-to-b from-muted-foreground via-white via-muted-foreground via-white to-muted-foreground bg-clip-text text-center leading-tight py-1`}
      >
        {Array.isArray(title)
          ? title.map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))
          : title}
      </h2>
      <p className="text-lg md:text-xl text-muted-foreground/60 max-w-4xl text-center mx-auto tracking-wide">
        {description}
      </p>
    </div>
  );
}
