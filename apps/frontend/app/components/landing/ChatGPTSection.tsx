import { SectionHeader } from "@/components/ui/SectionHeader";

export function ChatGPTSection() {
  return (
    <div className="z-[30] flex flex-col items-center justify-start gap-6 px-4 max-w-7xl mx-auto pt-3 text-white">
      {/* Content */}
      <SectionHeader
        title="ChatGPT for Solana: Simply Type & Activate"
        description="Meet Brainpower—your AI powerhouse for all things crypto on Solana. Just type your command, and our specialized agents will handle everything from launching tokens and swapping assets to performing rug checks, analyzing tweets, and checking token data. Experience effortless crypto operations powered by our robust backend actions."
        titleSize="sm"
      />
    </div>
  );
}
