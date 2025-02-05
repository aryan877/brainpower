import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Image from "next/image";

interface BenefitProps {
  text: string;
}

function Benefit({ text }: BenefitProps) {
  return (
    <div className="flex items-center bg-[#200000] border border-red-500/20 gap-2 px-4 py-2 rounded-full">
      <div className="rounded-full p-1 bg-muted">
        <Check className="h-4 w-4 text-white" />
      </div>
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
}

export function JoinAlphaSection({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="relative z-[30] px-4 max-w-7xl mx-auto pt-32 pb-32">
      <div className="relative backdrop-blur-sm rounded-3xl p-12 md:p-20">
        <Image
          src="/landing/footer/background.svg"
          alt="Background pattern"
          fill
          className="object-cover object-top rounded-3xl"
        />
        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="bg-gradient-to-b from-muted-foreground via-white via-muted-foreground to-white bg-clip-text w-full">
            <h2 className="text-5xl md:text-6xl mb-2 text-transparent">
              Join the Alpha
            </h2>
            <p className="text-base md:text-lg text-red-500 text-center leading-relaxed tracking-wide mb-8">
              First 500 users unlock
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
            <Benefit text="Lifetime 0% fees" />
            <Benefit text="VIP feature voting" />
            <Benefit text="Free $BRAIN airdrop" />
          </div>

          <Button
            onClick={onLogin}
            size="lg"
            variant="outline"
            className="!bg-[#121212] border-destructive hover:!bg-[#121212]/90 transition-colors px-8 py-6 text-lg shadow-[0_4px_20px_-1px] shadow-destructive/40"
          >
            Get Started Now
          </Button>
        </div>
      </div>
    </div>
  );
}
