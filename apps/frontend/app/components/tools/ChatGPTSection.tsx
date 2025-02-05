import { SectionHeader } from "@/components/ui/SectionHeader";

export function ChatGPTSection() {
  return (
    <div className="z-[30] flex flex-col items-center justify-start gap-6 px-4 max-w-7xl mx-auto pt-3">
      {/* Content */}
      <SectionHeader
        title="Like ChatGPT, but It Does the Crypto For You"
        description="Brainpower isn't just a chatbot – it's your AI employee for Solana that's organized into specialized agents, each built to handle a distinct set of crypto operations. Whether you're launching a memecoin, analyzing token data, staking assets, managing liquidity, or executing trades, Brainpower's got an agent for that."
        titleSize="sm"
      />
    </div>
  );
}
