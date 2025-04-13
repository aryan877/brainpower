import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface BenefitProps {
  text: string;
}

function Benefit({ text }: BenefitProps) {
  return (
    <div className="flex items-center bg-[#200000] border border-red-500/20 gap-2 px-4 py-2 rounded-full">
      <div className="rounded-full p-1 bg-black/50">
        <Check className="h-4 w-4 text-white" />
      </div>
      <span className="text-white/70">{text}</span>
    </div>
  );
}

export function JoinAlphaSection({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="relative z-[30] px-4 max-w-7xl mx-auto pt-32 pb-32 text-white">
      <div className="relative backdrop-blur-sm rounded-3xl p-12 md:p-20 group">
        <Image
          src="/landing/footer/background.svg"
          alt="Background pattern"
          fill
          className="object-cover object-top rounded-3xl"
        />
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div
          className="absolute inset-0 rounded-3xl transition-all duration-500"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(255,0,0,0.05), transparent 50%)",
            opacity: 0,
          }}
        />
        <div
          className="absolute inset-0 rounded-3xl group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(255,0,0,0.1), transparent 50%)",
            opacity: 0,
          }}
        />
        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="bg-gradient-to-b from-muted-foreground via-white via-muted-foreground to-white bg-clip-text w-full">
            <SectionHeader
              title="Join the Alpha"
              description=""
              titleSize="md"
              className="-mb-1"
            />
            <p className="text-base md:text-lg text-red-500 text-center leading-relaxed tracking-wide mb-8">
              First 200 users unlock
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
            <Benefit text="Lifetime 0% fees" />
            <Benefit text="VIP feature voting" />
            <Benefit text="Free $BRAIN airdrop" />
          </div>

          <Button
            onClick={onLogin}
            variant="outline"
            className="!bg-[#121212] border-destructive hover:!bg-[#121212]/90 transition-colors shadow-[0_4px_20px_-1px] shadow-destructive/40 px-8 py-6 text-lg"
          >
            Start Chatting
          </Button>
        </div>
      </div>
    </div>
  );
}
