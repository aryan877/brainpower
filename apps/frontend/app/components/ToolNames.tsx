import { cn } from "@/lib/utils";
import { ACTION_NAMES } from "@repo/brainpower-agent";
import {
  Sparkles,
  ArrowRightLeft,
  Search,
  Wallet,
  Users,
  LineChart,
  ShieldAlert,
  Send,
  Coins,
  CircleDollarSign,
  Gauge,
  Download,
  Trash,
  AlertCircle,
  Bot,
  Twitter,
  TrendingUp,
  MessageCircle,
} from "lucide-react";
import React from "react";

interface ToolNamesProps {
  toolNames: string[];
  className?: string;
}

const TOOL_DISPLAY_CONFIG: Record<
  string,
  { icon: React.ReactNode; label: string }
> = {
  [ACTION_NAMES.LAUNCH_PUMPFUN_TOKEN]: {
    icon: <Sparkles className="w-3 h-3" />,
    label: "Launch Token",
  },
  [ACTION_NAMES.GET_TOKEN_DATA_BY_TICKER]: {
    icon: <Search className="w-3 h-3" />,
    label: "Token Search",
  },
  [ACTION_NAMES.GET_TOKEN_DATA_BY_ADDRESS]: {
    icon: <Wallet className="w-3 h-3" />,
    label: "Token Info",
  },
  [ACTION_NAMES.JUPITER_SWAP]: {
    icon: <ArrowRightLeft className="w-3 h-3" />,
    label: "Swap",
  },
  [ACTION_NAMES.GET_TOKEN_TOP_HOLDERS]: {
    icon: <Users className="w-3 h-3" />,
    label: "Top Holders",
  },
  [ACTION_NAMES.GET_TOKEN_CHART_ADDRESS]: {
    icon: <LineChart className="w-3 h-3" />,
    label: "Chart",
  },
  [ACTION_NAMES.RUGCHECK_BY_ADDRESS]: {
    icon: <ShieldAlert className="w-3 h-3" />,
    label: "Rugcheck",
  },
  [ACTION_NAMES.TRANSFER]: {
    icon: <Send className="w-3 h-3" />,
    label: "Transfer",
  },
  [ACTION_NAMES.GET_TOKEN_BALANCES]: {
    icon: <Coins className="w-3 h-3" />,
    label: "Token Balances",
  },
  [ACTION_NAMES.GET_BALANCE]: {
    icon: <CircleDollarSign className="w-3 h-3" />,
    label: "SOL Balance",
  },
  [ACTION_NAMES.GET_BALANCE_OTHER]: {
    icon: <Wallet className="w-3 h-3" />,
    label: "Other Balance",
  },
  [ACTION_NAMES.GET_TPS]: {
    icon: <Gauge className="w-3 h-3" />,
    label: "Network TPS",
  },
  [ACTION_NAMES.REQUEST_FAUCET_FUNDS]: {
    icon: <Download className="w-3 h-3" />,
    label: "Faucet",
  },
  [ACTION_NAMES.CLOSE_EMPTY_TOKEN_ACCOUNTS]: {
    icon: <Trash className="w-3 h-3" />,
    label: "Close Empty",
  },
  [ACTION_NAMES.ASK_FOR_CONFIRMATION]: {
    icon: <AlertCircle className="w-3 h-3" />,
    label: "Confirmation",
  },
  // Cookie3 Tool Names
  [ACTION_NAMES.GET_AGENT_BY_TWITTER]: {
    icon: <Twitter className="w-3 h-3" />,
    label: "Agent by Twitter",
  },
  [ACTION_NAMES.GET_AGENT_BY_CONTRACT]: {
    icon: <Bot className="w-3 h-3" />,
    label: "Agent by Contract",
  },
  [ACTION_NAMES.GET_TOP_AGENTS]: {
    icon: <TrendingUp className="w-3 h-3" />,
    label: "Top Agents",
  },
  [ACTION_NAMES.SEARCH_TWEETS]: {
    icon: <MessageCircle className="w-3 h-3" />,
    label: "Search Tweets",
  },
};

export function ToolNames({ toolNames, className }: ToolNamesProps) {
  if (!toolNames.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {toolNames.map((name, index) => {
        const config = TOOL_DISPLAY_CONFIG[name];
        if (!config) return null;

        return (
          <div
            key={index}
            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-primary/5 text-primary/90 border border-primary/10 hover:bg-primary/10 transition-colors"
            title={name}
          >
            {config.icon}
            <span>{config.label}</span>
          </div>
        );
      })}
    </div>
  );
}
