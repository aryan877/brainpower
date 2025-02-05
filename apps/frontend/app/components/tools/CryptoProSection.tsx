import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface FeatureCardProps {
  title: string;
  description: string;
  containerSrc: string;
}
function FeatureCard({ title, description, containerSrc }: FeatureCardProps) {
  return (
    <div className="relative rounded-2xl p-3 pb-5 overflow-hidden group transition-all duration-500 border border-muted bg-[#0A0A0A] hover:bg-[#070707]">
      <div
        className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent transition-all duration-500"
        style={{
          boxShadow:
            "inset 0 1px 30px rgba(255, 255, 255, 0.08), inset 0 -30px 40px rgba(0, 0, 0, 0.7)",
          transition: "all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)",
        }}
      />
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
        style={{
          boxShadow:
            "inset 0 2px 60px rgba(255, 255, 255, 0.1), inset 0 -80px 80px rgba(0, 0, 0, 0.9)",
        }}
      />
      <div className="relative w-full mb-3 overflow-hidden rounded-2xl group-hover:-translate-y-1 transition-transform duration-500">
        <Image
          src={containerSrc}
          alt={title}
          width={400}
          height={300}
          className="object-contain w-full"
        />
      </div>
      <div className="relative px-1 py-4">
        <h3 className="text-base font-medium mb-2 group-hover:text-white/90 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-muted-foreground/80 text-base group-hover:text-muted-foreground/90 transition-colors duration-300">
          {description}
        </p>
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
      <SectionHeader
        title={[`"But I'm Not a Crypto Pro"`]}
        description="Launch a vampire squid token and auto-generate description"
        titleSize="md"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
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
