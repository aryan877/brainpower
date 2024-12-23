import { useState } from "react";

interface Template {
  category: string;
  name: string;
  description: string;
  template: string;
}

const templates: Template[] = [
  // Wallet & Balance Operations
  {
    category: "Wallet & Balance",
    name: "Check SOL Balance",
    description: "Get your SOL balance",
    template: "Check my SOL balance",
  },
  {
    category: "Wallet & Balance",
    name: "Check Token Balance",
    description: "Get balance of any SPL token",
    template: "Check my balance for token {TOKEN_MINT}",
  },
  {
    category: "Wallet & Balance",
    name: "Get Wallet Address",
    description: "Get your wallet address",
    template: "What's my wallet address?",
  },
  {
    category: "Wallet & Balance",
    name: "Request Test SOL",
    description: "Get test SOL from faucet",
    template: "Request {AMOUNT_SOL} SOL from faucet",
  },
  {
    category: "Wallet & Balance",
    name: "Send Transfer",
    description: "Send SOL or tokens",
    template: "Send {AMOUNT} {TOKEN_MINT} to {TO_ADDRESS}",
  },

  // NFT Operations
  {
    category: "NFT",
    name: "Create NFT Collection",
    description: "Create new NFT collection",
    template:
      "Create NFT collection named {NAME} with {ROYALTY_BPS} royalty and URI {URI}",
  },
  {
    category: "NFT",
    name: "Mint NFT",
    description: "Mint NFT to collection",
    template:
      "Mint NFT named {NAME} with URI {URI} to collection {COLLECTION_MINT}",
  },
  {
    category: "NFT",
    name: "Generate NFT Image",
    description: "Create image using DALL-E",
    template: "Generate image with prompt: {PROMPT}",
  },

  // Token Operations
  {
    category: "Tokens",
    name: "Deploy Token",
    description: "Create new SPL token",
    template: "Deploy token named {NAME} with URI {URI} and symbol {SYMBOL}",
  },
  {
    category: "Tokens",
    name: "Get Token Info",
    description: "Get token details",
    template: "Get token data for {TOKEN_ADDRESS}",
  },
  {
    category: "Tokens",
    name: "Launch on Pump.fun",
    description: "Launch token on Pump.fun",
    template:
      "Launch token on Pump.fun named {TOKEN_NAME} with ticker {TOKEN_TICKER}, description {DESCRIPTION}, and image {IMAGE_URL}",
  },

  // DeFi & Trading
  {
    category: "DeFi",
    name: "Swap Tokens",
    description: "Trade tokens via Jupiter",
    template: "Swap {INPUT_AMOUNT} {INPUT_MINT} for {OUTPUT_MINT}",
  },
  {
    category: "DeFi",
    name: "Lend USDC",
    description: "Lend on Lulo protocol",
    template: "Lend {AMOUNT} USDC",
  },
  {
    category: "DeFi",
    name: "Get Price",
    description: "Get Pyth price data",
    template: "Get price for {PRICE_FEED_ID}",
  },

  // Staking
  {
    category: "Staking",
    name: "Stake SOL",
    description: "Stake SOL for rewards",
    template: "Stake {AMOUNT} SOL",
  },
  {
    category: "Staking",
    name: "Stake with Jupiter",
    description: "Stake for jupSOL",
    template: "Stake {AMOUNT} SOL with Jupiter",
  },

  // Liquidity Pools
  {
    category: "Liquidity",
    name: "Create Orca Whirlpool",
    description: "Create Orca pool",
    template:
      "Create Orca Whirlpool with {DEPOSIT_TOKEN_AMOUNT} {DEPOSIT_TOKEN_MINT} and {OTHER_TOKEN_MINT} at price {INITIAL_PRICE}",
  },
  {
    category: "Liquidity",
    name: "Create Raydium AMM",
    description: "Create Raydium AMM V4",
    template:
      "Create Raydium AMM V4 pool for market {MARKET_ID} with {BASE_AMOUNT} base and {QUOTE_AMOUNT} quote",
  },
  {
    category: "Liquidity",
    name: "Create Raydium CLMM",
    description: "Create concentrated pool",
    template:
      "Create Raydium CLMM pool for {TOKEN_MINT_A} and {TOKEN_MINT_B} with config {CONFIG_ID} at price {INITIAL_PRICE}",
  },

  // Utility
  {
    category: "Utility",
    name: "Check TPS",
    description: "Get Solana TPS",
    template: "What's the current TPS?",
  },
  {
    category: "Utility",
    name: "Register Domain",
    description: "Register .sol domain",
    template: "Register domain {DOMAIN} with {SPACE_KB}KB storage",
  },
];

interface TemplatesPanelProps {
  onSelectTemplate: (template: string) => void;
  onClose: () => void;
}

export default function TemplatesPanel({
  onSelectTemplate,
  onClose,
}: TemplatesPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(templates.map((t) => t.category)));

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.template.toLowerCase().includes(searchTerm.toLowerCase());

    return (
      matchesSearch &&
      (!selectedCategory || template.category === selectedCategory)
    );
  });

  return (
    <div className="absolute left-4 right-4 bottom-[88px] bg-[var(--background-secondary)] backdrop-blur-xl rounded-lg shadow-2xl p-4 max-h-[70vh] overflow-hidden flex flex-col z-[99999] border border-[var(--border-color)]">
      <div className="sticky top-0 bg-[var(--background-secondary)] pt-2 pb-4 z-[99999] border-b border-[var(--border-color)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Templates
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--background)] rounded-full transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-[var(--text-secondary)]"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <input
          type="text"
          placeholder="Search templates..."
          className="w-full p-2 rounded-md bg-[var(--background)] text-[var(--text-primary)] border border-[var(--border-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-sm ${
              !selectedCategory
                ? "bg-blue-500 text-white"
                : "bg-[var(--background)] text-[var(--text-secondary)]"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedCategory === category
                  ? "bg-blue-500 text-white"
                  : "bg-[var(--background)] text-[var(--text-secondary)]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-[var(--border-color)] scrollbar-track-transparent bg-[var(--background-secondary)]">
        {filteredTemplates.map((template, index) => (
          <div
            key={index}
            className="bg-[var(--background)] p-3 rounded-lg cursor-pointer"
          >
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-medium text-[var(--text-primary)]">
                {template.name}
              </h3>
              <span className="text-xs px-2 py-1 rounded-full bg-[var(--background-secondary)] text-[var(--text-secondary)]">
                {template.category}
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              {template.description}
            </p>
            <div className="text-sm font-mono p-2 rounded bg-[var(--background-secondary)] text-[var(--text-primary)]">
              {template.template}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTemplate(template.template);
                }}
              >
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
