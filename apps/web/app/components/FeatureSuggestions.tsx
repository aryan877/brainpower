import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRightLeft,
  ChevronRight,
  LogIn,
  RefreshCcw,
  Shield,
  Ticket,
  TrendingUp,
  Wallet,
} from "lucide-react";
import React from "react";

interface FeatureSuggestionsProps {
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  authenticated: boolean;
  needsWalletSetup: boolean;
  login: () => void;
}

const FeatureSuggestions: React.FC<FeatureSuggestionsProps> = ({
  handleInputChange,
  authenticated,
  needsWalletSetup,
  login,
}) => {
  const scenes = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Market Data",
      queries: [
        "Show me trending tokens on CoinGecko",
        "What's the price of SOL right now?",
        "Get me a price chart for [token symbol]",
      ],
    },
    {
      icon: <RefreshCcw className="h-8 w-8" />,
      title: "Trading & Swaps",
      queries: [
        "Find the best rate to swap [token A] for [token B]",
        "Swap 1 SOL for [token symbol]",
        "Get detailed information about [token address]",
      ],
    },
    {
      icon: <Wallet className="h-8 w-8" />,
      title: "Wallet Management",
      queries: [
        "Show my wallet balances and tokens",
        "Transfer 0.5 SOL to [recipient address]",
        "Close my empty token accounts",
      ],
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Token Analytics",
      queries: [
        "Run a rugcheck on [token address]",
        "Show me the top holders of [token symbol or address]",
        "Analyze this PumpFun token [token address]",
      ],
    },
    {
      icon: <Ticket className="h-8 w-8" />,
      title: "Token Creation",
      queries: [
        "Help me launch a token with PumpFun",
        "Show current Solana network TPS",
        "What's needed to create a SPL token?",
      ],
    },
    {
      icon: <ArrowRightLeft className="h-8 w-8" />,
      title: "Cross-Chain Bridge (deBridge)",
      queries: [
        "Bridge 100 USDC from Solana to Ethereum using deBridge",
        "Show me supported bridge destinations via deBridge",
        "Check the status of my deBridge transaction [tx hash]",
      ],
      tooltip:
        "Bridge tokens between chains using deBridge, check status, explore options",
    },
  ];

  return (
    <div className="h-full pt-6">
      <div className="text-center max-w-3xl mx-auto space-y-4 px-4">
        <div className="relative">
          <h3 className="text-lg font-semibold gradient-text mb-2">
            Your Solana AI Assistant
          </h3>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Explore market data, trading, wallet management, and more
          </p>
        </div>

        {/* Visual Scenes Grid */}
        <div
          className={cn(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
          )}
        >
          {scenes.map((scene, sceneIndex) => (
            <div
              key={sceneIndex}
              className={cn(
                "relative rounded-xl p-4 border border-border/40 transition-all duration-200 cursor-pointer bg-card",
                "hover:border-border/60 hover:bg-muted/20"
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg text-primary">{scene.icon}</div>
                <h4 className="font-medium">{scene.title}</h4>
              </div>

              <ul className="space-y-2 text-sm text-left">
                {scene.queries.map((query, queryIndex) => (
                  <li
                    key={queryIndex}
                    className="flex items-center cursor-pointer hover:text-primary transition-colors py-1.5 px-3 rounded-lg hover:bg-muted/50"
                    onClick={() =>
                      handleInputChange({
                        target: { value: query },
                      } as React.ChangeEvent<HTMLTextAreaElement>)
                    }
                  >
                    <span className="h-1.5 w-1.5 bg-primary/70 rounded-full mr-2 flex-shrink-0"></span>
                    {query}
                  </li>
                ))}
              </ul>

              {scene.tooltip && (
                <div className="mt-3 pt-2 border-t border-border/20 text-xs text-left text-muted-foreground">
                  <div className="flex items-start">
                    <ChevronRight className="h-3 w-3 mt-0.5 mr-1 text-primary/50 flex-shrink-0" />
                    <span>{scene.tooltip}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Command Examples */}
        <div className="mt-6 text-sm text-muted-foreground px-4 py-4 bg-primary/5 rounded-xl border border-primary/10">
          <p className="mb-2 font-medium text-primary/80">
            Try complex commands like:
          </p>
          <p>
            &quot;Compare prices for SOL, JUP and BONK&quot; or &quot;Bridge 0.5
            SOL to Ethereum and show me status&quot;
          </p>
        </div>

        {/* Add login prompt if not authenticated, but no wallet setup button */}
        {!authenticated ? (
          <div className="mt-6 px-4">
            <Button
              onClick={login}
              className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-primary/80"
            >
              <LogIn className="h-4 w-4" />
              Login to Start Chatting
            </Button>
            <p className="text-xs text-muted-foreground mt-3">
              You will need to login to interact with the agent.
            </p>
          </div>
        ) : needsWalletSetup ? (
          <div className="mt-6 px-4">
            <p className="text-sm text-muted-foreground">
              Please set up your wallet in the sidebar to start chatting.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FeatureSuggestions;
