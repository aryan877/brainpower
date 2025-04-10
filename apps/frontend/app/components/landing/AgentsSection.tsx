import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface AgentCardProps {
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt: string;
  bgImageSrc?: string;
  textBelow?: boolean;
  className?: string;
}

function AgentCard({
  title,
  description,
  imageSrc,
  imageAlt,
  bgImageSrc,
  textBelow = false,
  className = "",
}: AgentCardProps) {
  return (
    <div
      className={`relative backdrop-blur-sm  rounded-md p-6 overflow-hidden group transition-all duration-300 ${
        bgImageSrc
          ? "bg-black/30 hover:bg-black/40"
          : "bg-[#121212] hover:bg-[#121212]/90"
      } ${className}`}
    >
      <div className="absolute inset-0  rounded-md border border-white/10 pointer-events-none z-[5]" />

      {bgImageSrc ? (
        <>
          <div className="absolute inset-0 z-0">
            <Image
              src={bgImageSrc}
              alt="Background"
              fill
              className="object-cover scale-110 transform"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40 group-hover:from-black/0 group-hover:to-black/30 transition-all duration-300" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black transition-all duration-300" />
      )}
      <div className="flex flex-col h-full relative z-[2]">
        {textBelow ? (
          <>
            {imageSrc && (
              <div className="relative flex-1">
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-md"
                />
                {title === "Staking Agent" && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-md" />
                )}
              </div>
            )}
            <div className="relative z-10 mt-4">
              <h3 className="text-2xl mb-3">{title}</h3>
              <p className="text-muted-foreground">{description}</p>
            </div>
          </>
        ) : (
          <>
            <div className="relative z-10">
              <h3 className="text-2xl mb-3">{title}</h3>
              <p className="text-muted-foreground">{description}</p>
            </div>
            {imageSrc && (
              <div
                className={`absolute inset-x-0 bottom-0 z-0 ${title === "Liquidity Agent" ? "-translate-y-10" : ""}`}
              >
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function AgentsSection() {
  const agents = [
    {
      title: "Pump Fun Agent",
      description:
        "Your one-stop solution for memecoin magic and token launches on Pump.fun.",
      imageSrc: "/landing/agents/pump-fun-agent.svg",
      imageAlt: "Pump Fun Agent Interface",
      bgImageSrc: "/landing/agents/pump-fun-bg.png",
      textBelow: true,
      className: "md:col-span-1 lg:col-span-2 h-[400px]",
    },
    {
      title: "Token Analysis Agent",
      description:
        "Your personal detective for token insights and contract breakdowns.",
      imageSrc: "/landing/agents/token-analysis-agent.png",
      imageAlt: "Token Analysis Agent Interface",
      className: "md:col-span-3 lg:col-span-3 h-[400px]",
    },
    {
      title: "Staking Agent",
      description:
        "Maximize your yield and manage your staking positions effortlessly.",
      imageSrc: "/landing/agents/staking-agent.png",
      imageAlt: "Staking Agent Interface",
      className: "h-[400px]",
    },
    {
      title: "Liquidity Agent",
      description:
        "Ensure your tokens always have the right flow and safety in the liquidity pools.",
      imageSrc: "/landing/agents/liquidity-agent.png",
      imageAlt: "Liquidity Agent Interface",
      bgImageSrc: "/landing/agents/liquidity-agent-bg.png",
      className: "h-[400px]",
    },
    {
      title: "Trade Agent",
      description:
        "Your dedicated assistant for executing seamless token swaps and trades.",
      imageSrc: "/landing/agents/trade-agent.png",
      imageAlt: "Trade Agent Interface",
      className: "h-[400px]",
    },
  ];

  return (
    <div
      id="agents"
      className="relative z-[30] flex flex-col items-center justify-start gap-12 px-4 max-w-7xl mx-auto pt-32 text-white"
    >
      <SectionHeader
        title="Meet the Agents"
        description="Supercharge your crypto game with powerful agents built for every trader and investor—from newbies to veterans. And this is just the start: new, game-changing agents are coming in hot!"
        titleSize="md"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full">
        {agents.slice(0, 2).map((agent) => (
          <AgentCard
            key={agent.title}
            title={agent.title}
            description={agent.description}
            imageSrc={agent.imageSrc}
            imageAlt={agent.imageAlt}
            bgImageSrc={agent.bgImageSrc}
            textBelow={agent.textBelow}
            className={agent.className}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {agents.slice(2).map((agent) => (
          <AgentCard
            key={agent.title}
            title={agent.title}
            description={agent.description}
            imageSrc={agent.imageSrc}
            imageAlt={agent.imageAlt}
            bgImageSrc={agent.bgImageSrc}
            className={agent.className}
          />
        ))}
      </div>

      <div className="mt-8 text-center text-lg text-gray-300">
        More agents are coming soon—rapid updates ahead!
      </div>
    </div>
  );
}
