export function ChatGPTSection() {
  return (
    <div className="relative z-[30] flex flex-col items-center justify-start gap-6 px-4 max-w-7xl mx-auto pt-32 bg-black">
      <div className="bg-gradient-to-b from-muted-foreground via-white via-muted-foreground to-white bg-clip-text w-full">
        <h2 className="text-4xl md:text-5xl text-center text-transparent max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto">
          Like ChatGPT, but It Does <br className="hidden sm:block" />
          the Crypto For You
        </h2>
        <p className="text-base md:text-lg text-muted-foreground/60 max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto text-center leading-relaxed mt-8 tracking-wide">
          Brainpower isn&apos;t just a chatbot – it&apos;s your AI employee for
          Solana that&apos;s organized into specialized agents, each built to
          handle a distinct set of crypto operations. Whether you&apos;re
          launching a memecoin, analyzing token data, staking assets, managing
          liquidity, or executing trades, Brainpower&apos;s got an agent for
          that.
        </p>
      </div>
    </div>
  );
}
