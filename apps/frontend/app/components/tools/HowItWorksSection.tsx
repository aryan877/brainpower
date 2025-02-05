import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface StepProps {
  number: number;
  description: string;
  imageSrc: string;
}

function Step({ number, description, imageSrc }: StepProps) {
  return (
    <div className="relative backdrop-blur-sm rounded-2xl p-6 pb-8 overflow-hidden group transition-all duration-300 border border-[#17171B] bg-[#0B0B0D] hover:bg-[#0B0B0D]/90">
      <div className="flex items-center gap-2 mb-4">
        <Image
          src={imageSrc}
          alt={`Step ${number} icon`}
          width={24}
          height={24}
          className="w-6 h-6"
        />
        <div className="text-white">Step {number}</div>
      </div>
      <div className="px-1">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: "Generate",
      description: "Generates token name (e.g., $SQUIDLY), description, taxes",
      imageSrc: "/landing/how-it-works/step-1.svg",
    },
    {
      number: 2,
      title: "Configure",
      description: "Prefills Pump.fun parameters in a chat pop-up",
      imageSrc: "/landing/how-it-works/step-2.svg",
    },
    {
      number: 3,
      title: "Approve",
      description: "Waits for your meme image + one-click approval",
      imageSrc: "/landing/how-it-works/step-3.svg",
    },
    {
      number: 4,
      title: "Launch",
      description: "Launches → Sends TX link → You're live in 60 seconds.",
      imageSrc: "/landing/how-it-works/step-4.svg",
    },
  ];

  return (
    <div
      id="how"
      className="z-[30] flex flex-col items-center justify-start gap-12 px-4 max-w-7xl mx-auto pt-32"
    >
      <SectionHeader
        title="How Brainpower Works"
        description="Launch a vampire squid token and auto-generate description"
        titleSize="md"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {steps.map((step) => (
          <Step
            key={step.number}
            number={step.number}
            description={step.description}
            imageSrc={step.imageSrc}
          />
        ))}
      </div>
    </div>
  );
}
