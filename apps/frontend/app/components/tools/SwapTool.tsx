"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  ArrowRightLeft,
  ChevronDown,
  Search,
  Wallet,
  X,
} from "lucide-react";
import { useWallet } from "../../hooks/wallet";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "../../store/notificationStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { VersionedTransaction, Connection, PublicKey } from "@solana/web3.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// Common tokens with metadata
const COMMON_TOKENS = [
  {
    symbol: "SOL",
    name: "Solana",
    address: "So11111111111111111111111111111111111111112",
    decimals: 9,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  },
  {
    symbol: "BONK",
    name: "Bonk",
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    decimals: 5,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png",
  },
  {
    symbol: "WIF",
    name: "Woof",
    address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm/logo.png",
  },
];

interface TokenData {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI?: string;
}

const formSchema = z.object({
  inputAmount: z.number().positive("Input amount must be positive"),
  inputToken: z.string().min(1, "Input token is required"),
  outputToken: z.string().min(1, "Output token is required"),
  slippageBps: z.number().min(1).max(1000, "Must be between 1 and 1000 BPS"),
});

interface QuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
  }>;
  contextSlot: number;
  timeTaken: number;
}

interface SwapResult {
  status: "success" | "error" | "cancelled";
  message: string;
  data?: {
    signature: string;
    txUrl: string;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

interface SwapToolProps {
  args: {
    inputAmount?: number;
    inputMint?: string;
    outputMint?: string;
    slippageBps?: number;
  };
  onSubmit: (result: SwapResult) => void;
}

function TokenSelectButton({
  token,
  onClick,
  amount = null,
  showAmount = false,
  className = "",
  isLoading = false,
}: {
  token: TokenData | null;
  onClick: () => void;
  amount?: number | null;
  showAmount?: boolean;
  className?: string;
  isLoading?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between gap-2 h-[72px] px-4",
        "hover:bg-muted/50 border-2",
        "bg-gradient-to-r from-background to-muted/30",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {token?.logoURI ? (
          <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-destructive/20">
            <Image
              src={token.logoURI}
              alt={token.symbol}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center ring-2 ring-destructive/20">
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
        <div className="text-left">
          <p className="font-semibold text-lg">
            {isLoading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              token?.symbol || "Select Token"
            )}
          </p>
          {token?.name && (
            <p className="text-sm text-muted-foreground">{token.name}</p>
          )}
        </div>
      </div>
      {showAmount && (
        <div className="text-right">
          {isLoading ? (
            <Skeleton className="h-7 w-24" />
          ) : amount !== null ? (
            <p className="text-lg font-medium">
              {amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              })}
            </p>
          ) : (
            <p className="text-lg font-medium text-muted-foreground">0.00</p>
          )}
        </div>
      )}
    </Button>
  );
}

function TokenSearchDialog({
  isOpen,
  onClose,
  onSelect,
  excludeToken,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: TokenData) => void;
  excludeToken?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TokenData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [tokenList, setTokenList] = useState<Record<string, TokenData>>({});

  useEffect(() => {
    const fetchTokenList = async () => {
      try {
        const response = await fetch("https://token.jup.ag/strict");
        const data = await response.json();
        setTokenList(data);
      } catch (error) {
        console.error("Error fetching token list:", error);
      }
    };
    fetchTokenList();
  }, []);

  useEffect(() => {
    const searchTokens = async () => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) {
        setSearchResults(COMMON_TOKENS);
        return;
      }

      setIsSearching(true);
      try {
        if (query.length === 44) {
          try {
            new PublicKey(query);
            const token = tokenList[query];
            if (token) {
              setSearchResults([token]);
              setIsSearching(false);
              return;
            }
          } catch {}
        }

        const results = Object.values(tokenList).filter(
          (token) =>
            token.symbol.toLowerCase().includes(query) ||
            token.name.toLowerCase().includes(query)
        );
        setSearchResults(results);
      } catch (error) {
        console.error("Token search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchTokens, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, tokenList]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, symbol, or address"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Common tokens</Label>
            <div className="grid grid-cols-4 gap-2">
              {COMMON_TOKENS.map((token) => (
                <Button
                  key={token.address}
                  variant="outline"
                  className="h-auto py-2"
                  disabled={token.address === excludeToken}
                  onClick={() => onSelect(token)}
                >
                  {token.symbol}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <ScrollArea className="h-[300px] pr-4">
            {isSearching ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg"
                  >
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((token) => (
                  <Button
                    key={token.address}
                    variant="ghost"
                    className="w-full justify-start h-auto py-3"
                    disabled={token.address === excludeToken}
                    onClick={() => onSelect(token)}
                  >
                    <div className="flex items-center gap-3">
                      {token.logoURI && (
                        <div className="relative w-8 h-8 rounded-full overflow-hidden">
                          <Image
                            src={token.logoURI}
                            alt={token.symbol}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{token.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {token.name}
                        </p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No tokens found
              </p>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SwapTool({ args, onSubmit }: SwapToolProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionError, setTransactionError] = useState<string>("");
  const [inputTokenData, setInputTokenData] = useState<TokenData>(
    COMMON_TOKENS[0]
  );
  const [outputTokenData, setOutputTokenData] = useState<TokenData>(
    COMMON_TOKENS[1]
  );
  const [quotePrice, setQuotePrice] = useState<number | null>(null);
  const [priceImpact, setPriceImpact] = useState<number | null>(null);
  const [isSelectingInput, setIsSelectingInput] = useState(false);
  const [isSelectingOutput, setIsSelectingOutput] = useState(false);
  const { wallet, sendTransaction } = useWallet();
  const { addNotification } = useNotificationStore();
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [quoteResponse, setQuoteResponse] = useState<QuoteResponse | null>(
    null
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputAmount: args.inputAmount || 0,
      inputToken: args.inputMint || COMMON_TOKENS[0].address,
      outputToken: args.outputMint || COMMON_TOKENS[1].address,
      slippageBps: args.slippageBps || 50,
    },
  });

  const connection = new Connection(
    "https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY_HERE"
  );

  const fetchQuote = useCallback(async () => {
    const amount = form.getValues("inputAmount");
    if (!amount || amount <= 0) return;

    setIsLoadingQuote(true);
    try {
      const scaledAmount = Math.floor(
        amount * Math.pow(10, inputTokenData.decimals)
      );

      const response = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${
          inputTokenData.address
        }&outputMint=${
          outputTokenData.address
        }&amount=${scaledAmount}&slippageBps=${form.getValues("slippageBps")}`
      );

      if (!response.ok) throw new Error("Failed to fetch quote");

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const outAmount =
        Number(data.outAmount) / Math.pow(10, outputTokenData.decimals);
      setQuotePrice(outAmount);
      setQuoteResponse(data);

      if (data.priceImpactPct) {
        setPriceImpact(Number(data.priceImpactPct));
      }
    } catch (error) {
      console.error("Error fetching quote:", error);
      setQuotePrice(null);
      setPriceImpact(null);
      addNotification(
        "error",
        "Quote Error",
        "Failed to fetch swap quote. Please try again."
      );
    } finally {
      setIsLoadingQuote(false);
    }
  }, [form, inputTokenData, outputTokenData, addNotification]);

  const inputAmount = form.watch("inputAmount");
  useEffect(() => {
    const debounce = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounce);
  }, [fetchQuote, inputAmount]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setTransactionError("");

    if (!wallet?.address) {
      addNotification(
        "error",
        "Wallet Not Connected",
        "Please connect your wallet to continue."
      );
      onSubmit({
        status: "error",
        message:
          "Wallet not connected. Please connect your wallet to continue.",
        error: {
          code: "WALLET_NOT_CONNECTED",
          message: "Wallet not connected",
        },
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const { swapTransaction } = await (
        await fetch("https://quote-api.jup.ag/v6/swap", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quoteResponse,
            userPublicKey: wallet.address.toString(),
            wrapAndUnwrapSol: true,
          }),
        })
      ).json();

      const swapTransactionBuf = Buffer.from(swapTransaction, "base64");
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      const { signature } = await sendTransaction(transaction, {
        skipPreflight: false,
        maxRetries: 2,
      });

      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature,
      });

      onSubmit({
        status: "success",
        message: "Swap executed successfully!",
        data: {
          signature,
          txUrl: `https://solscan.io/tx/${signature}`,
        },
      });
    } catch (error) {
      console.error("Swap error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to execute swap";
      onSubmit({
        status: "error",
        message: "Failed to execute swap. Please try again.",
        error: {
          code: "SWAP_ERROR",
          message: errorMessage,
          details: error,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchTokens = () => {
    const currentInput = inputTokenData;
    const currentOutput = outputTokenData;
    setInputTokenData(currentOutput);
    setOutputTokenData(currentInput);
    form.setValue("inputToken", currentOutput.address);
    form.setValue("outputToken", currentInput.address);
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-background p-6">
      <div className="flex items-center justify-center mb-6">
        <h2 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 flex items-center gap-2">
          <ArrowRightLeft className="w-6 h-6 text-primary" />
          Swap Tokens
        </h2>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label>
            From <span className="text-destructive">*</span>
          </Label>
          <div className="relative bg-gradient-to-r from-primary/5 to-background rounded-lg p-4 border border-primary/10">
            <TokenSelectButton
              token={inputTokenData}
              onClick={() => setIsSelectingInput(true)}
              amount={null}
              showAmount={false}
              className="border-primary/20 hover:border-primary/40"
            />
            <Input
              type="number"
              step="any"
              {...form.register("inputAmount", { valueAsNumber: true })}
              className={cn(
                "absolute right-8 top-1/2 -translate-y-1/2 w-[120px] text-right bg-transparent border-none text-lg font-medium",
                form.formState.errors.inputAmount && "text-destructive"
              )}
              placeholder="0.00"
            />
          </div>
          {form.formState.errors.inputAmount && (
            <p className="text-sm text-destructive px-2">
              {form.formState.errors.inputAmount.message}
            </p>
          )}
        </div>

        <div className="relative flex justify-center">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={switchTokens}
            className="absolute -translate-y-1/2 bg-gradient-to-br from-background to-primary/5 shadow-xl rounded-full p-2 hover:bg-muted/50 z-10 text-primary hover:text-primary/80 border-2 border-primary/20"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label>
            To <span className="text-destructive">*</span>
          </Label>
          <div className="relative bg-gradient-to-r from-primary/5 to-background rounded-lg p-4 border border-primary/10">
            <TokenSelectButton
              token={outputTokenData}
              onClick={() => setIsSelectingOutput(true)}
              amount={quotePrice}
              showAmount={true}
              isLoading={isLoadingQuote}
              className="border-primary/20 hover:border-primary/40"
            />
          </div>
        </div>

        {quotePrice !== null && (
          <div className="space-y-2 p-4 bg-gradient-to-r from-primary/5 to-background rounded-lg text-sm border border-primary/10">
            <div className="flex justify-between text-muted-foreground">
              <span>Rate</span>
              <span>
                1 {inputTokenData.symbol} ≈{" "}
                {(quotePrice / form.getValues("inputAmount")).toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                  }
                )}{" "}
                {outputTokenData.symbol}
              </span>
            </div>
            {priceImpact !== null && (
              <div className="flex justify-between text-muted-foreground">
                <span>Price Impact</span>
                <span
                  className={cn(
                    priceImpact > 5
                      ? "text-destructive"
                      : priceImpact > 3
                        ? "text-yellow-500"
                        : "text-green-500"
                  )}
                >
                  {priceImpact.toFixed(2)}%
                </span>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <span>Slippage Tolerance</span>
              <span>{(form.getValues("slippageBps") / 100).toFixed(2)}%</span>
            </div>
          </div>
        )}

        {transactionError && (
          <p className="text-sm text-destructive bg-destructive/10 p-3 rounded">
            {transactionError}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Button
            type="submit"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg"
            disabled={isSubmitting || !quotePrice}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Swapping...
              </>
            ) : !wallet?.address ? (
              <>
                <Wallet className="mr-2 h-5 w-5" />
                Connect Wallet
              </>
            ) : !quotePrice ? (
              "Enter an amount"
            ) : (
              <>
                <ArrowRightLeft className="mr-2 h-5 w-5" />
                Swap
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              onSubmit({
                status: "cancelled",
                message: "Swap cancelled by user",
              });
            }}
            disabled={isSubmitting}
            className="border-2 border-primary/20 bg-gradient-to-r from-background to-primary/5 hover:bg-primary/10"
          >
            <X className="mr-2 h-5 w-5" />
            Cancel
          </Button>
        </div>
      </form>

      <TokenSearchDialog
        isOpen={isSelectingInput}
        onClose={() => setIsSelectingInput(false)}
        onSelect={(token) => {
          setInputTokenData(token);
          form.setValue("inputToken", token.address);
          setIsSelectingInput(false);
        }}
        excludeToken={outputTokenData.address}
      />

      <TokenSearchDialog
        isOpen={isSelectingOutput}
        onClose={() => setIsSelectingOutput(false)}
        onSelect={(token) => {
          setOutputTokenData(token);
          form.setValue("outputToken", token.address);
          setIsSelectingOutput(false);
        }}
        excludeToken={inputTokenData.address}
      />
    </Card>
  );
}
