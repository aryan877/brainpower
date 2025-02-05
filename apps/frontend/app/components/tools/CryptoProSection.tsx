import Image from "next/image";

interface FeatureCardProps {
  title: string;
  description: string;
  containerSrc: string;
}
function FeatureCard({ title, description, containerSrc }: FeatureCardProps) {
  return (
    <div className="relative backdrop-blur-sm rounded-2xl p-3 pb-5 overflow-hidden group transition-all duration-300 border border-muted bg-[#121212] hover:bg-[#121212]/90">
      <Image
        src="/landing/crypto-pro/overlay-shadow-bg.png"
        alt="Background overlay"
        fill
        className="object-cover opacity-50"
      />
      <div className="relative w-full mb-3 overflow-hidden">
        <Image
          src={containerSrc}
          alt={title}
          width={400}
          height={300}
          className="object-contain w-full"
        />
      </div>
      <div className="relative px-1 py-4">
        <h3 className="text-base font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground text-base">{description}</p>
      </div>
    </div>
  );
}

export function CryptoProSection() {
  const features = [
    {
      title: "Plain-English commands",
      description: '"Create a token for my Bored Ape fanclub" works.',
      containerSrc: "/landing/crypto-pro/container-1.svg",
    },
    {
      title: "Guardrails",
      description:
        "Blocks invalid supplies, wrong decimals, and sketchy contracts.",
      containerSrc: "/landing/crypto-pro/container-2.svg",
    },
    {
      title: "Teach mode",
      description: '"Explain this like I\'m new" → Simple, actionable answers.',
      containerSrc: "/landing/crypto-pro/container-3.svg",
    },
  ];

  return (
    <div className="relative z-[30] flex flex-col items-center justify-start gap-12 px-4 max-w-7xl mx-auto pt-32">
      <div className="text-center bg-gradient-to-b from-muted-foreground via-white via-muted-foreground to-white bg-clip-text w-full">
        <h2 className="text-5xl md:text-6xl mb-6 text-transparent">
          But I&apos;m Not a Crypto Pro
        </h2>
        <p className="text-base md:text-lg text-muted-foreground/60 max-w-3xl mx-auto text-center leading-relaxed tracking-wide">
          Launch a vampire squid token and auto-generate description
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            containerSrc={feature.containerSrc}
          />
        ))}
      </div>
    </div>
  );
}
